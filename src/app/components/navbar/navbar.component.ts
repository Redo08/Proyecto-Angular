import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/services/security.service';
import { Subscription } from 'rxjs';
import { loginUser } from 'src/app/models/login-user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  user: loginUser;
  subscription: Subscription;

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private securityService: SecurityService,
    // private webSocketService: WebSocketService
  ) {
    this.location = location;
    this.user = new loginUser();
    this.subscription = this.securityService.getUser().subscribe(data => {
      this.user = data;
    })
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    // this.webSocketService.setNameEvent("new_notification"); // Tiene que ser el mismo nombre que el del Backend
    // this.webSocketService.callback.subscribe((data: any) => {
    //   console.log("Nueva notificación recibida: ", data);
    // });
  }
  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return 'Dashboard';
  }

  logout() {
    this.securityService.logout()
  }

}
