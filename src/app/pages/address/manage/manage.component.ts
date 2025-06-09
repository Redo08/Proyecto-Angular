import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // ¡Importar Validators!
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from 'src/app/models/address.model';
import { User } from 'src/app/models/user.model';
import { AddressService } from 'src/app/services/address.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import * as L from 'leaflet'; // Para usar Leaflet
import 'leaflet/dist/leaflet.css'
const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/marker-icon.png';
const shadowUrl = 'assets/leaflet/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;
@Component({
  selector: 'app-address-manage', // Selector único para este componente
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  // Inicializamos 'address' para reflejar tu clase Address sin constructor.
  // Es importante que las propiedades no sean 'undefined' al inicio para evitar errores.
  address: Address = {
    id: 0, // Opcional
    user_id: 0, // Opcional
    street: '', // Asignamos un string vacío si lo consideras 'requerido' lógicamente
    number: '', // Asignamos un string vacío
    latitude: 0, // Opcional
    longitude: 0 // Opcional
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

  
  mapOptions: L.MapOptions = {
      layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
      ],
      zoom: 12,
      center: L.latLng(4.5709, -74.2973) // Centro por defecto de Colombia
  };
  map: L.Map | undefined; // Referencia al objeto mapa de Leaflet
  marker: L.Marker | undefined; // Marcador para la ubicación seleccionada
  // **CORRECCIÓN:** Declaración de 'mapLocation'
  //mapLocation: { lat: number; lng: number } | null = null; // Para mostrar la ubicación en un posible mapa

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
      // --- INICIO CÓDIGO MAPA: Validadores para Latitud/Longitud ---
      latitude: [null, [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: [null, [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]]
      // --- FIN CÓDIGO MAPA ---
    });
  }

  // Aplica reglas de habilitación/deshabilitación a los campos del formulario
  applyFormModeRules() {
    if (this.isEditing) {
      this.theFormGroup.get('street')?.enable();
      this.theFormGroup.get('number')?.enable();
       // --- INICIO CÓDIGO MAPA: Habilitar y aplicar validadores a campos de lat/lng en modo edición ---
      this.theFormGroup.get('latitude')?.enable();
      this.theFormGroup.get('latitude')?.setValidators([Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]);
      this.theFormGroup.get('longitude')?.enable();
      this.theFormGroup.get('longitude')?.setValidators([Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]);
      // --- FIN CÓDIGO MAPA ---

    } else { // Modo vista
      this.theFormGroup.get('street')?.disable();
      this.theFormGroup.get('number')?.disable();
      // --- INICIO CÓDIGO MAPA: Deshabilitar y limpiar validadores de campos de lat/lng en modo vista ---
      this.theFormGroup.get('latitude')?.disable();
      this.theFormGroup.get('latitude')?.clearValidators();
      this.theFormGroup.get('longitude')?.disable();
      this.theFormGroup.get('longitude')?.clearValidators();
      // --- FIN CÓDIGO MAPA ---
    }
     // --- INICIO CÓDIGO MAPA: Actualizar validadores ---
    this.theFormGroup.get('latitude')?.updateValueAndValidity();
    this.theFormGroup.get('longitude')?.updateValueAndValidity();
    // --- FIN CÓDIGO MAPA ---
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
          // --- INICIO CÓDIGO MAPA: Actualizar el mapa después de crear ---
          if (this.address.latitude && this.address.longitude) {
            this.updateMapLocation(this.address.latitude, this.address.longitude);
          }
          // --- FIN CÓDIGO MAPA ---
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
          // --- INICIO CÓDIGO MAPA: Actualizar el mapa después de actualizar ---
          if (this.address.latitude && this.address.longitude) {
            this.updateMapLocation(this.address.latitude, this.address.longitude);
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
               // Borrar la ubicación del mapa
              this.applyFormModeRules(); // Aplicamos las reglas del formulario
              // --- INICIO CÓDIGO MAPA: Limpiar marcador del mapa al eliminar ---
              this.clearMapMarker();
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
   // --- INICIO CÓDIGO MAPA: Restaurar ubicación del mapa al cancelar edición ---
    if (this.address.latitude && this.address.longitude) {
      this.updateMapLocation(this.address.latitude, this.address.longitude);
    } else {
      this.clearMapMarker(); // Si no había dirección, limpia el marcador
    }
    // --- FIN CÓDIGO MAPA ---
  }
  // --- INICIO CÓDIGO MAPA: Métodos de Interacción con el Mapa ---

  // Se ejecuta cuando el mapa de Leaflet está listo. Aquí guardamos la instancia del mapa
  // y le añadimos un listener para el evento 'click'.
  onMapReady(map: L.Map) {
    this.map = map;
    this.map.on('click', this.mapClick, this);

    // ************ CLAVE: Aquí es donde inicializamos el marcador ************
    // Después de que el mapa esté listo, si ya tenemos una dirección, la mostramos.
    if (this.addressExists && this.address.latitude && this.address.longitude) {
      this.updateMapLocation(this.address.latitude, this.address.longitude);
    } else if (!this.addressExists && this.isEditing) {
      // Si estamos en modo creación y no hay dirección previa, puedes centrar en una ubicación predeterminada
      // o dejar que el usuario haga clic para establecer la primera ubicación.
      // Por ejemplo, para centrar en la ubicación por defecto que definiste en mapOptions:
      this.map.setView(this.mapOptions.center!, this.mapOptions.zoom);
    }
  }

  // Manejador del evento de clic en el mapa.
  // Obtiene las coordenadas del clic y actualiza el formulario y el marcador en el mapa.
  mapClick(e: L.LeafletMouseEvent) {
    // Solo permitimos la interacción con el mapa si el formulario está en modo de edición
    if (!this.isEditing) {
        return;
    }

    const { lat, lng } = e.latlng; // Extrae latitud y longitud del evento del clic
    this.updateFormCoordinates(lat, lng); // Actualiza los campos del formulario
    this.updateMapLocation(lat, lng); // Actualiza la posición del marcador en el mapa
  }

  // Actualiza los valores de latitud y longitud en el formulario reactivo.
  updateFormCoordinates(lat: number, lng: number) {
    this.theFormGroup.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  // Actualiza la posición del marcador en el mapa y centra la vista del mapa.
  updateMapLocation(lat: number, lng: number) {
    // Es CRUCIAL que this.map esté definido antes de intentar usarlo
    if (!this.map) {
        console.error("El mapa no está listo para actualizar la ubicación.");
        return; // Salir si el mapa no está inicializado
    }

    if (this.marker) {
      this.marker.remove(); // Usar .remove() en lugar de map.removeLayer(marker) para el objeto marker
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.setView([lat, lng], 15);
  }

  // Elimina el marcador del mapa y, opcionalmente, resetea la vista del mapa a su centro por defecto.
 clearMapMarker() {
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
    if (this.map) { // Asegúrate de que el mapa exista antes de intentar centrarlo
      this.map.setView(this.mapOptions.center!, this.mapOptions.zoom);
    }
  }
  // --- FIN CÓDIGO MAPA ---el 

 
}