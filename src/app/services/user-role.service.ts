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

  create(user_id: number, role_id: number, data: { startAt: string; endAt: string }): Observable<UserRoles> {
    console.log('Enviando solicitud POST:', { url: `${this.apiUrl}/user/${user_id}/role/${role_id}`, data });
    // El backend aún espera user_id, role_id en la URL y fechas en el body
    return this.http.post<UserRoles>(`${this.apiUrl}/user/${user_id}/role/${role_id}`, data);
  }

  update(theUserRole: UserRoles): Observable<UserRoles> {
    // Asegurarse de que las fechas estén en formato de string si el backend lo requiere
    const payload = {
      startAt: new Date(theUserRole.startAt).toISOString().split('T')[0],
      endAt: new Date(theUserRole.endAt).toISOString().split('T')[0],
      user_id: theUserRole.user_id,
      role_id: theUserRole.role_id
    };
    return this.http.put<UserRoles>(`${this.apiUrl}/${theUserRole.id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getRolesByuser_id(user_id: number): Observable<UserRoles[]> {
    return this.http.get<UserRoles[]>(`${this.apiUrl}/user/${user_id}`);
  }

  getUsersByrole_id(role_id: number): Observable<UserRoles[]> {
    return this.http.get<UserRoles[]>(`${this.apiUrl}/role/${role_id}`);
  }
}
