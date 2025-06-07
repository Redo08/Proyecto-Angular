import { Seat } from "./seat.model";

export class Theater { // Se sacan atributos de diagrama de clases
    id?: number;
    location?: string;
    capacity?: number;
    seas?: Seat[];
}
