import { Component, OnInit } from '@angular/core';
import { WizardService, WizardData } from '../../services/wizard';

@Component({
  selector: 'app-step6-review',
  standalone: false,
  templateUrl: './step6-review.html',
  styleUrl: './step6-review.css',
})
export class Step6Review implements OnInit {
  wizardData!: WizardData;
  termsAccepted: boolean = false;

  constructor(private wizardService: WizardService) {}

  ngOnInit(): void {
    this.wizardData = this.wizardService.getWizardData();
  }

  onTermsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const accepted = target.checked;
    this.termsAccepted = accepted;
    this.wizardService.setTermsAccepted(accepted);
  }

  isDocumentUploaded(documentType: keyof typeof this.wizardData.documentsData): boolean {
    return !!this.wizardData.documentsData[documentType];
  }
}
