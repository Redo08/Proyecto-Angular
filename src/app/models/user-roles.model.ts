import { Role } from "./role.model";
import { User } from "./user.model";

export class UserRoles {
    id?: number;
    startAt?: string;
    endAt?: string;   
    userId?: number;
    roleId?: number;    
    user?: User; // Opcional, para incluir el objeto completo del usuario
    role?: Role; // Opcional, para incluir el objeto completo del rol

    // Más adelante podemos meter más relaciones
}
