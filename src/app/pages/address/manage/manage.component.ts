import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // ¡Importar Validators!
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'src/app/models/address.model';
import { User } from 'src/app/models/user.model';
import { AddressService } from 'src/app/services/address.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address-manage', // Selector único para este componente
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  // Inicializamos 'address' para reflejar tu clase Address sin constructor.
  // Es importante que las propiedades no sean 'undefined' al inicio para evitar errores.
  address: Address = {
    id: undefined, // Opcional
    user_id: undefined, // Opcional
    street: '', // Asignamos un string vacío si lo consideras 'requerido' lógicamente
    number: '', // Asignamos un string vacío
    latitude: undefined, // Opcional
    longitude: undefined // Opcional
  };

  user: User = { // Inicialización básica del modelo User
    id: 0,
    name: '',
    email: '',
    password: ''
  };

  theFormGroup!: FormGroup; // Se inicializará en el constructor
  trySend: boolean = false; // Bandera para controlar el intento de envío del formulario

  // **CORRECCIÓN:** Renombrado de 'profileExists' a 'addressExists' y eliminación de 'selectedFile'
  addressExists: boolean = false; // Variable para verificar si existe o no una dirección
  isEditing: boolean = false; // Nuevo estado para controlar si el formulario de edición está visible

  // **CORRECCIÓN:** Declaración de 'mapLocation'
  mapLocation: { lat: number; lng: number } | null = null; // Para mostrar la ubicación en un posible mapa

  constructor(
    private activatedRoute: ActivatedRoute,
    private addressService: AddressService, // Servicio para interactuar con las direcciones
    private userService: UserService, // Servicio para obtener información del usuario
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.configFormGroup(); // Configura el formulario reactivo
  }

  ngOnInit(): void {
    const userId = this.activatedRoute.snapshot.params.userId;

    if (!userId) {
      Swal.fire({
        title: 'Error!',
        text: 'ID de usuario no proporcionado para gestionar la dirección.',
        icon: 'error',
      });
      this.router.navigate(["/users/list"]);
      return;
    }

    this.user.id = +userId; // Convierte el ID de usuario a número

    // Primero, obtenemos los datos del usuario asociado
    this.userService.view(this.user.id).subscribe({
      next: (userData) => {
        this.user = userData;
        console.log("Usuario asociado a la dirección obtenido:", this.user);
        // Pre-rellenamos los campos de usuario (deshabilitados) en el formulario para visualización
        this.theFormGroup.patchValue({
          name: this.user.name,
          email: this.user.email
        });

        // Intentamos obtener la dirección asociada a este usuario
        this.addressService.getAddressByUserId(this.user.id!).subscribe({
          next: (existingAddress) => {
            // Si la dirección existe, la asignamos y entramos en modo vista
            this.address = existingAddress;
            this.addressExists = true;
            this.isEditing = false; // Modo de vista
            this.theFormGroup.patchValue({
              id: this.address.id,
              userId: this.address.user_id, // Usamos user_id del modelo
              street: this.address.street,
              number: this.address.number,
              latitude: this.address.latitude,
              longitude: this.address.longitude
            });
            // Si hay latitud y longitud, inicializamos la ubicación del mapa de ejemplo
            if (this.address.latitude && this.address.longitude) {
              this.mapLocation = { lat: this.address.latitude, lng: this.address.longitude };
            }
            this.applyFormModeRules(); // Aplica las reglas de habilitación/deshabilitación del formulario
          },
          error: (err: HttpErrorResponse) => {
            // Aquí capturamos el error personalizado de 'Address not found' del servicio
            if (err.message === 'Address not found for this user.') {
              console.log(`Dirección no encontrada para el usuario ${this.user.id}. Modo creación.`);
              this.addressExists = false;
              this.isEditing = true; // Entramos en modo creación
              this.theFormGroup.patchValue({ userId: this.user.id }); // Pre-rellenamos el user_id
              this.applyFormModeRules();
            } else {
              // Otros errores al intentar obtener la dirección
              console.error("Error al obtener la dirección por ID de usuario: ", err);
              Swal.fire({
                title: 'Error!',
                text: 'No se pudo cargar la información de la dirección.',
                icon: 'error',
              });
              this.router.navigate(["/users/list"]);
            }
          }
        });
      },
      error: (error) => {
        // Error al obtener la información del usuario
        console.error("Error al obtener el usuario asociado: ", error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo cargar la información del usuario asociado.',
          icon: 'error',
        });
        this.router.navigate(["/users/list"]);
      },
    });
  }

  // Configura el FormGroup con validadores para los campos de la dirección
  configFormGroup() {
    this.theFormGroup = this.theFormBuilder.group({
      id: [{ value: '', disabled: true }],
      userId: [{ value: '', disabled: true }], // Campo solo para visualización del ID de usuario
      name: [{ value: '', disabled: true }], // Campo de nombre de usuario (deshabilitado)
      email: [{ value: '', disabled: true }], // Campo de email de usuario (deshabilitado)
      street: ['', [Validators.required, Validators.maxLength(255)]],
      number: ['', [Validators.required, Validators.maxLength(20)]],
      latitude: [null], // No requerido, puede ser null
      longitude: [null] // No requerido, puede ser null
    });
  }

  // Aplica reglas de habilitación/deshabilitación a los campos del formulario
  applyFormModeRules() {
    if (this.isEditing) {
      this.theFormGroup.get('street')?.enable();
      this.theFormGroup.get('number')?.enable();
      this.theFormGroup.get('latitude')?.enable();
      this.theFormGroup.get('longitude')?.enable();
    } else { // Modo vista
      this.theFormGroup.get('street')?.disable();
      this.theFormGroup.get('number')?.disable();
      this.theFormGroup.get('latitude')?.disable();
      this.theFormGroup.get('longitude')?.disable();
    }
    // Estos campos siempre deben estar deshabilitados ya que son de solo lectura del usuario
    this.theFormGroup.get('id')?.disable();
    this.theFormGroup.get('userId')?.disable();
    this.theFormGroup.get('name')?.disable();
    this.theFormGroup.get('email')?.disable();
  }

  // Getter para acceder fácilmente a los controles del formulario desde el HTML
  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  // Navega de regreso a la lista de usuarios
  back() {
    this.router.navigate(["/users/list"]);
  }

  // Método para guardar (crear o actualizar) la dirección
  saveAddress() {
    this.trySend = true; // Indica que se ha intentado enviar el formulario
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos y corrija errores.',
        icon: 'error',
      });
      return;
    }

    // Obtiene los valores del formulario, incluyendo los campos deshabilitados
    const formData = this.theFormGroup.getRawValue();

    // Creamos un objeto Address a partir de los datos del formulario
    const addressData = {
      street: formData.street,
      number: formData.number,
      // Aseguramos que latitude y longitude sean números o undefined
      latitude: formData.latitude !== '' && formData.latitude !== null ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude !== '' && formData.longitude !== null ? parseFloat(formData.longitude) : undefined
    };

    if (!this.addressExists) { // Modo crear
      this.addressService.createAddress(
        this.user.id!, // Usamos el ID del usuario asociado
        addressData // Enviamos el objeto Address
      ).subscribe({
        next: (address) => {
          console.log("Dirección creada correctamente:", address);
          this.address = address; // Asigna la dirección creada
          this.addressExists = true; // Ahora la dirección existe
          this.isEditing = false; // Volvemos al modo vista
          this.applyFormModeRules(); // Aplicamos las reglas del formulario
          // Opcional: Actualizar mapLocation si se acaba de crear con coordenadas
          if (this.address.latitude && this.address.longitude) {
            this.mapLocation = { lat: this.address.latitude, lng: this.address.longitude };
          }
          Swal.fire({
            title: "Creado!",
            text: "Dirección creada correctamente.",
            icon: "success",
          });
        },
        error: (error) => {
          console.error("Error al crear dirección: ", error);
          Swal.fire({
            title: 'Error!',
            text: `Hubo un error al crear la dirección: ${error.message || ''}`,
            icon: 'error',
          });
        },
      });
    } else { // Modo actualizar
      // El ID de la dirección debe estar presente para actualizar
      if (!this.address.id) {
        Swal.fire('Error', 'ID de la dirección no disponible para actualizar.', 'error');
        return;
      }
      
      const addressToUpdate: Address = {
        id: this.address.id, // ¡Añadimos el ID de la dirección existente!
        user_id: this.address.user_id, // Opcional, pero es buena práctica para consistencia
        street: formData.street,
        number: formData.number,
        latitude: formData.latitude !== '' && formData.latitude !== null ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude !== '' && formData.longitude !== null ? parseFloat(formData.longitude) : undefined
      };
      this.addressService.updateAddress(addressToUpdate).subscribe({
        next: (address) => {
          console.log("Dirección actualizada correctamente:", address);
          this.address = address; // Asigna la dirección actualizada
          this.isEditing = false; // Volvemos al modo vista
          this.applyFormModeRules(); // Aplicamos las reglas del formulario
          // Actualizar mapLocation si se acaba de actualizar con coordenadas
          if (this.address.latitude && this.address.longitude) {
            this.mapLocation = { lat: this.address.latitude, lng: this.address.longitude };
          }
          Swal.fire({
            title: "Actualizado!",
            text: "Dirección actualizada correctamente.",
            icon: "success",
          });
        },
        error: (error) => {
          console.error("Error al actualizar dirección:", error);
          Swal.fire({
            title: 'Error!',
            text: `Hubo un error al actualizar la dirección: ${error.message || ''}`,
            icon: 'error',
          });
        },
      });
    }
  }

  // Método para eliminar la dirección
  deleteAddress() {
    if (this.address.id && this.addressExists) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¡Esta acción no se puede revertir!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarla!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.addressService.deleteAddress(this.address.id!).subscribe({
            next: () => {
              Swal.fire(
                'Eliminada!',
                'La dirección ha sido eliminada.',
                'success'
              );
              this.addressExists = false; // La dirección ya no existe
              this.isEditing = true; // Pasamos a modo creación
              // Reseteamos la propiedad 'address' a un objeto vacío
              this.address = {};
              this.theFormGroup.reset(); // Limpiamos el formulario
              // Re-parcheamos los datos del usuario y el userId después del reset
              this.theFormGroup.patchValue({
                userId: this.user.id,
                name: this.user.name,
                email: this.user.email,
                street: '', // Limpiamos explícitamente los campos de dirección
                number: '',
                latitude: undefined,
                longitude: undefined
              });
              this.mapLocation = null; // Borrar la ubicación del mapa
              this.applyFormModeRules(); // Aplicamos las reglas del formulario
            },
            error: (error) => {
              console.error("Error al eliminar dirección:", error);
              Swal.fire(
                'Error!',
                `Hubo un error al eliminar la dirección: ${error.message || ''}`,
                'error'
              );
            }
          });
        }
      });
    }
  }

  // Activa el modo de edición del formulario
  startEditing() {
    this.isEditing = true;
    this.applyFormModeRules();
  }

  // Cancela el modo de edición y revierte los cambios en el formulario
  cancelEditing() {
    this.isEditing = false;
    // Volvemos a cargar los datos originales de la dirección en el formulario
    this.theFormGroup.patchValue({
      id: this.address.id,
      userId: this.address.user_id,
      street: this.address.street,
      number: this.address.number,
      latitude: this.address.latitude,
      longitude: this.address.longitude,
      name: this.user.name,
      email: this.user.email
    });
    this.trySend = false; // Reseteamos el estado de intento de envío
    this.applyFormModeRules();
    // Reinicializar mapLocation
    if (this.address.latitude && this.address.longitude) {
      this.mapLocation = { lat: this.address.latitude, lng: this.address.longitude };
    } else {
      this.mapLocation = null;
    }
  }
}