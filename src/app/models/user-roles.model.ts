import { Role } from "./role.model";
import { User } from "./user.model";

export class UserRoles {
    id?: string;
    startAt?: string;
    endAt?: string;   
    user_id?: number;
    role_id?: number;    
    user?: User; // Opcional, para incluir el objeto completo del usuario
    role?: Role; // Opcional, para incluir el objeto completo del rol

    // Más adelante podemos meter más relaciones
}
