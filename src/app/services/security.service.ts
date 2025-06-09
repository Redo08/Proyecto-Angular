import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { loginUser } from '../models/login-user.model';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  theUser = new BehaviorSubject<loginUser>(new loginUser); // Definición global
  constructor(private http: HttpClient) { 
    this.verifyActualSession()
  }

  /**   
  * Realiza la petición al backend con el correo y la contraseña
  * para verificar si existe o no en la plataforma
  * @param infoUsuario JSON con la información de correo y contraseña
  * @returns Respuesta HTTP la cual indica si el usuario tiene permiso de acceso
  */
  login(user: loginUser): Observable<any> {
    return this.http.post<any>(`${environment.url_ms_cinema}/login`, user); // Crear nuevo postman para seguridad
  }
  /*
  Guardar la información de usuario en el local storage
  */
  saveSession(dataSesion: any) {
    let data: loginUser = {
      id: dataSesion["user"]["id"] || dataSesion["user"]?.id || dataSesion["user"]?.sub,
      name: dataSesion["user"]["name"] || dataSesion["user"]?.name,
      email: dataSesion["user"]["email"] || dataSesion["user"]?.email,
      password: "",
      token: dataSesion["token"],
      picture: dataSesion["user"]?.picture || ""
    };
    localStorage.setItem('sesion', JSON.stringify(data));
    this.setUser(data);
  }
  /**
    * Permite actualizar la información del usuario
    * que acabó de validarse correctamente
    * @param user información del usuario logueado
  */
  setUser(user: loginUser) {
    this.theUser.next(user);
  }
  /**
  * Permite obtener la información del usuario
  * con datos tales como el identificador y el token
  * @returns
  */
  getUser() {
    return this.theUser.asObservable();
  }
  /**
    * Permite obtener la información de usuario
    * que tiene la función activa y servirá
    * para acceder a la información del token
*/
  public get activeUserSession(): loginUser {
    return this.theUser.value;
  }


  /**
  * Permite cerrar la sesión del usuario
  * que estaba previamente logueado
  */
  logout() {
    localStorage.removeItem('sesion');
    this.setUser(new loginUser());
    // Si usas Google Sign-In, también puedes revocar el token de Google si quieres
    if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect(); // Evita el auto-login en el siguiente intento
        // No hay un método directo para "logout" de Google Identity Services en el frontend
        // pero deshabilitar auto-select y limpiar tu sesión local es suficiente.
    }
  }
  /**
  * Permite verificar si actualmente en el local storage
  * existe información de un usuario previamente logueado
  */
  verifyActualSession() {
    let actualSesion = this.getSessionData();
    if (actualSesion) {
      this.setUser(JSON.parse(actualSesion));
    }
  }
  /**
  * Verifica si hay una sesion activa
  * @returns
  */
  existSession(): boolean {
    let sesionActual = this.getSessionData();
    return (sesionActual) ? true : false;
  }
  /**
  * Permite obtener los dato de la sesión activa en el
  * local storage
  * @returns
  */
  getSessionData() {
    let sesionActual = localStorage.getItem('sesion');
    return sesionActual;
  }
}

