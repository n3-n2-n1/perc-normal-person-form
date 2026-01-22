import { Component, Input, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SelectOption } from '../types/types';

@Component({
  selector: 'app-autocomplete-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative overflow-visible" #dropdownRef>
      <div class="relative">
        <input
          type="text"
          #inputElement
          [formControl]="control"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="w-full px-4 py-3 input-base"
          [ngClass]="{'input-error': error}"
          [placeholder]="placeholder"
        />
        @if (isOpen && filteredOptions.length > 0) {
          <div class="absolute z-[9999] w-full mt-1 max-h-60 overflow-auto rounded-lg bg-gray-900/98 border border-gray-700/50 shadow-xl custom-scrollbar">
            @for (option of filteredOptions; track option.value) {
              <div
                (click)="handleSelect(option.value)"
                class="px-4 py-3 hover:bg-gray-800/60 cursor-pointer border-b border-gray-800/50 last:border-b-0 transition-colors duration-150 text-gray-200"
              >
                {{ option.label }}
              </div>
            }
          </div>
        }
        @if (isOpen && searchTerm && filteredOptions.length === 0) {
          <div class="absolute z-[9999] w-full mt-1 rounded-lg bg-gray-900/98 border border-gray-700/50 shadow-xl">
            <div class="px-4 py-2 text-gray-400 text-sm">
              No se encontraron resultados
            </div>
          </div>
        }
      </div>
      @if (error) {
        <p class="mt-1 text-sm text-red-400">{{ error }}</p>
      }
      @if (isOpen) {
        <div
          class="fixed inset-0 z-[9998]"
          (click)="isOpen = false"
        ></div>
      }
    </div>
  `,
  styles: [`
    .input-base {
      background: rgba(31, 41, 55, 0.8);
      border: 1px solid rgba(75, 85, 99, 0.3);
      border-radius: 0.5rem;
      color: #e5e7eb;
      transition: all 0.2s ease-in-out;
    }

    .input-base:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background: rgba(31, 41, 55, 0.9);
    }

    .input-error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(31, 41, 55, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(75, 85, 99, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(107, 114, 128, 0.7);
    }
  `]
})
export class AutocompleteSelectComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() control!: FormControl;
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Seleccione...';
  @Input() error: string | null = null;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  isOpen: boolean = false;
  searchTerm: string = '';
  filteredOptions: SelectOption[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Inicializar las opciones filtradas desde el principio
    this.filteredOptions = this.options;

    this.searchSubject.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filterOptions(term);
    });

    // Suscribirse a cambios del control para sincronizar
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.syncValueToDisplay(value);
    });
  }

  ngAfterViewInit(): void {
    // Inicializar el valor del control después de que la vista esté lista
    setTimeout(() => {
      this.initializeValue();
      // Asegurar que las clases CSS se apliquen correctamente
      if (this.inputElement?.nativeElement) {
        const input = this.inputElement.nativeElement;
        // Forzar la aplicación de clases asegurando que el elemento tenga las clases correctas
        input.classList.add('w-full', 'px-4', 'py-3', 'input-base');
        if (this.error) {
          input.classList.add('input-error');
        }
      }
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeValue(): void {
    const currentValue = this.control.value;
    if (currentValue) {
      this.syncValueToDisplay(currentValue);
      // Actualizar el input para mostrar el label si hay una opción seleccionada
      const selectedOption = this.options.find(o => o.value === currentValue);
      if (selectedOption && this.inputElement?.nativeElement) {
        // Usar setTimeout para asegurar que el ViewChild esté disponible
        setTimeout(() => {
          if (this.inputElement?.nativeElement) {
            this.inputElement.nativeElement.value = selectedOption.label;
          }
        }, 0);
      }
    } else {
      // Asegurarse de que el input esté vacío visualmente
      this.searchTerm = '';
    }
    // Asegurar que las opciones filtradas estén inicializadas
    if (this.filteredOptions.length === 0) {
      this.filteredOptions = this.options;
    }
  }

  private syncValueToDisplay(value: string | null): void {
    if (value) {
      const selectedOption = this.options.find(o => o.value === value);
      if (selectedOption) {
        // Si hay una opción seleccionada, mostrar el label en el input
        this.searchTerm = selectedOption.label;
      } else {
        // Si no coincide con ninguna opción, mostrar el valor tal cual
        this.searchTerm = value;
      }
    } else {
      this.searchTerm = '';
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    this.searchSubject.next(value);
    this.isOpen = true;

    // Marcar como touched y dirty cuando el usuario escribe
    if (!this.control.touched) {
      this.control.markAsTouched();
    }
    this.control.markAsDirty();

    // Verificar si el texto escrito coincide exactamente con algún label
    const exactMatch = this.options.find(o => o.label === value);
    if (exactMatch) {
      // Si el usuario escribió exactamente el label, guardar el value
      this.control.setValue(exactMatch.value, { emitEvent: true });
      // Actualizar el input para mostrar el label
      if (this.inputElement?.nativeElement) {
        this.inputElement.nativeElement.value = exactMatch.label;
      }
    } else {
      // Si no, guardar el valor tal cual (para permitir búsqueda)
      this.control.setValue(value, { emitEvent: true });
    }

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  onFocus(): void {
    this.isOpen = true;
    // Si no hay searchTerm, mostrar todas las opciones
    if (!this.searchTerm || this.searchTerm === '') {
      this.filteredOptions = this.options;
    } else {
      // Si hay searchTerm, filtrar
      this.filterOptions(this.searchTerm);
    }

    // Marcar como touched cuando el usuario hace focus
    if (!this.control.touched) {
      this.control.markAsTouched();
    }
  }

  onBlur(): void {
    // Cuando pierde el focus, verificar si el valor actual del input coincide con algún label o value
    const currentInputValue = this.inputElement?.nativeElement?.value || '';
    const currentControlValue = this.control.value || '';

    if (currentInputValue) {
      // Primero buscar por label exacto
      const matchingOptionByLabel = this.options.find(o => o.label === currentInputValue);
      if (matchingOptionByLabel) {
        // Si el usuario escribió un label válido, actualizar al value correspondiente
        this.control.setValue(matchingOptionByLabel.value, { emitEvent: true });
        this.searchTerm = matchingOptionByLabel.label;
        this.control.markAsTouched();
        this.control.markAsDirty();
      } else {
        // Buscar por value exacto
        const matchingOptionByValue = this.options.find(o => o.value === currentInputValue);
        if (matchingOptionByValue) {
          // Si coincide con un value, actualizar el searchTerm al label
          this.control.setValue(matchingOptionByValue.value, { emitEvent: true });
          this.searchTerm = matchingOptionByValue.label;
          this.control.markAsTouched();
          this.control.markAsDirty();
        } else {
          // Si no coincide con ninguna opción, verificar si el control tiene un value válido
          // Si el control tiene un value válido (de una selección previa), mantenerlo
          if (currentControlValue && this.options.find(o => o.value === currentControlValue)) {
            // El control tiene un value válido, mantenerlo y actualizar el display
            const validOption = this.options.find(o => o.value === currentControlValue);
            if (validOption && this.inputElement?.nativeElement) {
              this.inputElement.nativeElement.value = validOption.label;
              this.searchTerm = validOption.label;
            }
          } else {
            // Si no hay valor válido, limpiar el campo para forzar la selección
            // O mantener el valor escrito si el usuario quiere escribir libremente
            // Por ahora, mantenemos el valor escrito pero marcamos como touched para validación
            this.control.setValue(currentInputValue, { emitEvent: true });
            this.control.markAsTouched();
            this.control.markAsDirty();
          }
        }
      }
    } else {
      // Si el input está vacío, limpiar el control también
      if (currentControlValue) {
        this.control.setValue('', { emitEvent: true });
      }
      this.control.markAsTouched();
    }

    // Cerrar el dropdown después de un pequeño delay para permitir clicks
    setTimeout(() => {
      this.isOpen = false;
    }, 200);
  }

  filterOptions(term: string): void {
    if (!term.trim()) {
      this.filteredOptions = this.options;
    } else {
      const search = term.toLowerCase();
      this.filteredOptions = this.options.filter(
        option => option.label.toLowerCase().includes(search) ||
                 option.value.toLowerCase().includes(search)
      );
    }
  }

  handleSelect(value: string): void {
    // Encontrar la opción seleccionada para mostrar el label
    const selectedOption = this.options.find(o => o.value === value);
    // Guardar el value en el control (esto es lo que se valida)
    this.control.setValue(value, { emitEvent: true });
    this.control.markAsTouched();
    this.control.markAsDirty();

    // Actualizar visualmente el input para mostrar el label
    if (selectedOption && this.inputElement) {
      this.searchTerm = selectedOption.label;
      // Usar setTimeout para que Angular procese primero el cambio del FormControl
      setTimeout(() => {
        if (this.inputElement?.nativeElement) {
          this.inputElement.nativeElement.value = selectedOption.label;
        }
        this.cdr.detectChanges();
      }, 0);
    } else {
      this.searchTerm = value;
    }
    this.isOpen = false;
  }
}