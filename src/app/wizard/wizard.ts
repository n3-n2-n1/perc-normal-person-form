import { Component, OnInit, OnDestroy } from '@angular/core';
import { WizardService } from '../services/wizard';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wizard',
  standalone: false,
  templateUrl: './wizard.html',
  styleUrl: './wizard.css',
})
export class Wizard implements OnInit, OnDestroy {
  currentStep: number = 1;
  private subscription!: Subscription;
  isSubmitting: boolean = false;

  steps = [
    { number: 1, title: 'Datos Personales', completed: false },
    { number: 2, title: 'Documentación', completed: false },
    { number: 3, title: 'Domicilio', completed: false },
    { number: 4, title: 'Carga de Documentos', completed: false },
    { number: 5, title: 'Cumplimiento Normativo', completed: false },
    { number: 6, title: 'Revisión Final', completed: false },
  ];

  get stepLabels(): string[] {
    return this.steps.map(s => s.title);
  }

  constructor(public wizardService: WizardService) {}

  ngOnInit(): void {
    this.subscription = this.wizardService.currentStep$.subscribe(step => {
      this.currentStep = step;
      this.updateStepCompletion();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateStepCompletion(): void {
    this.steps.forEach((step, index) => {
      step.completed = index + 1 < this.currentStep;
    });
  }

  nextStep(): void {
    if (this.wizardService.isStepValid(this.currentStep) && this.currentStep < 6) {
      this.wizardService.setCurrentStep(this.currentStep + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.wizardService.setCurrentStep(this.currentStep - 1);
    }
  }

  trackByStep(index: number, step: any): number {
    return step.number;
  }

  getProgressPercentage(): number {
    return ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
  }

  onStepClick(stepNumber: number): void {
    if (stepNumber <= this.currentStep) {
      this.wizardService.setCurrentStep(stepNumber);
    }
  }

  onSubmit(): void {
    if (this.wizardService.isStepValid(6) && !this.isSubmitting) {
      this.isSubmitting = true;

      // Aquí iría la lógica para enviar el formulario
      console.log('Formulario enviado:', this.wizardService.getWizardData());

      // Simular envío (aquí iría la llamada a la API)
      setTimeout(() => {
        // Mostrar mensaje de éxito con animación
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in';
        successMessage.innerHTML = `
          <div class="glass-dark rounded-xl p-8 text-center max-w-md mx-4 animate-scale-in">
            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">¡Solicitud Enviada!</h3>
            <p class="text-gray-300 mb-6">Su solicitud de apertura de cuenta ha sido enviada exitosamente. Recibirá una confirmación por email.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Entendido
            </button>
          </div>
        `;
        document.body.appendChild(successMessage);

        // Resetear el formulario después de 3 segundos
        setTimeout(() => {
          this.wizardService.reset();
          this.currentStep = 1;
          this.updateStepCompletion();
          this.isSubmitting = false;
          successMessage.remove();
        }, 3000);
      }, 1000);
    }
  }
}
