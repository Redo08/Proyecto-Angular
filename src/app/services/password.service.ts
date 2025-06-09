import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Password } from '../models/password.model';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = `${environment.url_ms_socket}/api/passwords`;
  constructor(private http:HttpClient) { }
 
  list(): Observable<Password[]> {
    return this.http.get<Password[]>(this.apiUrl)    
  }

  getPasswordById(passwordId: number): Observable<Password> {
    return this.http.get<Password>(`${this.apiUrl}/${passwordId}`)
    
  }

  getPasswordsByUserId(userId: number): Observable<Password[]> {
    return this.http.get<Password[]>(`${this.apiUrl}/user/${userId}`)
      
  }

  view(userId: number): Observable<Password> {
    return this.http.get<Password>(`${this.apiUrl}/user/${userId}/current`)
    
  }

  create(userId: number, passwordData: Partial<Password>): Observable<Password> {
    // Asegúrate de que las fechas se envíen en un formato que tu backend entienda,
    // por ejemplo, ISO string, si tu backend las espera como strings.
    const dataToSend = {
      ...passwordData,
      startAt: passwordData.startAt instanceof Date ? passwordData.startAt.toISOString().slice(0, 19).replace('T', ' ') : passwordData.startAt,
      endAt: passwordData.endAt instanceof Date ? passwordData.endAt.toISOString().slice(0, 19).replace('T', ' ') : passwordData.endAt,
    };
    return this.http.post<Password>(`${this.apiUrl}/user/${userId}`, dataToSend)
  }

  update(passwordId: number, passwordData: Partial<Password>): Observable<Password> {
    const dataToSend = {
      ...passwordData,
      startAt: passwordData.startAt instanceof Date ? passwordData.startAt.toISOString().slice(0, 19).replace('T', ' ') : passwordData.startAt,
      endAt: passwordData.endAt instanceof Date ? passwordData.endAt.toISOString().slice(0, 19).replace('T', ' ') : passwordData.endAt,
    };
    return this.http.put<Password>(`${this.apiUrl}/${passwordId}`, dataToSend)
  }

  delete(passwordId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${passwordId}`);
  }
}
