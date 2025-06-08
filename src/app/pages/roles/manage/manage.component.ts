import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from 'src/app/models/role.model';
import { RoleService } from 'src/app/services/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  rol:Role;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private roleService: RoleService,
    private router: Router,
    private theFormBuilder: FormBuilder // Define las reglas
  ) {
    this.trySend = false;
    this.rol = { id: 0 }; // Inicializar rol con valores por defecto
    // Hacemos llamados al configFormGroup
    this.configFormGroup();

   }

  ngOnInit(): void {
    const currentUrl = this.activatedRoute.snapshot.url.join("/");
    if (currentUrl.includes("view")) {
      this.mode = 1;
    } else if (currentUrl.includes("create")) {
      this.mode = 2;
    } else if (currentUrl.includes("update")) {
      this.mode = 3;
    }

    
    if (this.activatedRoute.snapshot.params.id) {
      this.rol.id = this.activatedRoute.snapshot.params.id;
      this.getRole(this.rol.id);
    }
  }

  configFormGroup() {
    console.log("creando o configurando para el modo: ", this.mode);
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      // lista, serán las reglas
      id: [{value: 0, disabled: true}],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    });

    // Para deshabilitar
    if (this.mode === 1) {
      this.theFormGroup.disable();
    } else{
      this.theFormGroup.enable();
      this.theFormGroup.get('id')?.disable();
    }
  }
  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  back(){
    this.router.navigate(['/roles/list']);
  }

  create(){
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
     this.roleService.create(this.theFormGroup.value).subscribe({
        next: (user) => {
          console.log("Rol creado:", user);
          Swal.fire({
            title: "Creado!",
            text: "Registro creado correctamente.",
            icon: "success",
          });
          this.router.navigate(["/roles/list"]);
        },
        error: (error) => {
          console.error("Error creando rol:", error);
        },
      });
  }

  update(){
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    const rolToUpdate= this.theFormGroup.getRawValue()
    this.roleService.update(rolToUpdate).subscribe({
      next: (role) => {
        console.log("Rol actualizado:", role);
        Swal.fire({
          title: "Actualizado!",
          text: "Registro actualizado correctamente.",
          icon: "success",
        });
        this.router.navigate(["/roles/list"]);
      },
      error: (error) => {
        console.error("Error actualizando rol:", error);
      },
    });
  }

  getRole(id: number) {
    this.roleService.view(id).subscribe({
      next: (role) => {
        this.rol = role;
        console.log("Rol obtenido:", this.rol);
        this.theFormGroup.patchValue({
          id: this.rol.id,
          name: this.rol.name,
          description: this.rol.description
        });
      },
      error: (error) => {
        console.error("Error fetching role:", error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo obtener el rol.',
          icon: 'error',
        });
      }
    });
  }



}
