import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Password } from 'src/app/models/password.model';
import { User } from 'src/app/models/user.model';
import { PasswordService } from 'src/app/services/password.service';
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
  passwordId: number | null = null;
  userIdFromRoute: number | null = null;
  currentPassword: Password | null = null;
  associatedUser: User | null = null;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  isCreateMode: boolean = false; // ADICIÓN: Nueva variable de modo
  constructor(
   private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private userService: UserService // Para cargar la información del usuario asociado
  ) { }

  ngOnInit(): void {
    this.configFormGroup();

    this.activatedRoute.params.subscribe(params => {
      this.passwordId = params['passwordId'] ? +params['passwordId'] : null;
      this.userIdFromRoute = params['userId'] ? +params['userId'] : null;

      const currentUrl = this.router.url;
      this.isEditMode = currentUrl.includes('/edit');
      this.isViewMode = currentUrl.includes('/view');
      this.isCreateMode = currentUrl.includes('/create');

      if (this.passwordId) {
        // Estamos en modo Ver o Editar una contraseña existente
        this.loadPasswordData(this.passwordId);
      } else if (this.userIdFromRoute !== null) {
        // Estamos en modo Crear una nueva contraseña para un usuario específico
        this.theFormGroup.get('user_id')?.setValue(this.userIdFromRoute);
        this.loadAssociatedUser(this.userIdFromRoute);
        this.applyFormModeRules();
      } else {
        console.error('Error: Se esperaba passwordId o userIdFromRoute en la ruta de PasswordManageComponent.');
        Swal.fire('Error', 'Ruta inválida para la gestión de contraseñas. Falta ID de contraseña o de usuario.', 'error');
        this.router.navigate(['/users/list']);
      }
    });
  }
  configFormGroup(): void {
    this.theFormGroup = this.formBuilder.group({
      id: [{ value: '', disabled: true }],
      user_id: [{ value: '', disabled: true }, [Validators.required]],
      content: ['', [Validators.required, Validators.maxLength(255)]],
      startAt: ['', [Validators.required]], // <-- AHORA startAt ES REQUERIDO
      endAt: ['', [Validators.required]], // Opcional, para cuando la contraseña deja de ser válida
    }, { validators: this.dateRangeValidator });
  }
  applyFormModeRules(): void {  
    this.theFormGroup.get('id')?.disable();
    this.theFormGroup.get('user_id')?.disable();
    if (this.isEditMode || this.isCreateMode) {
      this.theFormGroup.get('content')?.enable();
      this.theFormGroup.get('endAt')?.enable();
      // user_id y startAt siempre deshabilitados o manejados por el sistema
      this.theFormGroup.get('user_id')?.disable();
      this.theFormGroup.get('startAt')?.enable();
    } else { // View Mode
      this.theFormGroup.disable();
    }
    // Estos campos siempre deshabilitados
    this.theFormGroup.get('id')?.disable();
 
  }
   loadPasswordData(passwordId: number): void {
    this.passwordService.getPasswordById(passwordId).subscribe({
      next: (passwordData) => {
        this.currentPassword = passwordData;
        this.theFormGroup.patchValue({
          id: passwordData.id,
          user_id: passwordData.user_id,
          content: passwordData.content,
          // Formatear fechas para input datetime-local si es necesario, aunque en este caso solo se mostrarán
          startAt: passwordData.startAt ? new Date(passwordData.startAt).toISOString().slice(0, 16) : '',
          endAt: passwordData.endAt ? new Date(passwordData.endAt).toISOString().slice(0, 16) : '',
          
        });

        if (passwordData.user_id) {
          this.userIdFromRoute = passwordData.user_id;
          this.loadAssociatedUser(passwordData.user_id);
        } else {
          console.warn('Password data is missing user_id. Cannot load associated user.');
          this.associatedUser = null;
        }
        this.applyFormModeRules();
      },
      error: (error) => {
        console.error('Error al cargar la contraseña:', error);
        Swal.fire('Error', 'No se pudo cargar la información de la contraseña.', 'error');
        const navigateUserId = this.userIdFromRoute || this.currentPassword?.user_id;
        if (navigateUserId) {
          this.router.navigate(['/users', navigateUserId, 'passwords'])
        } else {
          this.router.navigate(['/users/list']);
        }
      }
    });
  }
  loadAssociatedUser(userId: number): void {
    if (userId !== null && typeof userId === 'number') {
      this.userService.view(userId).subscribe({
        next: (userData) => {
          this.associatedUser = userData;
        },
        error: (error) => {
          console.error('Error al cargar el usuario asociado:', error);
          Swal.fire('Advertencia', 'No se pudo cargar la información del usuario asociado.', 'warning');
          this.associatedUser = null;
        }
      });
    } else {
      console.warn('loadAssociatedUser called with invalid user_id:', userId);
      this.associatedUser = null;
    }
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startAtControl = group.get('startAt');
    const endAtControl = group.get('endAt');

    // Solo validar si ambos controles existen y tienen valores
    if (startAtControl && endAtControl && startAtControl.value && endAtControl.value) {
      const startAt = new Date(startAtControl.value);
      const endAt = new Date(endAtControl.value);

      if (endAt <= startAt) {
        // Establecer el error en el control 'endAt' para que el mensaje aparezca junto a él
        endAtControl.setErrors({ invalidDateRange: true });
        return { invalidDateRange: true }; // Retorna el error a nivel de grupo
      } else {
        // Limpiar el error si la validación pasa (importante para cuando el usuario corrige)
        if (endAtControl.hasError('invalidDateRange')) {
          const errors = endAtControl.errors;
          if (errors) {
            delete errors['invalidDateRange'];
            if (Object.keys(errors).length === 0) {
              endAtControl.setErrors(null);
            } else {
              endAtControl.setErrors(errors);
            }
          }
        }
      }
    }
    // Si no hay valores en ambos o la validación pasa, no hay error
    return null;
  }


  savePassword(): void {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos y corrija errores.', 'error');
      return;
    }

    const passwordData = this.theFormGroup.getRawValue();
    if (passwordData.startAt) {
      passwordData.startAt = this.formatDateToBackend(passwordData.startAt);
    }
    // Convertir la cadena de fecha del input datetime-local a objeto Date para el servicio
    if (passwordData.endAt) {
      passwordData.endAt =this.formatDateToBackend(passwordData.endAt);
    } 
    // No necesitamos enviar startAt al backend si se autogenera
    delete passwordData.id;
    delete passwordData.user_id;

    if (this.passwordId) {
      // Actualizar Contraseña
      this.passwordService.update(this.passwordId, passwordData).subscribe({
        next: (response) => {
          Swal.fire('Actualizada!', 'La contraseña ha sido actualizada correctamente.', 'success');
          const navigateUserId = this.userIdFromRoute || response?.user_id;
          if (navigateUserId) {
            this.router.navigate(['users', navigateUserId, 'passwords', this.passwordId, 'view']);
          } else {
            this.router.navigate(['/users/list']);
          }
        },
        error: (error) => {
          console.error('Error al actualizar la contraseña:', error);
          Swal.fire('Error!', `Hubo un error al actualizar la contraseña: ${error.message || ''}`, 'error');
        }
      });
    } else if (this.userIdFromRoute && this.isCreateMode) { // Estamos en modo creación
      // Crear Nueva Contraseña para un usuario específico
      this.passwordService.create(this.userIdFromRoute, passwordData).subscribe({
        next: (response) => {
          Swal.fire('Creada!', 'La contraseña ha sido creada correctamente.', 'success');
          this.router.navigate(['users', this.userIdFromRoute, 'passwords']);
        },
        error: (error) => {
          console.error('Error al crear la contraseña:', error);
          Swal.fire('Error!', `Hubo un error al crear la contraseña: ${error.message || ''}`, 'error');
        }
      });
    }
  }
  formatDateToBackend(dateString: string | null): string | null {
    if (!dateString) return null;

    // input type="datetime-local" devuelve 'YYYY-MM-DDTHH:mm'
    // Necesitamos 'YYYY-MM-DD HH:MM:SS'
    // Agregamos segundos por defecto como '00' ya que el input no los proporciona.

    const date = new Date(dateString); // Esto crea un objeto Date a partir del string 'YYYY-MM-DDTHH:mm'

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses son 0-11
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = '00'; // El input datetime-local no da segundos, así que los seteamos a 00

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  cancel(): void {
    const navigateUserId = this.userIdFromRoute || this.currentPassword?.user_id;
    if (navigateUserId) {
      this.router.navigate(['users', navigateUserId, 'passwords']);
    } else {
      this.router.navigate(['/users/list']);
    }
    this.trySend = false;
  }
}
