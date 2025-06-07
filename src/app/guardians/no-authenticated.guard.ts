import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthenticatedGuard implements CanActivate {
  constructor (private securityService: SecurityService,
    private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,  // Dice a que ruta estan intentando entrar
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.securityService.existSession()) { // Es para que si ya esta autenticado no le muestre paginas como /login
      return true;
    } else {
      this.router.navigate(['/dashboard'])
      return false;
    }
  }
  
}
