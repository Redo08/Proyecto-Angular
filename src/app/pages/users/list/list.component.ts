import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  users: User[] = [];
  constructor(private userService: UserService, private router: Router) { }// Inyección de dependencias

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
      }
    });
  }

  create() {
    this.router.navigate(['/users/create'])
  }

  view(id: number) {
    this.router.navigate([`/users/view/${id}`])
  }
  edit(id: number) {
    this.router.navigate([`/users/update/${id}`])
  }
  
  delete(id: number) {
    console.log("Delete user with id:", id);
    Swal.fire({
      title: 'Eliminar',
      text: "Está seguro que quiere eliminar el registro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.delete(id).
          subscribe(data => {
            Swal.fire(
              'Eliminado!',
              'Registro eliminado correctamente.',
              'success'
            )
            this.ngOnInit();
          });
      }
    })

  }
}
