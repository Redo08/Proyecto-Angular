import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {

  constructor(private http: HttpClient) { }

  /**
   * Crea una relación RolePermission.
   * @param roleId El ID del rol.
   * @param permissionId El ID del permiso.
   * @returns Observable con la respuesta del backend (ej. el objeto RolePermission creado).
   */
  createRolePermission(roleId: number, permissionId: number): Observable<any> {
    // Según tu backend, la ruta es POST /api/role-permission/role/{role_id}/permission/{permission_id}
    // y no necesita un body de datos JSON, los IDs van en la URL.
    return this.http.post<any>(`${environment.url_ms_socket}/api/role-permissions/role/${roleId}/permission/${permissionId}`, {});
  }

  /**
   * Elimina una relación RolePermission.
   * @param roleId El ID del rol.
   * @param permissionId El ID del permiso.
   * @returns Observable con la respuesta del backend (ej. un mensaje de éxito).
   */
  deleteRolePermission(roleId: number, permissionId: number): Observable<any> {
    // Según tu backend, la ruta es DELETE /api/role-permission/role/{role_id}/permission/{permission_id}
    // y no necesita un body de datos JSON.
    return this.http.delete<any>(`${environment.url_ms_socket}/api/role-permissions/role/${roleId}/permission/${permissionId}`);
  }

  // Si necesitas listar las relaciones RolePermission por ID (no agrupadas)
  // o ver una específica por su UUID, también las puedes añadir aquí,
  // pero para la funcionalidad de checkboxes, los dos métodos de arriba son los principales.
  /*
  listByRole(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.url_ms_socket}/api/role-permission/role/${roleId}`);
  }

  listByPermission(permissionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.url_ms_socket}/api/role-permission/permission/${permissionId}`);
  }
  */
}
