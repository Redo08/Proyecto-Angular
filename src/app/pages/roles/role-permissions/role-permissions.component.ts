import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupedPermissions, Permission } from 'src/app/models/permissions.model';
import { Role } from 'src/app/models/role.model';
import { PermissionsService } from 'src/app/services/permissions.service';
import { RolePermissionService } from 'src/app/services/role-permission.service';
import { RoleService } from 'src/app/services/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent implements OnInit {
  roleId: number | null = null;
  role: Role | null = null;
  groupedPermissions: GroupedPermissions[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Define las columnas para la tabla del mockup y cómo mapearlas a los permisos
  operationsColumns: { name: string, method: string, urlMatch?: (url: string) => boolean }[] = [
    // Para "View": Coincide con URLs que terminan en /?
    { name: 'View', method: 'GET', urlMatch: (url) => url.endsWith('/?') },

    // Para "List": Coincide con URLs que NO terminan en /? y no tienen /ID
    // Asumo que para listar es simplemente /users o /roles
    { name: 'List', method: 'GET', urlMatch: (url) => !url.endsWith('/?') && !(/\/\d+$/.test(url)) },

    { name: 'Create', method: 'POST' }, // /users o /roles
    { name: 'Update', method: 'PUT', urlMatch: (url) => url.endsWith('/?') }, // /users/? o /roles/?
    { name: 'Delete', method: 'DELETE', urlMatch: (url) => url.endsWith('/?') } // /users/? o /roles/?
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionsService,
    private rolePermissionService: RolePermissionService
  ) { }

  ngOnInit(): void {
    this.roleId = parseInt(this.activatedRoute.snapshot.params.id);
    if (isNaN(this.roleId)) {
      this.error = 'ID de rol no válido.';
      this.loading = false;
      Swal.fire('Error', this.error, 'error');
      this.router.navigate(['/roles/list']);
      return;
    }

    this.loadRoleDetails();
    this.loadRolePermissions();
  }

  loadRoleDetails(): void {
    if (this.roleId) {
      this.roleService.view(this.roleId).subscribe({
        next: (data) => {
          this.role = data;
        },
        error: (err) => {
          console.error('Error al cargar los detalles del rol:', err);
          this.error = 'No se pudieron cargar los detalles del rol.';
          Swal.fire('Error', this.error, 'error');
          this.router.navigate(['/roles/list']);
        }
      });
    }
  }

  loadRolePermissions(): void {
    if (this.roleId) {
      this.loading = true;
      this.permissionService.getGroupedPermissionsByRole(this.roleId).subscribe({
        next: (data) => {
          this.groupedPermissions = data;
          this.loading = false;
          console.log("Permisos agrupados y con estado:", this.groupedPermissions);
        },
        error: (err) => {
          console.error('Error al cargar los permisos del rol:', err);
          this.error = 'No se pudieron cargar los permisos para este rol.';
          this.loading = false;
          Swal.fire('Error', this.error, 'error');
        }
      });
    }
  }

  /**
   * Busca un permiso dentro de un grupo basado en el método y, opcionalmente, un patrón de URL.
   * @param group El grupo de permisos (ej. para 'Users').
   * @param operation La definición de la operación (ej. { name: 'View', method: 'GET', urlMatch: (url) => ... }).
   * @returns El objeto Permission si se encuentra, de lo contrario undefined.
   */
  findPermission(group: GroupedPermissions, operation: { name: string, method: string, urlMatch?: (url: string) => boolean }): Permission | undefined {
    return group.permissions.find(p => {
      // El método debe coincidir
      if (p.method !== operation.method) {
        return false;
      }
      // Si hay una función de urlMatch, debe pasar la prueba
      if (operation.urlMatch) {
        return p.url && operation.urlMatch(p.url);
      }
      // Si no hay urlMatch, significa que el método por sí solo es suficiente
      // (ej. para POST, PUT, DELETE, si las URLs son las básicas /entity)
      // Cuidado: si tienes múltiples POST con diferentes URLs para la misma entidad,
      // esta lógica puede ser ambigua.
      return true;
    });
  }

  onPermissionChange(permission: Permission, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.roleId || !permission.id) {
      console.error("ID de rol o permiso no disponible.");
      Swal.fire('Error', 'Error al procesar el permiso. Faltan datos.', 'error');
      // Revertir el checkbox si los IDs no son válidos
      (event.target as HTMLInputElement).checked = !isChecked; // Revierto el estado en el UI
      return;
    }

    if (isChecked) {
      // Marcar: Crear la relación RolePermission
      this.rolePermissionService.createRolePermission(this.roleId, permission.id).subscribe({
        next: (response) => {
          console.log(`Permiso ${permission.url} (${permission.method}) asignado al rol ${this.role?.name}`, response);
          permission.has_permission = true; // Actualizar el estado en el frontend
          Swal.fire('Asignado!', 'Permiso asignado correctamente.', 'success');
        },
        error: (err) => {
          console.error('Error al asignar permiso:', err);
          Swal.fire('Error!', 'No se pudo asignar el permiso.', 'error');
          // Revertir el checkbox si la operación falla en el backend
          (event.target as HTMLInputElement).checked = false;
        }
      });
    } else {
      // Desmarcar: Eliminar la relación RolePermission
      this.rolePermissionService.deleteRolePermission(this.roleId, permission.id).subscribe({
        next: (response) => {
          console.log(`Permiso ${permission.url} (${permission.method}) desasignado del rol ${this.role?.name}`, response);
          permission.has_permission = false; // Actualizar el estado en el frontend
          Swal.fire('Desasignado!', 'Permiso desasignado correctamente.', 'success');
        },
        error: (err) => {
          console.error('Error al desasignar permiso:', err);
          Swal.fire('Error!', 'No se pudo desasignar el permiso.', 'error');
          // Revertir el checkbox si la operación falla en el backend
          (event.target as HTMLInputElement).checked = true;
        }
      });
    }
  }

  backToRoleList(): void {
    this.router.navigate(['/roles/list']);
  }


}
