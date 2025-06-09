import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupedPermissions, Permission } from '../models/permissions.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private http: HttpClient) { }

  list(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.url_ms_socket}/api/permissions`);
  }

  view(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${environment.url_ms_socket}/api/permissions/${id}`);
  }

  create(newPermission: Permission): Observable<Permission> {
    // El backend genera el ID, no lo enviamos en la creación
    delete newPermission.id;
    // Asegurarse de que las fechas no se envíen en la creación
    delete newPermission.created_at;
    delete newPermission.updated_at;
    delete newPermission.has_permission;

    return this.http.post<Permission>(`${environment.url_ms_socket}/api/permissions`, newPermission);
  }

  update(thePermission: Permission): Observable<Permission> {
    // Asegurarse de que las fechas y has_permission no se envíen en la actualización
    delete thePermission.created_at;
    delete thePermission.updated_at;
    delete thePermission.has_permission;
    
    return this.http.put<Permission>(`${environment.url_ms_socket}/api/permissions/${thePermission.id}`, thePermission);
  }

  delete(id: number): Observable<any> { // Puede ser any o un objeto con mensaje
    return this.http.delete<any>(`${environment.url_ms_socket}/api/permissions/${id}`);
  }

   /**
   * Obtiene todos los permisos agrupados por entidad y con el indicador de si el rol los tiene.
   * @param roleId El ID del rol para el cual se quieren verificar los permisos.
   */
  getGroupedPermissionsByRole(roleId: number): Observable<GroupedPermissions[]> {
    return this.http.get<GroupedPermissions[]>(`${environment.url_ms_socket}/api/permissions/grouped/role/${roleId}`);
  }
}
