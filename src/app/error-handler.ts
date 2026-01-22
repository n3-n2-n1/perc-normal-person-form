import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Filtrar errores de extensiones de criptomonedas
    if (this.isExtensionError(error)) {
      console.warn('Extension error caught by Angular ErrorHandler:', error);
      return;
    }

    // Para otros errores, mantener el comportamiento por defecto
    console.error('Application error:', error);
  }

  private isExtensionError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message || error.toString();
    const stack = error.stack || '';

    // Patrones de errores de extensiones
    const extensionErrorPatterns = [
      /tronlink/i,
      /solana/i,
      /metamask/i,
      /phantom/i,
      /proxy.*trap/i,
      /set.*proxy/i,
      /injected\.js/i,
      /solanaActionsContentScript\.js/i,
      /content.*script/i,
      /chrome-extension:/i
    ];

    return extensionErrorPatterns.some(pattern =>
      pattern.test(errorMessage) || pattern.test(stack)
    );
  }
}