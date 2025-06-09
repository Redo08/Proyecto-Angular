// src/app/pages/user-profile/user-profile.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core'; // Añadimos OnDestroy
import { loginUser } from 'src/app/models/login-user.model'; // Importa tu modelo de usuario
import { SecurityService } from 'src/app/services/security.service'; // Importa el servicio de seguridad
import { Subscription } from 'rxjs'; // Para manejar la suscripción

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy { // Implementa OnDestroy
  user: loginUser; // Declara una propiedad para almacenar la información del usuario
  userSubscription: Subscription; // Para guardar la suscripción y desuscribirse

  constructor(private securityService: SecurityService) {
    // Inicializa el usuario para evitar errores de propiedades no definidas
    this.user = new loginUser();
  }

  ngOnInit() {
    // Suscríbete al observable del usuario para obtener la información más reciente
    this.userSubscription = this.securityService.getUser().subscribe(data => {
      if (data) {
        this.user = data; // Actualiza el objeto user con los datos recibidos
      }
    });

    // Asegúrate de que los datos del usuario estén cargados al inicio
    // si ya había una sesión activa (ej. al refrescar la página)
    if (this.securityService.existSession()) {
      const sessionData = this.securityService.getSessionData();
      if (sessionData) {
        this.user = JSON.parse(sessionData);
      }
    }
  }

  ngOnDestroy() {
    // Es crucial desuscribirse para evitar fugas de memoria
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Si quisieras un botón de "Guardar Cambios" (no implementado en este ejemplo)
  // saveProfile() {
  //   console.log('Guardando perfil:', this.user);
  //   // Aquí podrías enviar this.user a tu backend
  // }
}