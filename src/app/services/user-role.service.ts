import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserRoles } from '../models/user-roles.model';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private apiUrl = `${environment.url_ms_socket}/api/user-roles`;
  constructor(private http: HttpClient) { }
  list(): Observable<UserRoles[]> {
    return this.http.get<UserRoles[]>(`${this.apiUrl}`);
  }

  view(id: string): Observable<UserRoles> {
    return this.http.get<UserRoles>(`${this.apiUrl}/${id}`);
  }

  create(userId: number, roleId: number, data: { startAt: string; endAt: string }): Observable<UserRoles> {
    console.log('Enviando solicitud POST:', { url: `${this.apiUrl}/user/${userId}/role/${roleId}`, data });
    // El backend aún espera userId, roleId en la URL y fechas en el body
    return this.http.post<UserRoles>(`${this.apiUrl}/user/${userId}/role/${roleId}`, data);
  }

  update(theUserRole: UserRoles): Observable<UserRoles> {
    // Asegurarse de que las fechas estén en formato de string si el backend lo requiere
    const payload = {
      startAt: new Date(theUserRole.startAt).toISOString().split('T')[0],
      endAt: new Date(theUserRole.endAt).toISOString().split('T')[0],
      userId: theUserRole.userId,
      roleId: theUserRole.roleId
    };
    return this.http.put<UserRoles>(`${this.apiUrl}/${theUserRole.id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getRolesByUserId(userId: number): Observable<UserRoles[]> {
    return this.http.get<UserRoles[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUsersByRoleId(roleId: number): Observable<UserRoles[]> {
    return this.http.get<UserRoles[]>(`${this.apiUrl}/role/${roleId}`);
  }
}
