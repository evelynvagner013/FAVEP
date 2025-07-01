import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// Importa provideHttpClient e withInterceptors para configurar o cliente HTTP
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
// Importa o interceptor que acabamos de criar
import { authInterceptor } from '../services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Configura o HttpClient para usar o interceptor de autenticação
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
