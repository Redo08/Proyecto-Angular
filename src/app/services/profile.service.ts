import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Profile } from '../models/profile.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los perfiles.
   * @returns Un Observable con un array de perfiles.
   */
  list(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${environment.url_ms_socket}/api/profiles`);
  }

  /**
   * Crea un nuevo perfil para un usuario específico, con o sin foto.
   * @param userId El ID del usuario al que se asocia el perfil.
   * @param phone El número de teléfono del perfil.
   * @param photo El archivo de la foto (opcional).
   * @returns Un Observable con el perfil creado.
   */
  create(userId: number, phone: string, photo: File | null = null): Observable<Profile> {
    const formData = new FormData();
    formData.append('phone', phone);
    if (photo) {
      formData.append('photo', photo); // 'photo' es el nombre del campo esperado por tu backend
    }

    // El endpoint es POST /api/profiles/user/{user_id}
    return this.http.post<Profile>(`${environment.url_ms_socket}/api/profiles/user/${userId}`, formData);
  }

  /**
   * Obtiene un perfil por su ID.
   * @param id El ID del perfil a obtener.
   * @returns Un Observable con el perfil encontrado.
   */
  view(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${environment.url_ms_socket}/api/profiles/${id}`);
  }

  /**
   * Actualiza un perfil existente, con o sin nueva foto.
   * @param profileId El ID del perfil a actualizar.
   * @param phone El número de teléfono actualizado.
   * @param photo El nuevo archivo de la foto (opcional).
   * @returns Un Observable con el perfil actualizado.
   */
  update(profileId: number, phone: string, photo: File | null = null): Observable<Profile> {
    const formData = new FormData();
    formData.append('phone', phone);
    if (photo) {
      formData.append('photo', photo);
    }

    // El endpoint es PUT /api/profiles/{id}
    return this.http.put<Profile>(`${environment.url_ms_socket}/api/profiles/${profileId}`, formData);
  }


  /**
   * Elimina un perfil por su ID.
   * @param id El ID del perfil a eliminar.
   * @returns Un Observable (generalmente vacío o con un mensaje de confirmación).
   */
  delete(id: number) {
    return this.http.delete<Profile>(`${environment.url_ms_socket}/api/profiles/${id}`);
  }


  /**
   * Este es el endpoint clave para la lógica "existe o no existe".
   * @param userId El ID del usuario asociado al perfil.
   * @returns Un Observable con el perfil encontrado. Retorna un error si no se encuentra. 404
   */
  getProfileByUserId(userId: number): Observable<Profile> {
    return this.http.get<Profile>(`${environment.url_ms_socket}/api/profiles/user/${userId}`).pipe(
      // Utilizamos catchError para manejar el caso donde el perfil no existe
      // Tu backend devuelve 404 si el perfil no se encuentra para ese usuario.
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.warn(`Profile for user ${userId} not found (404).`);
          return throwError(() => new Error('Profile not found for this user.'));
        }
        console.error(`Error fetching profile by user ID ${userId}:`, error);
        return throwError(() => new Error(`Error fetching profile: ${error.message}`)); // Re-lanzamos el error para que el componente lo maneje
      })
    );
  }
}
