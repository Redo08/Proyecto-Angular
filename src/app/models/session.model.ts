export class Session {
    id?: string;  // Se incluye para las respuestas
    user_id?: number; // user_id del backend
    token?: string;
    expiration: Date; // Usaremos tipo Date en TypeScript
    FACode?: string; // Puede ser opcional en el backend
    state: string;

}
