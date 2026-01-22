import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { WizardService } from '../../services/wizard';
import { SelectOption } from '../../types/types';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';

@Component({
  selector: 'app-step3-address',
  standalone: false,
  templateUrl: './step3-address.html',
  styleUrl: './step3-address.css',
})
export class Step3Address implements OnInit {
  addressForm: FormGroup;
  provincias: SelectOption[] = [
    { value: 'Buenos Aires', label: 'Buenos Aires' },
    { value: 'Catamarca', label: 'Catamarca' },
    { value: 'Chaco', label: 'Chaco' },
    { value: 'Chubut', label: 'Chubut' },
    { value: 'Córdoba', label: 'Córdoba' },
    { value: 'Corrientes', label: 'Corrientes' },
    { value: 'Entre Ríos', label: 'Entre Ríos' },
    { value: 'Formosa', label: 'Formosa' },
    { value: 'Jujuy', label: 'Jujuy' },
    { value: 'La Pampa', label: 'La Pampa' },
    { value: 'La Rioja', label: 'La Rioja' },
    { value: 'Mendoza', label: 'Mendoza' },
    { value: 'Misiones', label: 'Misiones' },
    { value: 'Neuquén', label: 'Neuquén' },
    { value: 'Río Negro', label: 'Río Negro' },
    { value: 'Salta', label: 'Salta' },
    { value: 'San Juan', label: 'San Juan' },
    { value: 'San Luis', label: 'San Luis' },
    { value: 'Santa Cruz', label: 'Santa Cruz' },
    { value: 'Santa Fe', label: 'Santa Fe' },
    { value: 'Santiago del Estero', label: 'Santiago del Estero' },
    { value: 'Tierra del Fuego', label: 'Tierra del Fuego' },
    { value: 'Tucumán', label: 'Tucumán' }
  ];

  // Ciudades principales por provincia (ejemplo básico)
  ciudades: SelectOption[] = [
    // Buenos Aires
    { value: 'CABA', label: 'Ciudad Autónoma de Buenos Aires' },
    { value: 'La Plata', label: 'La Plata' },
    { value: 'Mar del Plata', label: 'Mar del Plata' },
    { value: 'Bahía Blanca', label: 'Bahía Blanca' },
    { value: 'Quilmes', label: 'Quilmes' },
    { value: 'Lanús', label: 'Lanús' },
    { value: 'Avellaneda', label: 'Avellaneda' },
    { value: 'Lomas de Zamora', label: 'Lomas de Zamora' },
    { value: 'Tigre', label: 'Tigre' },
    { value: 'San Fernando', label: 'San Fernando' },

    // Córdoba
    { value: 'Córdoba Capital', label: 'Córdoba Capital' },
    { value: 'Villa María', label: 'Villa María' },
    { value: 'Río Cuarto', label: 'Río Cuarto' },
    { value: 'San Francisco', label: 'San Francisco' },

    // Santa Fe
    { value: 'Rosario', label: 'Rosario' },
    { value: 'Santa Fe Capital', label: 'Santa Fe Capital' },

    // Mendoza
    { value: 'Mendoza Capital', label: 'Mendoza Capital' },
    { value: 'Godoy Cruz', label: 'Godoy Cruz' },
    { value: 'Maipú', label: 'Maipú' },

    // Tucumán
    { value: 'San Miguel de Tucumán', label: 'San Miguel de Tucumán' },

    // Salta
    { value: 'Salta Capital', label: 'Salta Capital' },

    // Chaco
    { value: 'Resistencia', label: 'Resistencia' },

    // Corrientes
    { value: 'Corrientes Capital', label: 'Corrientes Capital' },

    // Misiones
    { value: 'Posadas', label: 'Posadas' },

    // Entre Ríos
    { value: 'Paraná', label: 'Paraná' },
    { value: 'Concordia', label: 'Concordia' },

    // San Juan
    { value: 'San Juan Capital', label: 'San Juan Capital' },

    // Jujuy
    { value: 'San Salvador de Jujuy', label: 'San Salvador de Jujuy' },

    // Río Negro
    { value: 'Viedma', label: 'Viedma' },
    { value: 'Bariloche', label: 'Bariloche' },

    // Formosa
    { value: 'Formosa Capital', label: 'Formosa Capital' },

    // Neuquén
    { value: 'Neuquén Capital', label: 'Neuquén Capital' },

    // Chubut
    { value: 'Rawson', label: 'Rawson' },
    { value: 'Trelew', label: 'Trelew' },
    { value: 'Comodoro Rivadavia', label: 'Comodoro Rivadavia' },

    // San Luis
    { value: 'San Luis Capital', label: 'San Luis Capital' },

    // Catamarca
    { value: 'San Fernando del Valle de Catamarca', label: 'San Fernando del Valle de Catamarca' },

    // La Rioja
    { value: 'La Rioja Capital', label: 'La Rioja Capital' },

    // La Pampa
    { value: 'Santa Rosa', label: 'Santa Rosa' },

    // Santa Cruz
    { value: 'Río Gallegos', label: 'Río Gallegos' },

    // Santiago del Estero
    { value: 'Santiago del Estero Capital', label: 'Santiago del Estero Capital' },

    // Tierra del Fuego
    { value: 'Ushuaia', label: 'Ushuaia' },
    { value: 'Río Grande', label: 'Río Grande' }
  ];

  constructor(
    private fb: FormBuilder,
    private wizardService: WizardService
  ) {
    this.addressForm = this.fb.group({
      calle: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      ciudad: ['', [Validators.required, Validators.minLength(2)]],
      provincia: ['', Validators.required],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\-]{3,10}$/)]],
    });
  }

  ngOnInit(): void {
    // Load existing data if available
    const wizardData = this.wizardService.getWizardData();
    if (wizardData.addressData.direccion || wizardData.addressData.ciudad) {
      // Parse existing direccion into calle and numero if needed
      const addressData = { ...wizardData.addressData };
      if (addressData.direccion && !addressData.calle) {
        // Try to extract street and number from full address
        const parts = addressData.direccion.split(/\s+/);
        if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
          addressData.calle = parts.slice(0, -1).join(' ');
          addressData.numero = parts[parts.length - 1];
        } else {
          addressData.calle = addressData.direccion;
          addressData.numero = '';
        }
      }
      this.addressForm.patchValue(addressData);
    }

    // Save data on form changes
    this.addressForm.valueChanges.subscribe(value => {
      if (this.addressForm.valid) {
        // Combine calle and numero into direccion for wizard data
        const wizardData = {
          ...value,
          direccion: value.calle && value.numero ? `${value.calle} ${value.numero}` : value.calle || ''
        };
        this.wizardService.updateAddressData(wizardData);
      }
    });
  }

  get calle() { return this.addressForm.get('calle') as FormControl; }
  get numero() { return this.addressForm.get('numero') as FormControl; }
  get ciudad() { return this.addressForm.get('ciudad') as FormControl; }
  get provincia() { return this.addressForm.get('provincia') as FormControl; }
  get codigoPostal() { return this.addressForm.get('codigoPostal') as FormControl; }
}
