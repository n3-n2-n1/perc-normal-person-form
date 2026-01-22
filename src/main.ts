import 'zone.js';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

// Inicializar manejo de errores de extensiones antes del bootstrap
import('./app/services/extension-error-handler').then(() => {
  console.log('Extension error handler initialized');
}).catch(err => {
  console.warn('Failed to initialize extension error handler:', err);
});

platformBrowser().bootstrapModule(AppModule, {
  // Configuración adicional para mejor compatibilidad
  ngZoneEventCoalescing: true
})
  .catch(err => {
    // Filtrar errores de extensiones en el bootstrap
    const errorMessage = err?.message || String(err);
    const isExtensionError = /tronlink|solana|metamask|phantom|proxy.*trap/i.test(errorMessage);

    if (isExtensionError) {
      console.warn('Extension error during bootstrap (handled):', err);
    } else {
      console.error('Bootstrap error:', err);
    }
  });
