import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Session } from 'src/app/models/session.model';
import { User } from 'src/app/models/user.model';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  theFormGroup!: FormGroup;
  trySend: boolean = false;
  sessionId: string | null = null;
  user_idFromRoute: number | null = null; // Para cuando se crea una sesión para un usuario específico
  currentSession: Session | null = null;
  associatedUser: User | null = null; // Para mostrar la información del usuario asociado
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.configFormGroup();

    this.activatedRoute.params.subscribe(params => {
      this.sessionId = params['sessionId'];
      this.user_idFromRoute = params['user_id'] ? +params['user_id'] : null; // Si viene un user_id en la ruta de creación

      
      // Determinar el modo basado en la URL
      const currentUrl = this.router.url;
      this.isEditMode = currentUrl.includes('/edit') || currentUrl.includes('/create');
      this.isViewMode = currentUrl.includes('/view');
      
      console.log('OnInit - Initial user_idFromRoute:', this.user_idFromRoute);
      
      if (this.sessionId) {
        // Estamos en modo Ver o Editar una sesión existente
        this.loadSessionData(this.sessionId);
      } else if (this.user_idFromRoute !== null) {
        // Estamos en modo Crear una nueva sesión para un usuario específico
        this.theFormGroup.get('user_id')?.setValue(this.user_idFromRoute); 
        this.loadAssociatedUser(this.user_idFromRoute);
        this.applyFormModeRules();
      } else {
        console.error('Error: Se esperaba sessionId o user_id en la ruta de SessionManageComponent.');
        Swal.fire('Error', 'Ruta inválida para la gestión de sesiones. Falta ID de sesión o de usuario.', 'error');
        this.router.navigate(['/users/list']); // Redirigir a la lista de usuarios
      }
    });
  }

  configFormGroup(): void {
    this.theFormGroup = this.formBuilder.group({
      id: [{ value: '', disabled: true }], // ID es generado por el backend
      user_id: [{ value: '', disabled: true }, [Validators.required]], // User ID es necesario para crear/asociar
      token: ['', [Validators.required, Validators.maxLength(255)]],
      expiration: ['', [Validators.required]], // Usaremos un input de fecha/hora
      FACode: ['', [Validators.maxLength(10)]],
      state: ['', [Validators.required, Validators.maxLength(20)]],
      created_at: [{ value: '', disabled: true }],
      updated_at: [{ value: '', disabled: true }]
    });
  }

  applyFormModeRules(): void {
    if (this.isEditMode) {
      this.theFormGroup.get('token')?.enable();
      this.theFormGroup.get('expiration')?.enable();
      this.theFormGroup.get('FACode')?.enable();
      this.theFormGroup.get('state')?.enable();
      // user_id solo se debería habilitar si no se viene de una ruta /create/:user_id
      this.theFormGroup.get('user_id')?.disable(); 
    } else { // View Mode
      this.theFormGroup.disable();
    }
    // Estos campos siempre deshabilitados
    this.theFormGroup.get('id')?.disable();
    this.theFormGroup.get('created_at')?.disable();
    this.theFormGroup.get('updated_at')?.disable();
  }

  loadSessionData(sessionId: string): void {
    this.sessionService.getSessionById(sessionId).subscribe({
      next: (sessionData) => {
        this.currentSession = sessionData;
        this.theFormGroup.patchValue({
          id: sessionData.id,
          user_id: sessionData.user_id,
          token: sessionData.token,
          expiration: sessionData.expiration ? sessionData.expiration.toISOString().slice(0, 16) : '', // Formato para input datetime-local
          FACode: sessionData.FACode,
          state: sessionData.state,
        });

        if (sessionData.user_id) {
          this.user_idFromRoute = sessionData.user_id;
          this.loadAssociatedUser(sessionData.user_id);
        } else {
          console.warn('Session data is missing user_id. Cannot load associated user.');
          this.associatedUser = null; // Resetear si no hay user_id en la sesión
        }

        this.applyFormModeRules();
      },
      error: (error) => {
        console.error('Error al cargar la sesión:', error);
        Swal.fire('Error', 'No se pudo cargar la información de la sesión.', 'error');
        const navigateUserId = this.user_idFromRoute || this.currentSession?.user_id;
        if (navigateUserId) {
          this.router.navigate(['/users', navigateUserId, 'sessions'])
        } else {
          this.router.navigate(['/users/list']);
        }
      }
    });
  }

  loadAssociatedUser(user_id: number): void {
    if (user_id !== null && typeof user_id === 'number') {
      this.userService.view(user_id).subscribe({
        next: (userData) => {
          this.associatedUser = userData;
        },
        error: (error) => {
          console.error('Error al cargar el usuario asociado:', error);
          Swal.fire('Advertencia', 'No se pudo cargar la información del usuario asociado.', 'warning');
          this.associatedUser = null; // Asegurar que no se muestre información incorrecta
        }
      });
    } else {
      console.warn('loadAssociatedUser called with invalid user_id:', user_id);
      this.associatedUser = null; // No hay usuario para cargar
    }
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  saveSession(): void {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos y corrija errores.', 'error');
      return;
    }

    const sessionData = this.theFormGroup.getRawValue(); // Usa getRawValue para obtener los valores de campos deshabilitados si es necesario

    // Convertir la cadena de fecha del input datetime-local a objeto Date para el servicio
    if (sessionData.expiration) {
      sessionData.expiration = new Date(sessionData.expiration);
    }

    if (this.sessionId) {
      // Actualizar Sesión
      this.sessionService.updateSession(this.sessionId, sessionData).subscribe({
        next: (response) => {
          Swal.fire('Actualizado!', 'La sesión ha sido actualizada correctamente.', 'success');

          const navigateuser_id = this.user_idFromRoute || response?.user_id;
          if (navigateuser_id) {
            this.router.navigate(['users', navigateuser_id, 'sessions', this.sessionId, 'view']);
          } else {
            this.router.navigate(['/users/list']); // Fallback
          }
        },
        error: (error) => {
          console.error('Error al actualizar la sesión:', error);
          Swal.fire('Error!', `Hubo un error al actualizar la sesión: ${error.message || ''}`, 'error');
        }
      });
    } else if (this.user_idFromRoute) { // Estamos en modo creación (la ruta tiene user_idFromRoute pero no sessionId)
      // Crear Nueva Sesión para un usuario específico
      this.sessionService.createSession(this.user_idFromRoute, sessionData).subscribe({
        next: (response) => {
          Swal.fire('Creado!', 'La sesión ha sido creada correctamente.', 'success');
          this.router.navigate(['users', this.user_idFromRoute, 'sessions']); // Navegar a la vista de la nueva sesión
        },
        error: (error) => {
          console.error('Error al crear la sesión:', error);
          Swal.fire('Error!', `Hubo un error al crear la sesión: ${error.message || ''}`, 'error');
        }
      });
    }
  }

  cancel(): void {
    // Siempre regresa a la lista de sesiones del usuario asociado
    const navigateUserId = this.user_idFromRoute || this.currentSession?.user_id;
    if (navigateUserId) {
      this.router.navigate(['users', navigateUserId, 'sessions']);
    } else {
      // Fallback si por alguna razón no tenemos un user_id
      this.router.navigate(['/users/list']);
    }
    this.trySend = false;
  }
}
