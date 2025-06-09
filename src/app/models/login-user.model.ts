export class loginUser {
    id?:string;
    name?:string;
    email?:string;
    password?:string;
    token?:string;
    picture?: string;
    constructor() {
        this.id = '';
        this.name = '';
        this.email = '';
        this.password = '';
        this.token = '';
        this.picture = ''; // Inicializar también
  }
}
