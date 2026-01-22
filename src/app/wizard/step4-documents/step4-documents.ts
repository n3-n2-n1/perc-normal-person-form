import { Component, OnInit } from '@angular/core';
import { WizardService } from '../../services/wizard';

@Component({
  selector: 'app-step4-documents',
  standalone: false,
  templateUrl: './step4-documents.html',
  styleUrl: './step4-documents.css',
})
export class Step4Documents implements OnInit {
  dniFrentePreview: string | null = null;
  dniDorsoPreview: string | null = null;
  selfiePreview: string | null = null;

  dniFrenteUploaded: boolean = false;
  dniDorsoUploaded: boolean = false;
  selfieUploaded: boolean = false;

  constructor(private wizardService: WizardService) {}

  ngOnInit(): void {
    // Load existing data if available
    const wizardData = this.wizardService.getWizardData();
    if (wizardData.documentsData.dniFrente) {
      this.dniFrenteUploaded = true;
      this.createPreview(wizardData.documentsData.dniFrente, 'dniFrente');
    }
    if (wizardData.documentsData.dniDorso) {
      this.dniDorsoUploaded = true;
      this.createPreview(wizardData.documentsData.dniDorso, 'dniDorso');
    }
    if (wizardData.documentsData.selfie) {
      this.selfieUploaded = true;
      this.createPreview(wizardData.documentsData.selfie, 'selfie');
    }
  }

  onFileSelected(event: any, documentType: string): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file, documentType);
    }
  }

  private processFile(file: File, documentType: string): void {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar los 5MB');
      return;
    }

    // Create preview
    this.createPreview(file, documentType);

    // Update service
    const updateData: any = {};
    updateData[documentType] = file;
    this.wizardService.updateDocumentsData(updateData);

    // Mark as uploaded
    switch (documentType) {
      case 'dniFrente':
        this.dniFrenteUploaded = true;
        break;
      case 'dniDorso':
        this.dniDorsoUploaded = true;
        break;
      case 'selfie':
        this.selfieUploaded = true;
        break;
    }
  }

  private createPreview(file: File, documentType: string): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      switch (documentType) {
        case 'dniFrente':
          this.dniFrentePreview = result;
          break;
        case 'dniDorso':
          this.dniDorsoPreview = result;
          break;
        case 'selfie':
          this.selfiePreview = result;
          break;
      }
    };
    reader.readAsDataURL(file);
  }

  removeFile(documentType: string): void {
    const updateData: any = {};
    updateData[documentType] = null;
    this.wizardService.updateDocumentsData(updateData);

    switch (documentType) {
      case 'dniFrente':
        this.dniFrentePreview = null;
        this.dniFrenteUploaded = false;
        break;
      case 'dniDorso':
        this.dniDorsoPreview = null;
        this.dniDorsoUploaded = false;
        break;
      case 'selfie':
        this.selfiePreview = null;
        this.selfieUploaded = false;
        break;
    }
  }

  isAllDocumentsUploaded(): boolean {
    return this.dniFrenteUploaded && this.dniDorsoUploaded && this.selfieUploaded;
  }
}
