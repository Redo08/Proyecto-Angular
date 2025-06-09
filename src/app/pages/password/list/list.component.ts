import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Password } from 'src/app/models/password.model';
import { PasswordService } from 'src/app/services/password.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  passwords:Password[] = [];
  userId: number = 0;
  constructor(
    private passwordService: PasswordService,
    private route: ActivatedRoute, // Para obtener parámetros de la URL
    private router: Router // Para navegar a otras rutas
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      const userIdParam = params.get('userId');
      if (userIdParam) {
        this.userId = +userIdParam; // Convertir a número
        this.loadPasswordsByUserId(this.userId);
      } else {
        // Opcional: Si no hay userId en la ruta, podrías cargar todas las contraseñas
        // o redirigir a una página de error/selección de usuario.
        console.warn('No se proporcionó un ID de usuario en la ruta.');
        // this.router.navigate(['/some-error-or-selection-page']);
      }
    });

  }
  loadPasswordsByUserId(userId: number): void {
    this.passwordService.getPasswordsByUserId(userId).subscribe({
      next: (data) => {
        this.passwords = data;
        console.log('Contraseñas cargadas:', this.passwords);
      },
      error: (error) => {
        console.error('Error al cargar contraseñas:', error);
        // Aquí puedes mostrar un mensaje de error al usuario
      }
    });
  }
  // Método para ir a la página de creación de contraseña para el usuario actual
  createNewPassword(): void {
    if (this.userId) {
      this.router.navigate(['/passwords/create', this.userId]);
    } else {
      console.error('No se puede crear una contraseña sin un ID de usuario.');
    }
  }

  // Método para ir a la página de edición de una contraseña específica
  editPassword(passwordId: number): void {
    this.router.navigate(['/passwords/edit', passwordId]);
  }

  // Método para eliminar una contraseña
  deletePassword(passwordId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta contraseña?')) {
      this.passwordService.delete(passwordId).subscribe({
        next: () => {
          console.log('Contraseña eliminada exitosamente.');
          // Recargar la lista después de la eliminación
          if (this.userId) {
            this.loadPasswordsByUserId(this.userId);
          }
        },
        error: (error) => {
          console.error('Error al eliminar contraseña:', error);
          // Aquí puedes mostrar un mensaje de error al usuario
        }
      });
    }
  }

}
