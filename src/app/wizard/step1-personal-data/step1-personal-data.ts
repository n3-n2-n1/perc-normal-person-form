import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WizardService, PersonalData } from '../../services/wizard';

@Component({
  selector: 'app-step1-personal-data',
  standalone: false,
  templateUrl: './step1-personal-data.html',
  styleUrl: './step1-personal-data.css',
})
export class Step1PersonalData implements OnInit {
  personalDataForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wizardService: WizardService
  ) {
    this.personalDataForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
    });
  }

  ngOnInit(): void {
    // Load existing data if available
    const wizardData = this.wizardService.getWizardData();
    if (wizardData.personalData.nombre || wizardData.personalData.apellido) {
      this.personalDataForm.patchValue(wizardData.personalData);
    }

    // Save data on form changes
    this.personalDataForm.valueChanges.subscribe(value => {
      if (this.personalDataForm.valid) {
        this.wizardService.updatePersonalData(value);
      }
    });
  }

  get nombre() { return this.personalDataForm.get('nombre'); }
  get apellido() { return this.personalDataForm.get('apellido'); }
  get email() { return this.personalDataForm.get('email'); }
  get telefono() { return this.personalDataForm.get('telefono'); }
}
