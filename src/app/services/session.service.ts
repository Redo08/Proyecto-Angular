import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) { }

  // Helper para pasear fechas
  private parseSessionDates(session: Session): Session {
    if (typeof session.expiration === 'string') {
      session.expiration = new Date(session.expiration)
    }
    // Aqui puedo poner para modificar la información del created_at y del updated_at

    return session;
  }

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.url_ms_socket}/api/sessions`).pipe(
      map(sessions => sessions.map(session => this.parseSessionDates(session)))
    );
  }

  getSessionById(id: string): Observable<Session> {
    return this.http.get<Session>(`${environment.url_ms_socket}/api/sessions/${id}`).pipe(
      map(session => this.parseSessionDates(session))
    );
  }

  getSessionsByUserId(userId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.url_ms_socket}/api/sessions/user/${userId}`).pipe(
      map(sessions => sessions.map(session => this.parseSessionDates(session)))
    );
  }

  createSession(userId: number, sessionData: Partial<Session>): Observable<Session> {
    // El backend espera 'expiration' como string con formato específico.
    // Aseguramos que la fecha se envíe en el formato correcto si no es una cadena.
    if (sessionData.expiration instanceof Date) {
      (sessionData.expiration as any) = sessionData.expiration.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
    }
    const payload = { ...sessionData }; // El backend recibe user_id
    payload.user_id = userId;
    
    return this.http.post<Session>(`${environment.url_ms_socket}/api/sessions/user/${userId}`, payload).pipe(
      map(session => this.parseSessionDates(session))
    );
  }

  updateSession(sessionId: String, sessionData: Partial<Session>): Observable<Session> {
    // El backend espera 'expiration' como string con formato específico.
    if (sessionData.expiration instanceof Date) {
      (sessionData.expiration as any) = sessionData.expiration.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
    }
    return this.http.put<Session>(`${environment.url_ms_socket}/api/sessions/${sessionId}`, sessionData).pipe(
      map(session => this.parseSessionDates(session))
    );
  }

  deleteSession(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.url_ms_socket}/api/sessions/${id}`)
  }
}
