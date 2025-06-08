import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient) { }
  list():Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.url_ms_socket}/api/roles`);
  }
  view(id: number): Observable<Role> {
    return this.http.get<Role>(`${environment.url_ms_socket}/api/roles/${id}`);
  }
  create(newRole: Role): Observable<Role> {
    delete newRole.id;
    return this.http.post<Role>(`${environment.url_ms_socket}/api/roles`, newRole);
  }
  update(theRole: Role): Observable<Role> {
    return this.http.put<Role>(`${environment.url_ms_socket}/api/roles/${theRole.id}`, theRole);
  }
  delete(id: number): Observable<Role> {
    return this.http.delete<Role>(`${environment.url_ms_socket}/api/roles/${id}`);
  }
}
