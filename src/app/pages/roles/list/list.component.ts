import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from 'src/app/models/role.model';
import { RoleService } from 'src/app/services/role.service';
import { json } from 'stream/consumers';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  roles:Role[]
  constructor(private service:RoleService,  private router: Router) { 
    this.roles = [];

  }

  ngOnInit(): void {
    this.list();

  }
  list(){
    this.service.list().subscribe(data=>{
      this.roles = data
      console.log(JSON.stringify(this.roles));

    });

  }
   create() {
      this.router.navigate(['/roles/create'])
    }
    view(id: number) {
      this.router.navigate([`/roles/view/${id}`])
    }
    edit(id: number) {
      this.router.navigate([`/roles/update/${id}`])
    }
    
    delete(id: number) {
      console.log("Delete theater with id:", id);
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
          this.service.delete(id).
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
