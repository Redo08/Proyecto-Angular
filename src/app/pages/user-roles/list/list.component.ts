import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from 'src/app/models/role.model';
import { UserRoles } from 'src/app/models/user-roles.model';
import { User } from 'src/app/models/user.model';
import { RoleService } from 'src/app/services/role.service';
import { UserRoleService } from 'src/app/services/user-role.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  userRoles: UserRoles[];
  users: User[] = [];
  roles: Role[] = [];

  constructor(
    private userRoleService: UserRoleService,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router) { }

  ngOnInit(): void {
    this.list();
    this.loadUsers();
    this.loadRoles();

  }
  list(): void {
    this.userRoleService.list().subscribe({
      next: (userRoles) => {
        this.userRoles = userRoles;
      }
    })
     
  }

  loadUsers(): void {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
      }
    });
  }

  loadRoles(): void {
    this.roleService.list().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
  }

  getUserName(user_id: number): string {
    const user = this.users.find(u => u.id === user_id);
    return user ? user.name : 'Desconocido';
  }

  getRoleName(role_id: number): string {
    const role = this.roles.find(r => r.id === role_id);
    return role ? role.name : 'Desconocido';
  }

  // Navigation methods
  create(){
    this.router.navigate(['user-roles/create']);
  }

  view(id: number) {
    this.router.navigate([`user-roles/view/${id}`]);
  }

  update(id: number){
    this.router.navigate([`user-roles/update/${id}`]);
  }

  delete(id: number) {
    Swal.fire({
      title: 'Eliminar',
      text: '¿Está seguro que quiere eliminar la asignación?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userRoleService.delete(id.toString()).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado!',
              'Asignación eliminada correctamente.',
              'success'
            );
            this.list();
          },
          error: (error) => {
            console.error('Error al eliminar asignación:', error);
            Swal.fire(
              'Error!',
              'No se pudo eliminar la asignación.',
              'error'
            );
          }
        });
      }
    });
  }

}
