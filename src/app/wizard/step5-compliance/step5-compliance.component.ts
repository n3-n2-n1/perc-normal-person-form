import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { WizardService } from '../../services/wizard';

@Component({
  selector: 'app-step5-compliance',
  standalone: false,
  templateUrl: './step5-compliance.component.html',
  styleUrl: './step5-compliance.component.css'
})
export class Step5ComplianceComponent implements OnInit {
  complianceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wizardService: WizardService
  ) {
    this.complianceForm = this.fb.group({
      // FATCA - Declaración Fiscal
      fatca: [false],
      fatcaOptions: this.fb.group({
        usCitizen: [false],
        foreignResident: [false],
        foreignCountry: ['']
      }),

      // PEP - Persona Expuesta Políticamente
      pep: [false],
      pepOptions: this.fb.group({
        isPep: [false],
        relatedToPep: [false],
        pepDetails: [''],
        familyMemberName: ['']
      }),

      // OCDE - Intercambio Automático de Información
      oecd: [false]
    });

    // Validaciones condicionales
    this.setupConditionalValidators();
  }

  ngOnInit(): void {
    // Load existing data if available
    const wizardData = this.wizardService.getWizardData();
    if (wizardData.complianceData) {
      this.complianceForm.patchValue(wizardData.complianceData);
    }

    // Save data on form changes
    this.complianceForm.valueChanges.subscribe(value => {
      if (this.complianceForm.valid) {
        this.wizardService.updateComplianceData(value);
      }
    });
  }

  private setupConditionalValidators(): void {
    // FATCA validations
    this.complianceForm.get('fatcaOptions.foreignResident')?.valueChanges.subscribe(foreignResident => {
      const foreignCountryControl = this.complianceForm.get('fatcaOptions.foreignCountry');
      if (foreignResident) {
        foreignCountryControl?.setValidators([Validators.required]);
      } else {
        foreignCountryControl?.clearValidators();
      }
      foreignCountryControl?.updateValueAndValidity();
    });

    // PEP validations
    this.complianceForm.get('pep')?.valueChanges.subscribe(pep => {
      this.updatePepValidations();
    });

    this.complianceForm.get('pepOptions.isPep')?.valueChanges.subscribe(() => {
      this.updatePepValidations();
    });

    this.complianceForm.get('pepOptions.relatedToPep')?.valueChanges.subscribe(() => {
      this.updatePepValidations();
    });

  }

  private updatePepValidations(): void {
    const pep = this.complianceForm.get('pep')?.value;
    const isPep = this.complianceForm.get('pepOptions.isPep')?.value;
    const relatedToPep = this.complianceForm.get('pepOptions.relatedToPep')?.value;
    const pepDetailsControl = this.complianceForm.get('pepOptions.pepDetails');
    const familyMemberNameControl = this.complianceForm.get('pepOptions.familyMemberName');

    if (pep && (isPep || relatedToPep)) {
      pepDetailsControl?.setValidators([Validators.required]);

      // Si está relacionado con PEP, también requerir nombre del familiar
      if (relatedToPep) {
        familyMemberNameControl?.setValidators([Validators.required]);
      } else {
        familyMemberNameControl?.clearValidators();
      }
    } else {
      pepDetailsControl?.clearValidators();
      familyMemberNameControl?.clearValidators();
    }

    pepDetailsControl?.updateValueAndValidity();
    familyMemberNameControl?.updateValueAndValidity();
  }

  get fatcaOptions(): FormGroup {
    return this.complianceForm.get('fatcaOptions') as FormGroup;
  }

  get pepOptions(): FormGroup {
    return this.complianceForm.get('pepOptions') as FormGroup;
  }
}