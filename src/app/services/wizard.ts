import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PersonalData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface DocumentationData {
  cuit: string;
  estadoCivil: string;
}

export interface AddressData {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  // Computed field for backward compatibility
  direccion?: string;
}

export interface DocumentsData {
  dniFrente: File | null;
  dniDorso: File | null;
  selfie: File | null;
}

export interface ComplianceData {
  fatca: boolean;
  fatcaOptions: {
    usCitizen: boolean;
    foreignResident: boolean;
    foreignCountry: string;
  };
  pep: boolean;
  pepOptions: {
    isPep: boolean;
    relatedToPep: boolean;
    pepDetails: string;
    familyMemberName: string;
  };
  oecd: boolean;
}

export interface WizardData {
  personalData: PersonalData;
  documentationData: DocumentationData;
  addressData: AddressData;
  documentsData: DocumentsData;
  complianceData: ComplianceData;
  termsAccepted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WizardService {
  private currentStepSubject = new BehaviorSubject<number>(1);
  public currentStep$ = this.currentStepSubject.asObservable();

  private wizardData: WizardData = {
    personalData: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
    },
    documentationData: {
      cuit: '',
      estadoCivil: '',
    },
    addressData: {
      calle: '',
      numero: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
    },
    documentsData: {
      dniFrente: null,
      dniDorso: null,
      selfie: null,
    },
    complianceData: {
      fatca: false,
      fatcaOptions: {
        usCitizen: false,
        foreignResident: false,
        foreignCountry: '',
      },
      pep: false,
      pepOptions: {
        isPep: false,
        relatedToPep: false,
        pepDetails: '',
        familyMemberName: '',
      },
      oecd: false,
    },
    termsAccepted: false,
  };

  constructor() {}

  getCurrentStep(): number {
    return this.currentStepSubject.value;
  }

  setCurrentStep(step: number): void {
    this.currentStepSubject.next(step);
  }

  getWizardData(): WizardData {
    return { ...this.wizardData };
  }

  updatePersonalData(data: PersonalData): void {
    this.wizardData.personalData = { ...data };
  }

  updateDocumentationData(data: DocumentationData): void {
    this.wizardData.documentationData = { ...data };
  }

  updateAddressData(data: AddressData): void {
    this.wizardData.addressData = { ...data };
  }

  updateDocumentsData(data: Partial<DocumentsData>): void {
    this.wizardData.documentsData = { ...this.wizardData.documentsData, ...data };
  }

  updateComplianceData(data: ComplianceData): void {
    this.wizardData.complianceData = { ...data };
  }

  setTermsAccepted(accepted: boolean): void {
    this.wizardData.termsAccepted = accepted;
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        const pd = this.wizardData.personalData;
        return !!(pd.nombre && pd.apellido && pd.email && pd.telefono);
      case 2:
        const dd = this.wizardData.documentationData;
        return !!(dd.cuit && dd.estadoCivil);
      case 3:
        const ad = this.wizardData.addressData;
        return !!(ad.calle && ad.numero && ad.ciudad && ad.provincia && ad.codigoPostal);
      case 4:
        const doc = this.wizardData.documentsData;
        return !!(doc.dniFrente && doc.dniDorso && doc.selfie);
      case 5:
        // Compliance step is always valid (no mandatory fields, defaults to "No aplica")
        return true;
      case 6:
        return this.wizardData.termsAccepted;
      default:
        return false;
    }
  }

  reset(): void {
    this.setCurrentStep(1);
    this.wizardData = {
      personalData: {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
      },
      documentationData: {
        cuit: '',
        estadoCivil: '',
      },
      addressData: {
        calle: '',
        numero: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
      },
      documentsData: {
        dniFrente: null,
        dniDorso: null,
        selfie: null,
      },
      complianceData: {
        fatca: false,
        fatcaOptions: {
          usCitizen: false,
          foreignResident: false,
          foreignCountry: '',
        },
        pep: false,
        pepOptions: {
          isPep: false,
          relatedToPep: false,
          pepDetails: '',
          familyMemberName: '',
        },
        oecd: false,
      },
      termsAccepted: false,
    };
  }
}
