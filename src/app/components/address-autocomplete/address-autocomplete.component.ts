import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { NominatimResult } from '../../services/address-autocomplete.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-autocomplete.component.html',
  styleUrl: './address-autocomplete.component.css'
})
export class AddressAutocompleteComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() streetField: string = '';
  @Input() numberField: string = '';
  @Input() postalCodeField: string = '';
  @Input() cityField: string = '';
  @Input() provinceField: string = '';
  @Input() placeholder: string = 'Buscar dirección...';
  @Input() className: string = '';

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;

  suggestions: NominatimResult[] = [];
  isLoading: boolean = false;
  showSuggestions: boolean = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(500), // Aumentar el delay para evitar rate limiting
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchAddress(query);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as Node;
    
    if (
      this.dropdownRef?.nativeElement &&
      this.inputRef?.nativeElement &&
      !this.dropdownRef.nativeElement.contains(target) &&
      !this.inputRef.nativeElement.contains(target)
    ) {
      this.showSuggestions = false;
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.length >= 3) {
      this.searchSubject.next(value);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  onInputFocus(): void {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  async searchAddress(query: string): Promise<void> {
    if (query.length < 3) {
      this.suggestions = [];
      return;
    }

    this.isLoading = true;
    
    try {
      // Usar HttpParams para construir los parámetros de la query
      let params = new HttpParams()
        .set('q', query)
        .set('countrycodes', 'ar,uy,es,us')
        .set('format', 'json')
        .set('addressdetails', '1')
        .set('limit', '5')
        .set('accept-language', 'es');

      // Usar Nominatim directamente con delay para evitar rate limiting
      const url = `${environment.nominatimUrl}/search`;
      
      this.http.get<NominatimResult[]>(url, {
        params: params
      }).subscribe({
        next: (data) => {
          this.suggestions = data;
          this.showSuggestions = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al buscar dirección:', error);
          this.suggestions = [];
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error al buscar dirección:', error);
      this.suggestions = [];
      this.isLoading = false;
    }
  }

  handleSelectSuggestion(suggestion: NominatimResult): void {
    const address = suggestion.address;
    
    // Extraer datos
    const calle = address.road || '';
    const numero = address.house_number || '';
    const codigoPostal = address.postcode || '';
    const localidad = address.city || address.town || address.village || '';
    
    // Extraer provincia
    let provincia = '';
    if (address['ISO3166-2-lvl4']) {
      const provCode = address['ISO3166-2-lvl4'].split('-')[1];
      provincia = address.state || provCode;
    } else {
      provincia = address.state || '';
    }

    // Actualizar campos del formulario
    const streetControl = this.formGroup.get(this.streetField);
    const numberControl = this.formGroup.get(this.numberField);
    const postalCodeControl = this.formGroup.get(this.postalCodeField);
    const cityControl = this.formGroup.get(this.cityField);
    const provinceControl = this.formGroup.get(this.provinceField);

    // Actualizar valores y marcar como touched/dirty para validación
    if (streetControl) {
      streetControl.setValue(calle, { emitEvent: true });
      streetControl.markAsTouched();
      streetControl.markAsDirty();
    }
    if (numberControl) {
      numberControl.setValue(numero, { emitEvent: true });
      numberControl.markAsTouched();
      numberControl.markAsDirty();
    }
    if (postalCodeControl) {
      postalCodeControl.setValue(codigoPostal, { emitEvent: true });
      postalCodeControl.markAsTouched();
      postalCodeControl.markAsDirty();
    }
    if (cityControl) {
      cityControl.setValue(localidad, { emitEvent: true });
      cityControl.markAsTouched();
      cityControl.markAsDirty();
    }
    if (provinceControl) {
      provinceControl.setValue(provincia, { emitEvent: true });
      provinceControl.markAsTouched();
      provinceControl.markAsDirty();
    }

    // Actualizar el input con la dirección completa
    if (this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.value = suggestion.display_name;
    }

    this.showSuggestions = false;
    this.suggestions = [];
  }

  onMouseDown(event: MouseEvent): void {
    // Prevenir que el blur cierre el dropdown antes del click
    event.preventDefault();
  }
}

