import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile } from 'src/app/models/profile.model';
import { User } from 'src/app/models/user.model';
import { ProfileService } from 'src/app/services/profile.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  // mode: number; // 1: view, 2: create, 3: update
  profile: Profile = { // Inicialización
    id: 0,
    userId: 0,
    phone: '',
    photo: ''
  };
  user: User = {// Inicialización
    id: 0,
    name: '',
    email: '',
    password: ''
  }; 
  theFormGroup!: FormGroup; // Inicializado en constructor ngOnInit
  trySend: boolean = false;
  selectedFile: File | null = null; // Para manejo cargado de fotos
  profileExists: boolean = false; // Variable para verificar si existe o no
  isEditing: boolean = false; // Nuevo estado para controlar si el formulario de edición está visible

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private userService: UserService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.configFormGroup(); // Llamar a configFormGroup
   }

  ngOnInit(): void {
    const userId = this.activatedRoute.snapshot.params.userId;

    if (!userId) {
      Swal.fire({
        title: 'Error!',
        text: 'ID de usuario no proporcionado para gestionar el perfil.',
        icon: 'error',
      });
      this.router.navigate(["/users/list"]);
      return;
    }

    this.user.id = +userId;

    // Obtener los datos del usuario
    this.userService.view(this.user.id).subscribe({
      next: (userData) => {
        this.user = userData;
        console.log("Associated User fetched successfully:", this.user);
        // Pre-rellenar los campos de usuario (deshabilitados) en el formulario
        this.theFormGroup.patchValue({
          name: this.user.name,
          email: this.user.email
        });
        
        // Intentar obtener el perfil asociado al usuario con el endpoint
        this.profileService.getProfileByUserId(this.user.id!).subscribe({
          next: (existingProfile) => {
            this.profile = existingProfile;
            this.profileExists = true;
            this.isEditing = false; // Modo en vista si existe perfil
            this.theFormGroup.patchValue({
              id: this.profile.id,
              userId: this.profile.userId,
              phone: this.profile.phone,
              photo: this.profile.photo
            });
            this.applyFormModeRules(); // Aplica las reglas del formulario
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 404) {
              console.log(`Profile not found for user ${this.user.id}. Setting mode to create.`);
              this.profileExists = false;
              this.isEditing = true; // Si no existe, directamente al formulario de creación
              // this.mode = 2; // Mantenemos el mode para lógica interna si es necesario
              this.theFormGroup.patchValue({ userId: this.user.id }); // Pre-rellena el userId
              this.applyFormModeRules(); // Aplicar reglas del formulario
            } else {
              console.error("Error fetching profile by user ID: ", err);
              Swal.fire({
                title: 'Error!',
                text: 'No se pudo cargar la información del perfil.',
                icon: 'error',
              });
              this.router.navigate(["/users/list"]);
            }
          }
        });
      },
      error: (error) => {
        console.error("Error fetching associated User: ", error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo cargar la información del usuario asociado.',
          icon: 'error',
        });
        this.router.navigate(["/users/list"]);
      },
    });
  }

  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [{ value: '', disabled: true }],
      userId: [{ value: '', disabled: true }], // Campo solo para visualización
      name: [{ value: '', disabled: true}],
      email: [{ value: '', disabled: true}],
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]], // Expresión regular para telefonos
      photo: [''] // Este campo solo guardará la URL/ruta, no el archivo directamente
    });
  }

  applyFormModeRules() {
    // Aquí controlamos la habilitación/deshabilitación de campos editables
    if (this.isEditing) {
      this.theFormGroup.get('phone')?.enable();
      this.theFormGroup.get('photo')?.enable(); // Habilitar si la foto es un input del form
    } else { // Modo vista
      this.theFormGroup.get('phone')?.disable();
      this.theFormGroup.get('photo')?.disable();
    }
    // Estos siempre deshabilitados
    this.theFormGroup.get('id')?.disable();
    this.theFormGroup.get('userId')?.disable();
    this.theFormGroup.get('name')?.disable();
    this.theFormGroup.get('email')?.disable();
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
    // Previsualizar la imagen
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.photo = e.target.result; // Actualiza la previzualación
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.profile.photo = undefined; // No hay previsualización si no hay archivo
    }
  }

  back() {
    this.router.navigate(["/users/list"]); 
  }
  
  // Metodo para iniciar la creación o actualización
  saveProfile() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos y corrija errores.',
        icon: 'error',
      });
      return;
    }

    const phoneValue = this.theFormGroup.get('phone')?.value;

    // Modo crear
    if (!this.profileExists) {
      this.profileService.create(this.user.id!, phoneValue, this.selectedFile).subscribe({
        next: (profile) => {
          console.log("Profile created successfully:", profile);
          this.profile = profile;
          this.profileExists = true;
          this.isEditing = false; // Despues de crear vuelve a modo vista
          this.applyFormModeRules();
          this.selectedFile = null;
          // Actualizar la ruta de la foto en el formulario (si el backend devuelve la ruta completa o relativa)
          this.theFormGroup.patchValue({ photo: this.profile.photo });
          Swal.fire({
            title: "Creado!",
            text: "Perfil creado correctamente.",
            icon: "success",
          });
        },
        error: (error) => {
          console.error("Error creating profile: ", error);
          Swal.fire({
            title: 'Error!',
            text: `Hubo un error al crear el perfil: ${error.message || ''}`,
            icon: 'error',
          });
        },
      });
    } else { // modo actualizar
      this.profileService.update(this.profile.id!, phoneValue, this.selectedFile).subscribe({
        next: (profile) => {
          console.log("Profile updated successfully:", profile);
          this.profile = profile;
          this.selectedFile = null;
          this.isEditing = false; // Después de actualizar, vuelve al modo vista
          // Actualizar la ruta de la foto en el formulario (si el backend devuelve la ruta completa o relativa)
          this.theFormGroup.patchValue({ photo: this.profile.photo });
          this.applyFormModeRules();

          Swal.fire({
            title: "Actualizado!",
            text: "Perfil actualizado correctamente.",
            icon: "success",
          });
        },
        error: (error) => {
          console.error("Error updating profile:", error);
          Swal.fire({
            title: 'Error!',
            text: `Hubo un error al actualizar el perfil: ${error.message || ''}`,
            icon: 'error',
          });
        },
      });
    }
  }

  deleteProfile() {
    if (this.profile.id && this.profileExists) {
      Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción no se puede revertir!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
              this.profileService.delete(this.profile.id!).subscribe({
                  next: () => {
                      Swal.fire(
                          'Eliminado!',
                          'El perfil ha sido eliminado.',
                          'success'
                      );
                      this.profileExists = false;
                      this.isEditing = true; // Después de eliminar, pasa a modo crear
                      this.profile = { id: 0, userId: this.user.id!, phone: '', photo: '' }; // Resetea el perfil
                      this.theFormGroup.reset(); // Limpia el formulario
                      // Re-parchear los datos del usuario y userId después del reset
                      this.theFormGroup.patchValue({
                        userId: this.user.id,
                        name: this.user.name,
                        email: this.user.email
                      });
                      this.selectedFile = null;
                      this.applyFormModeRules();
                      // Opcional: Navegar de vuelta a la lista de usuarios o mantener aquí en modo creación
                      // this.router.navigate(["/users/list"]);
                  },
                  error: (error) => {
                      console.error("Error deleting profile:", error);
                      Swal.fire(
                          'Error!',
                          `Hubo un error al eliminar el perfil: ${error.message || ''}`,
                          'error'
                      );
                  }
              });
            }
        });
    }
  }

  // Nuevo método para activar el modo de edición
  startEditing() {
    this.isEditing = true;
    this.applyFormModeRules();
  }

  // Nuevo metodo para cancelar la edición y volver al modo vista
  cancelEditing() {
    this.isEditing = false;
    // Volver a cargar los datos originales del perfil por si se hicieron cambios
    this.theFormGroup.patchValue({
      id: this.profile.id,
      userId: this.profile.userId,
      phone: this.profile.phone,
      photo: this.profile.photo,
      name: this.user.name,
      email: this.user.email
    });
    this.selectedFile = null; // Limpiar cualquier archivo seleccionado para la edición
    this.trySend = false; // Resetear el estado de intento de envío
    this.applyFormModeRules();
  }
}
