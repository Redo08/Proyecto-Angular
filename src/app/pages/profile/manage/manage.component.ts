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
  mode: number; // 1: view, 2: create, 3: update
  profile: Profile;
  user: User; // Para mostrar info del usuario asociado
  theFormGroup: FormGroup;
  trySend: boolean;
  selectedFile: File | null = null; // Para manejo cargado de fotos
  profileExists: boolean = false; // Variable para verificar si existe o no

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private userService: UserService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.profile = { id: 0};
    this.user = { id: 0, name: '', email: ''}; // Inicialización del usuario asociado
    this.configFormGroup(); 
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
    }

    this.user.id = +userId;

    // Obtener los datos del usuario
    this.userService.view(this.user.id).subscribe({
      next: (userData) => {
        this.user = userData;
        console.log("Associated User fetched successfully:", this.user);
        
        // Intentar obtener el perfil asociado al usuario con el endpoint
        this.profileService.getProfileByUserId(this.user.id!).subscribe({
          next: (existingProfile) => {
            this.profile = existingProfile;
            this.profileExists = true;
            this.mode = 3; // Si existe el modo es update
            this.theFormGroup.patchValue({
              id: this.profile.id,
              userId: this.profile.userId,
              phone: this.profile.phone,
              photo: this.profile.photo
            });
            this.applyFormModeRules(); // Aplica las reglas del formulario
          },
          error: (err) => {
            // Si hay error es que el perfil no existe
            console.log(`Profile not found for user ${this.user.id}. Setting mode to create.`, err);
            this.profileExists = false;
            this.mode = 2; // Si no existe el modo es create
            this.theFormGroup.patchValue({ userId: this.user.id });
            this.applyFormModeRules(); // Aplica las reglas del form
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
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]], // Expresión regular para telefonos
      photo: [''] // Este campo solo guardará la URL/ruta, no el archivo directamente
    });
  }

  applyFormModeRules() {
    // Si el modo es vista (no se usa directamente ahora, pero por si acaso)
    // if (this.mode === 1) {
    //   this.theFormGroup.disable();
    // } else { // Modos crear y actualizar
    //   this.theFormGroup.enable();
    //   this.theFormGroup.get('id')?.disable();
    //   this.theFormGroup.get('userId')?.disable(); // Siempre deshabilitado para edición manual
    // }
    this.theFormGroup.enable();
    this.theFormGroup.get('id')?.disable();
    this.theFormGroup.get('userId')?.disable();
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

  create() {
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

    // Llamar al servicio de creación, pasando el userId como se espera en el endpoint
    this.profileService.create(this.user.id!, phoneValue, this.selectedFile).subscribe({
      next: (profile) => {
        console.log("Profile created successfully:", profile);
        this.profile = profile; // Guarda el perfil recién creado
        this.profileExists = true; // El perfil ahora existe
        this.mode = 3; // Cambia a modo 'update' después de crear
        this.applyFormModeRules();
        this.selectedFile = null; // Limpiar archivo despues de cargar exitosamente

        // Actualizar formulario con url
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
  }

  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos y corrija errores.',
        icon: 'error',
      });
      return;
    }

    // Extraer solo lo relevante para el backend
    const phoneValue = this.theFormGroup.get('phone')?.value;

    this.profileService.update(this.profile.id!, phoneValue, this.selectedFile).subscribe({
      next: (profile) => {
        console.log("Profile updated successfully:", profile);
        this.profile = profile; // Actualiza el objeto perfil local con la respuesta del backend
        this.selectedFile = null; // Limpiar archivo seleccionado

        // Actualizar formulario coon la nueva url dela foto
        this.theFormGroup.patchValue({ photo: this.profile.photo });

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
                        this.profile = { id: 0 }; // Resetea el perfil
                        this.theFormGroup.reset(); // Limpia el formulario
                        this.theFormGroup.patchValue({ userId: this.user.id }); // Mantiene el userId
                        this.mode = 2; // Vuelve al modo crear
                        this.applyFormModeRules();
                        this.selectedFile = null;
                        this.router.navigate(["/users/list"]);
                    },
                    error: (error) => {
                        console.error("Error deleting profile:", error);
                        Swal.fire(
                            'Error!',
                            'Hubo un error al eliminar el perfil.',
                            'error'
                        );
                    }
                });
            }
        });
    }
  }

}
