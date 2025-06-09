import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleCredentialResponse } from 'src/app/models/google-user.model';
import { loginUser } from 'src/app/models/login-user.model';
import { GoogleAuthService } from 'src/app/services/google-auth.service';
import { SecurityService } from 'src/app/services/security.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  user: loginUser
  constructor(
    private securityService: SecurityService,
    private router:Router,
    private googleAuthService: GoogleAuthService
  ) {
    this.user = { email: "", password: "" }
  }
  login() {
    this.securityService.login(this.user).subscribe({
      next: (data) => {
        this.securityService.saveSession(data)
        this.router.navigate(["dashboard"])
      },
      error: (error) => {
        Swal.fire("Autenticación Inválida", "Usuario o contraseña inválido", "error")
      }
    });
  }

  ngOnInit() {
    // Si ya hay una sesión activa, redirigir
    if (this.securityService.existSession()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit() {
    // Carga el script de Google y luego inicializa y renderiza el botón
    this.googleAuthService.loadGoogleScript(() => {
      this.googleAuthService.initializeGoogleSignIn((response: GoogleCredentialResponse) => {
        // Callback cuando Google devuelve una credencial
        this.googleAuthService.handleGoogleCredentialResponse(response);
      });
      this.googleAuthService.renderGoogleButton('google-button-container'); // Renderiza el botón
    });
  }
  ngOnDestroy() {
    // Limpia el prompt de Google cuando el componente se destruye, si es necesario
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.cancel();
    }
  }

}
