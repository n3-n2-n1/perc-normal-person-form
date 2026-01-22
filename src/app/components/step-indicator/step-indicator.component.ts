import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-indicator.component.html',
  styleUrl: './step-indicator.component.css'
})
export class StepIndicatorComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 5;
  @Input() stepLabels: string[] = [];

  @Output() stepClick = new EventEmitter<number>();

  getProgressWidth(): string {
    return `${((this.currentStep - 1) / (this.totalSteps - 1)) * 100}%`;
  }

  isStepActive(stepNumber: number): boolean {
    return stepNumber === this.currentStep;
  }

  isStepCompleted(stepNumber: number): boolean {
    return stepNumber < this.currentStep;
  }

  onStepClick(stepNumber: number): void {
    if (stepNumber <= this.currentStep) {
      this.stepClick.emit(stepNumber);
    }
  }
}