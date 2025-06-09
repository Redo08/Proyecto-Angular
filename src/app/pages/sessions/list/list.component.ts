import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'console';
import { Session } from 'src/app/models/session.model';
import { SessionService } from 'src/app/services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  sessions: Session[] = [];
  user_id: number | null = null; // Para filtrar por usuarios

  constructor(
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obtener por id de usuario
    this.activatedRoute.params.subscribe(params => {
      this.user_id = params['user_id'] ? +params['user_id'] : null;
      if (this.user_id) {
        this.loadSessionsByuser_id(this.user_id);
      } else {
        // Esto debería ser un caso de error o redirigir, ya que la ruta ahora espera un user_id
        console.error('Error: user_id no encontrado en la ruta para el listado de sesiones.');
        Swal.fire('Error', 'Debe especificar un ID de usuario para ver sus sesiones.', 'error');
        this.router.navigate(['/users/list']); // Redirigir a la lista de usuarios
      }
    });
  }

  // loadAllSessions(): void {
  //   this.sessionService.getAllSessions().subscribe({
  //     next: (data) => {
  //       this.sessions = data;
  //       console.log('Todas las sesiones cargadas:', this.sessions);
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar todas las sesiones:', error);
  //       Swal.fire('Error', 'No se pudieron cargar las sesiones.', 'error');
  //     }
  //   });
  // }


  // Nueva función para volver a la lista de usuarios
  goBackToUsers(): void {
    this.router.navigate(['/users/list']);
  }

  loadSessionsByuser_id(user_id: number): void {
    this.sessionService.getSessionsByUserId(user_id).subscribe({
      next: (data) => {
        this.sessions = data;
        console.log(`Sesiones para el usuario ${user_id} cargadas:`, this.sessions);
      },
      error: (error) => {
        console.error(`Error al cargar sesiones para el usuario ${user_id}:`, error);
        Swal.fire('Error', `No se pudieron cargar las sesiones para el usuario ${user_id}.`, 'error');
      }
    });
  }

  viewSession(sessionId: string): void {
    this.router.navigate(['users', this.user_id, 'sessions', sessionId, 'view']); // Ruta para ver una sesión especifica
  }

  editSession(sessionId: string): void {
    this.router.navigate(['users', this.user_id, 'sessions', sessionId, 'edit']); // Ruta para editar una sesión específica
  }

  createNewSessionForUser(): void {
    if (this.user_id) {
      // La ruta de creación ahora es users/:user_id/sessions/create
      this.router.navigate(['users', this.user_id, 'sessions', 'create']);
    } else {
      Swal.fire('Info', 'Selecciona un usuario para crear una sesión.', 'info');
    }
  }

  deleteSession(sessionId: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sessionService.deleteSession(sessionId).subscribe({
          next: () => {
            Swal.fire('Eliminado!', 'La sesión ha sido eliminada.', 'success');
            // Recargar las sesiones después de eliminar
            if (this.user_id) {
              this.loadSessionsByuser_id(this.user_id);
            }
          },
          error: (error) => {
            console.error('Error al eliminar sesión:', error);
            Swal.fire('Error', 'No se pudo eliminar la sesión.', 'error');
          }
        });
      }
    });
  }
}
