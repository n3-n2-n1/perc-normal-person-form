import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WizardService } from '../../services/wizard';

@Component({
  selector: 'app-step2-documentation',
  standalone: false,
  templateUrl: './step2-documentation.html',
  styleUrl: './step2-documentation.css',
})
export class Step2Documentation implements OnInit {
  documentationForm: FormGroup;
  estadosCiviles = [
    'Soltero/a',
    'Casado/a',
    'Divorciado/a',
    'Viudo/a',
    'Separado/a',
    'Unión Civil',
    'Unión de Hecho'
  ];

  constructor(
    private fb: FormBuilder,
    private wizardService: WizardService
  ) {
    this.documentationForm = this.fb.group({
      cuit: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{8}-\d{1}$/)]],
      estadoCivil: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Load existing data if available
    const wizardData = this.wizardService.getWizardData();
    if (wizardData.documentationData.cuit || wizardData.documentationData.estadoCivil) {
      this.documentationForm.patchValue(wizardData.documentationData);
    }

    // Save data on form changes
    this.documentationForm.valueChanges.subscribe(value => {
      if (this.documentationForm.valid) {
        this.wizardService.updateDocumentationData(value);
      }
    });
  }

  get cuit() { return this.documentationForm.get('cuit'); }
  get estadoCivil() { return this.documentationForm.get('estadoCivil'); }

  formatCUIT(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 11) {
      value = value.substring(0, 11);
      value = `${value.substring(0, 2)}-${value.substring(2, 10)}-${value.substring(10)}`;
      this.documentationForm.patchValue({ cuit: value });
    }
  }
}
