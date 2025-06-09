import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permission } from 'src/app/models/permissions.model';
import { PermissionsService } from 'src/app/services/permissions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  permissions: Permission[];

  constructor(
    private service: PermissionsService,
    private router: Router
  ) { 
    this.permissions = [];
  }

  ngOnInit(): void {
    this.list();
  }

  list(): void {
    this.service.list().subscribe(data => {
      this.permissions = data;
      console.log('Permissions loaded:', this.permissions);
    });
  }

  create(): void {
    this.router.navigate(['/permissions/create']);
  }

  view(id: number): void {
    this.router.navigate([`/permissions/view/${id}`]);
  }

  edit(id: number): void {
    this.router.navigate([`/permissions/update/${id}`]);
  }

  delete(id: number): void {
    Swal.fire({
      title: 'Eliminar',
      text: 'Está seguro que quiere eliminar el registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe(data => {
          Swal.fire(
            'Eliminado!',
            'Registro eliminado correctamente.',
            'success'
          );
          this.list(); // Vuelve a cargar la lista después de eliminar
        }, error => {
          console.error('Error deleting permission:', error);
          Swal.fire(
            'Error!',
            'No se pudo eliminar el permiso.',
            'error'
          );
        });
      }
    });
  }

}
