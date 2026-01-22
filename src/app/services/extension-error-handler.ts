import { Injectable } from '@angular/core';

declare global {
  interface Window {
    tronLink?: any;
    solana?: any;
    tronWeb?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExtensionErrorHandlerService {

  constructor() {
    this.initializeErrorHandling();
  }

  private initializeErrorHandling(): void {
    // Capturar errores no manejados que provienen de extensiones
    window.addEventListener('error', (event) => {
      if (this.isExtensionError(event.error)) {
        console.warn('Extension error intercepted:', event.error);
        event.preventDefault();
      }
    });

    // Capturar errores de promesas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isExtensionError(event.reason)) {
        console.warn('Extension promise rejection intercepted:', event.reason);
        event.preventDefault();
      }
    });

    // Verificar y sanitizar objetos globales de extensiones
    this.sanitizeExtensionObjects();
  }

  private isExtensionError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message || error.toString();

    // Patrones de errores comunes de extensiones de criptomonedas
    const extensionErrorPatterns = [
      /tronlink/i,
      /solana/i,
      /metamask/i,
      /phantom/i,
      /proxy.*trap/i,
      /set.*proxy/i,
      /injected\.js/i,
      /solanaActionsContentScript\.js/i,
      /content.*script/i
    ];

    return extensionErrorPatterns.some(pattern => pattern.test(errorMessage));
  }

  private sanitizeExtensionObjects(): void {
    // Crear proxies seguros para objetos de extensiones que podrían no existir
    if (typeof Proxy !== 'undefined') {
      try {
        // Sanitizar window.tronLink
        if (!window.tronLink) {
          window.tronLink = new Proxy({}, {
            get: () => undefined,
            set: () => true // Retornar true para evitar errores de proxy
          });
        }

        // Sanitizar window.solana
        if (!window.solana) {
          window.solana = new Proxy({}, {
            get: () => undefined,
            set: () => true
          });
        }

        // Sanitizar window.tronWeb
        if (!window.tronWeb) {
          window.tronWeb = new Proxy({}, {
            get: () => undefined,
            set: () => true
          });
        }
      } catch (e) {
        console.warn('Failed to create extension proxies:', e);
      }
    }
  }

  // Método para verificar si una extensión está disponible de forma segura
  public isExtensionAvailable(extensionName: 'tronlink' | 'solana' | 'tronweb'): boolean {
    try {
      switch (extensionName) {
        case 'tronlink':
          return !!(window.tronLink && typeof window.tronLink === 'object' && !window.tronLink.constructor.name.includes('Proxy'));
        case 'solana':
          return !!(window.solana && typeof window.solana === 'object' && !window.solana.constructor.name.includes('Proxy'));
        case 'tronweb':
          return !!(window.tronWeb && typeof window.tronWeb === 'object' && !window.tronWeb.constructor.name.includes('Proxy'));
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  }
}