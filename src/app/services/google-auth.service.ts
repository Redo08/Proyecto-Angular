import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SecurityService } from './security.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GoogleCredentialResponse, GooglePayload, GoogleUser } from '../models/google-user.model';


// Declarar 'google' como global para TypeScript
declare global {
  interface Window {
    google?: any;
  }
}


@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private clientId: string = environment.googleClientId; // Asegúrate de definir esto en environment.ts
  private scriptLoaded: boolean = false;

  constructor(
    private ngZone: NgZone, // Necesario para ejecutar el callback de Google dentro de la zona de Angular
    private securityService: SecurityService,
    private router: Router
  ) { 
    if (!this.clientId) {
      console.error("Google Client ID no está configurado en environment.ts");
      Swal.fire("Error de Configuración", "Google Client ID no encontrado.", "error");
    }
  }

  /**
   * Carga el script de Google Identity Services.
   * @param callback Función a ejecutar una vez que el script se ha cargado.
   */
  public loadGoogleScript(callback: () => void): void {
    if (this.scriptLoaded) {
      callback();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.scriptLoaded = true;
      this.ngZone.run(() => callback()); // Asegura que el callback se ejecute dentro de la zona de Angular
    };
    script.onerror = (error) => {
      console.error('Error al cargar el script de Google Identity Services:', error);
      Swal.fire("Error", "No se pudo cargar el servicio de Google.", "error");
    };
    document.body.appendChild(script);
  }

  /**
   * Inicializa Google Identity Services.
   * @param callback Función a ejecutar cuando se recibe una credencial de Google.
   */
  public initializeGoogleSignIn(callback: (response: GoogleCredentialResponse) => void): void {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: GoogleCredentialResponse) => this.ngZone.run(() => callback(response)), // Wrapper para Angular Zone
        auto_select: false,
        ux_mode: 'popup', // O 'redirect' si prefieres esa experiencia
      });
    } else {
      console.error('Google Identity Services no se cargó correctamente para inicializar.');
    }
  }

  /**
   * Renderiza el botón de Google Sign-In en un elemento HTML.
   * @param elementId ID del elemento HTML donde se renderizará el botón.
   */
  public renderGoogleButton(elementId: string): void {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId)!,
        { theme: 'outline', size: 'large', type: 'standard', shape: 'pill', text: 'signin_with', locale: 'es' } // Personaliza el botón
      );
    } else {
      console.error('Google Identity Services no se cargó correctamente para renderizar el botón.');
    }
  }

  /**
   * Dispara el prompt de una sola vez para Google Sign-In.
   */
  public promptGoogleSignIn(): void {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    }
  }

  /**
   * Procesa la respuesta de credenciales de Google, decodifica el token
   * y guarda la información del usuario en la sesión.
   * @param response La respuesta de credenciales de Google.
   */
  public handleGoogleCredentialResponse(response: GoogleCredentialResponse): void {
    if (response.credential) {
      const decodedToken = this.decodeGoogleJwt(response.credential);

      if (decodedToken && decodedToken.email && decodedToken.sub && decodedToken.name) {
        console.log('Google ID Token Payload:', decodedToken);

        // Crear un objeto de usuario con la información relevante de Google
        const googleAuthUser: GoogleUser = {
          id_google: decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture || '', // La imagen puede ser opcional
          google_token: response.credential // Guardamos el token completo para el interceptor
        };

        // Guardar la sesión de Google usando el SecurityService
        // Aquí simulamos la estructura que securityService.saveSession espera
        // Opcional: Podrías crear un nuevo método en SecurityService para manejar específicamente GoogleAuthUserInfo
        const sessionData = {
          user: {
            id: googleAuthUser.id_google, // Usar el sub de Google como ID
            name: googleAuthUser.name,
            email: googleAuthUser.email,
            picture: googleAuthUser.picture
            // Si tu User model tiene más campos, considera cómo mapearlos
          },
          token: googleAuthUser.google_token // El token que el interceptor leerá
        };

        this.securityService.saveSession(sessionData); // Reutilizamos saveSession
        Swal.fire('¡Bienvenido!', `Sesión iniciada como ${googleAuthUser.name} con Google.`, 'success');
        this.router.navigate(['/dashboard']); // Redirige al dashboard

      } else {
        console.error('Payload de Google incompleto o inválido:', decodedToken);
        Swal.fire('Error', 'Información de Google incompleta.', 'error');
      }
    } else {
      console.error('No se recibió credencial de Google.');
      Swal.fire('Error', 'No se pudo obtener la credencial de Google.', 'error');
    }
  }


  /**
   * Decodifica un token JWT de Google para extraer el payload.
   * @param token El token JWT (credential).
   * @returns El payload decodificado del token.
   */
  private decodeGoogleJwt(token: string): GooglePayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Reemplaza caracteres seguros para URL
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload) as GooglePayload;
    } catch (error) {
      console.error('Error parsing Google JWT', error);
      return null;
    }
  }
}
