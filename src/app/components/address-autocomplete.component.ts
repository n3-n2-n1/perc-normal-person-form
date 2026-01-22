import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of } from 'rxjs';
import { SelectOption } from '../types/types';
import { AddressAutocompleteService } from '../services/address-autocomplete.service';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative" #dropdownRef>
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
          <div class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg bg-gray-900/95 border border-gray-700/50 backdrop-blur-md shadow-lg custom-scrollbar">
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
        @if (isOpen && searchTerm && filteredOptions.length === 0 && !isLoading) {
          <div class="absolute z-50 w-full mt-1 rounded-lg bg-gray-900/95 border border-gray-700/50 backdrop-blur-md shadow-lg">
            <div class="px-4 py-2 text-gray-400 text-sm">
              No se encontraron direcciones
            </div>
          </div>
        }
        @if (isOpen && isLoading) {
          <div class="absolute z-50 w-full mt-1 rounded-lg bg-gray-900/95 border border-gray-700/50 backdrop-blur-md shadow-lg">
            <div class="px-4 py-2 text-gray-400 text-sm flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando direcciones...
            </div>
          </div>
        }
      </div>
      <div class="text-xs text-gray-500 bg-gray-800/30 px-3 py-2 rounded-md border border-gray-700/30 mt-2">
        <strong>Sugerencia:</strong> Escriba al menos 3 caracteres para buscar direcciones en Argentina.
        Puede escribir manualmente si no encuentra la dirección exacta.
      </div>
      @if (error) {
        <p class="mt-1 text-sm text-red-400">{{ error }}</p>
      }
      @if (isOpen) {
        <div
          class="fixed inset-0 z-40"
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
export class AddressAutocompleteComponent implements OnInit, OnDestroy {
  @Input() control!: FormControl;
  @Input() placeholder: string = 'Buscar dirección...';
  @Input() error: string | null = null;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  isOpen: boolean = false;
  searchTerm: string = '';
  filteredOptions: SelectOption[] = [];
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private addressService: AddressAutocompleteService
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length >= 3) {
          this.isLoading = true;
          return this.addressService.searchAddresses(term);
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(options => {
      this.filteredOptions = options;
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    // Suscribirse a cambios del control para sincronizar
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value && typeof value === 'string') {
        this.searchTerm = value;
      } else {
        this.searchTerm = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    // Actualizar el valor del control
    this.control.setValue(value, { emitEvent: true });

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  onFocus(): void {
    this.isOpen = true;

    // Marcar como touched cuando el usuario hace focus
    if (!this.control.touched) {
      this.control.markAsTouched();
    }

    // Si hay searchTerm y no hay opciones cargadas, buscar
    if (this.searchTerm && this.searchTerm.length >= 3 && this.filteredOptions.length === 0) {
      this.isLoading = true;
      this.addressService.searchAddresses(this.searchTerm).subscribe(options => {
        this.filteredOptions = options;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  onBlur(): void {
    const currentInputValue = this.inputElement?.nativeElement?.value || '';

    if (currentInputValue) {
      this.control.setValue(currentInputValue, { emitEvent: true });
      this.control.markAsTouched();
    } else {
      this.control.setValue('', { emitEvent: true });
      this.control.markAsTouched();
    }

    // Cerrar el dropdown después de un pequeño delay para permitir clicks
    setTimeout(() => {
      this.isOpen = false;
    }, 200);
  }

  handleSelect(value: string): void {
    // Guardar el value en el control
    this.control.setValue(value, { emitEvent: true });
    this.control.markAsTouched();
    this.control.markAsDirty();

    // Actualizar visualmente el input
    if (this.inputElement) {
      this.searchTerm = value;
      setTimeout(() => {
        if (this.inputElement?.nativeElement) {
          this.inputElement.nativeElement.value = value;
        }
        this.cdr.detectChanges();
      }, 0);
    }

    this.isOpen = false;
  }
}