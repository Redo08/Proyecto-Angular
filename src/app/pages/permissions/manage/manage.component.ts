import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Permission } from 'src/app/models/permissions.model';
import { PermissionsService } from 'src/app/services/permissions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  permission: Permission;
  theFormGroup: FormGroup;
  trySend: boolean;
  methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']; // Métodos HTTP comunes
  entities: string[] = []; // Se llenará con las entidades únicas de los permisos existentes
  constructor(
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionsService,
    private router: Router,
    private theFormBuilder: FormBuilder
  ) {
    this.trySend = false;
    this.permission = {};
    this.mode = 0; // Se determinará en ngOnInit
    this.theFormGroup = this.theFormBuilder.group({}); // Inicialización vacía, se configura en configFormGroup
   }

  ngOnInit(): void {
    const currentUrl = this.activatedRoute.snapshot.url.join("/");
    if (currentUrl.includes("view")) {
      this.mode = 1;
    } else if (currentUrl.includes("create")) {
      this.mode = 2;
    } else if (currentUrl.includes("update")) {
      this.mode = 3;
    }

    this.configFormGroup(); // Configurar el formulario después de determinar el modo

    if (this.mode === 3 || this.mode === 1) { // Si es modo update o view, cargamos el permiso
      const permissionId = this.activatedRoute.snapshot.params.id;
      if (permissionId) {
        this.getPermission(permissionId);
      }
    }

    this.loadUniqueEntities(); // Cargar las entidades existentes para el dropdown
  }

  configFormGroup(): void {
    this.theFormGroup = this.theFormBuilder.group({
      id: [{ value: '', disabled: true }],
      url: ['', [Validators.required, Validators.maxLength(255)]],
      method: ['', [Validators.required]],
      entity: ['', [Validators.required, Validators.maxLength(100)]],
      created_at: [{ value: '', disabled: true }],
      updated_at: [{ value: '', disabled: true }]
    });

    if (this.mode === 1) { // Modo vista: deshabilitar todos los campos
      this.theFormGroup.disable();
    } else { // Modo creación o actualización: habilitar campos editables
      this.theFormGroup.get('url')?.enable();
      this.theFormGroup.get('method')?.enable();
      this.theFormGroup.get('entity')?.enable();
      this.theFormGroup.get('id')?.disable(); // ID siempre deshabilitado
      this.theFormGroup.get('created_at')?.disable();
      this.theFormGroup.get('updated_at')?.disable();
    }
  }

  loadUniqueEntities(): void {
    this.permissionService.list().subscribe(data => {
      const uniqueEntities = new Set<string>();
      data.forEach(p => {
        if (p.entity) {
          uniqueEntities.add(p.entity);
        }
      });
      this.entities = Array.from(uniqueEntities).sort();
    }, error => {
      console.error('Error loading unique entities:', error);
      // Opcional: mostrar un SweetAlert2 o un mensaje al usuario
    });
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  back(): void {
    this.router.navigate(['/permissions/list']);
  }

  createPermission(): void {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error!', 'Por favor, complete todos los campos requeridos y corrija errores.', 'error');
      return;
    }

    this.permissionService.create(this.theFormGroup.value).subscribe({
      next: (response) => {
        Swal.fire('Creado!', 'El permiso ha sido creado correctamente.', 'success');
        this.router.navigate(['/permissions/list']);
      },
      error: (error) => {
        console.error('Error al crear el permiso:', error);
        let errorMessage = 'Hubo un error al crear el permiso.';
        if (error.error && error.error.error) {
          errorMessage = `Error: ${error.error.error}`;
        }
        Swal.fire('Error!', errorMessage, 'error');
      }
    });
  }

  updatePermission(): void {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire('Error!', 'Por favor, complete todos los campos requeridos y corrija errores.', 'error');
      return;
    }
    
    // Obtener el ID del permiso desde el objeto permission cargado
    const permissionId = this.permission.id; 
    if (!permissionId) {
      Swal.fire('Error!', 'ID de permiso no encontrado para actualizar.', 'error');
      return;
    }

    const permissionToUpdate = this.theFormGroup.getRawValue();
    this.permissionService.update(permissionToUpdate).subscribe({
      next: (response) => {
        Swal.fire('Actualizado!', 'El permiso ha sido actualizado correctamente.', 'success');
        this.router.navigate(['/permissions/list']);
      },
      error: (error) => {
        console.error('Error al actualizar el permiso:', error);
        let errorMessage = 'Hubo un error al actualizar el permiso.';
        if (error.error && error.error.error) {
          errorMessage = `Error: ${error.error.error}`;
        }
        Swal.fire('Error!', errorMessage, 'error');
      }
    });
  }

  getPermission(id: number): void {
    this.permissionService.view(id).subscribe({
      next: (data) => {
        this.permission = data;
        this.theFormGroup.patchValue({
          id: this.permission.id,
          url: this.permission.url,
          method: this.permission.method,
          entity: this.permission.entity,
          created_at: this.permission.created_at ? new Date(this.permission.created_at).toLocaleString() : '',
          updated_at: this.permission.updated_at ? new Date(this.permission.updated_at).toLocaleString() : ''
        });
      },
      error: (error) => {
        console.error('Error al cargar el permiso:', error);
        Swal.fire('Error', 'No se pudo cargar la información del permiso.', 'error');
        this.router.navigate(['/permissions/list']);
      }
    });
  }

   // Helper para manejar el submit del formulario
  submitForm(): void {
    if (this.mode === 2) { // Crear
      this.createPermission();
    } else if (this.mode === 3) { // Actualizar
      this.updatePermission();
    }
  }

}
