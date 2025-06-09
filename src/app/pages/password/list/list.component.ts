import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Password } from 'src/app/models/password.model';
import { PasswordService } from 'src/app/services/password.service';
import Swal from 'sweetalert2';

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
    private activatedRoute: ActivatedRoute, // Para obtener parámetros de la URL
    private router: Router // Para navegar a otras rutas
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de la URL
    this.activatedRoute.params.subscribe(params => {
      this.userId = params['userId']  ? +params['userId'] : null;; // Obtener el userId de la ruta padre
      if (this.userId) {
       this.loadPasswords();
      } else {
        console.error('No se pudo obtener el ID de usuario de la ruta.');
        Swal.fire('Error', 'ID de usuario no proporcionado en la ruta.', 'error');
        this.router.navigate(['/users/list']); // Redirigir a la lista de usuarios si no hay userId
      }
      
    });

  }
 loadPasswords(): void {
    if (this.userId !== null) {
      this.passwordService.getPasswordsByUserId(this.userId).subscribe({
        next: (data) => {
          this.passwords = data.map(password => {
            // Convertir las cadenas de fecha a objetos Date
            if (password.startAt) {
              password.startAt = new Date(password.startAt);
            }
            if (password.endAt) {
              password.endAt = new Date(password.endAt);
            }
            return password;
          });
        },
        error: (error) => {
          console.error('Error al cargar las contraseñas:', error);
          Swal.fire('Error', 'No se pudieron cargar las contraseñas.', 'error');
        }
      });
    }
  }
 viewPassword(passwordId: number | undefined): void {
    if (passwordId && this.userId) {
      this.router.navigate(['/users', this.userId, 'passwords', passwordId, 'view']);
    }
  }

  editPassword(passwordId: number | undefined): void {
    if (passwordId && this.userId) {
      this.router.navigate(['/users', this.userId, 'passwords', passwordId, 'edit']);
    }
  }

  createPassword(): void {
    if (this.userId) {
      this.router.navigate(['/users', this.userId, 'passwords', 'create']);
    }
  }

  deletePassword(passwordId: number | undefined): void {
    if (passwordId) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.passwordService.delete(passwordId).subscribe({
            next: () => {
              Swal.fire(
                '¡Eliminada!',
                'La contraseña ha sido eliminada.',
                'success'
              );
              this.loadPasswords(); // Recargar la lista después de eliminar
            },
            error: (error) => {
              console.error('Error al eliminar la contraseña:', error);
              Swal.fire('Error', 'No se pudo eliminar la contraseña.', 'error');
            }
          });
        }
      });
    }
  }

  goBackToUserList(): void {
    this.router.navigate(['/users/list']);
  }
}
