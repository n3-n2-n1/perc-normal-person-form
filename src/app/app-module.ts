import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { App } from './app';
import { Step1PersonalData } from './wizard/step1-personal-data/step1-personal-data';
import { Step2Documentation } from './wizard/step2-documentation/step2-documentation';
import { Step3Address } from './wizard/step3-address/step3-address';
import { Step4Documents } from './wizard/step4-documents/step4-documents';
import { Step6Review } from './wizard/step6-review/step6-review';
import { Step5ComplianceComponent } from './wizard/step5-compliance/step5-compliance.component';
import { Wizard } from './wizard/wizard';
import { WizardService } from './services/wizard';
import { ExtensionErrorHandlerService } from './services/extension-error-handler';
import { GlobalErrorHandler } from './error-handler';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { StepIndicatorComponent } from './components/step-indicator/step-indicator.component';
import { AutocompleteSelectComponent } from './components/autocomplete-select.component';
import { AddressAutocompleteComponent } from './components/address-autocomplete/address-autocomplete.component';

@NgModule({

  declarations: [
    App,
    Wizard,
    Step1PersonalData,
    Step2Documentation,
    Step3Address,
    Step4Documents,
    Step5ComplianceComponent,
    Step6Review,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    AutocompleteSelectComponent,
    AddressAutocompleteComponent,
    NavbarComponent,
    StepIndicatorComponent
  ],
  providers: [
    WizardService,
    ExtensionErrorHandlerService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
