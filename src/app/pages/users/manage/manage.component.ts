import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2: create, 3: update
  user: User;
  theFormGroup: FormGroup;
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private theFormBuilder: FormBuilder // Define las reglas
  ) {
    this.trySend = false;
    this.user = { id: 0};
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
      this.user.id = this.activatedRoute.snapshot.params.id;
      this.getUser(this.user.id);
    }
  }

  configFormGroup() {
    console.log("creando");
    this.theFormGroup = this.theFormBuilder.group({
      // primer elemento del vector, valor por defecto
      // lista, serán las reglas
      id: [0, []],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    })
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls;
  }

  back() {
    this.router.navigate(["/users/list"]);
  }

  create() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    this.userService.create(this.theFormGroup.value).subscribe({
      next: (user) => {
        console.log("User created successfully:", user);
        Swal.fire({
          title: "Creado!",
          text: "Registro creado correctamente.",
          icon: "success",
        });
        this.router.navigate(["/users/list"]);
      },
      error: (error) => {
        console.error("Error creating user:", error);
      },
    });
  }

  update() {
    this.trySend = true;
    if (this.theFormGroup.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
      })
      return;
    }
    this.userService.update(this.user).subscribe({
      next: (user) => {
        console.log("User updated successfully:", user);
        Swal.fire({
          title: "Actualizado!",
          text: "Registro actualizado correctamente.",
          icon: "success",
        });
        this.router.navigate(["/users/list"]);
      },
      error: (error) => {
        console.error("Error updating user:", error);
      },
    });
  }

  getUser(id: number) {
    this.userService.view(id).subscribe({
      next: (user) => {
        this.user = user;
        console.log("User fetched successfuly:", this.user);
        this.theFormGroup.patchValue({
          id: this.user.id,
          name: this.user.name,
          email: this.user.email,
          password: this.user.password
        });      
      },
      error: (error) => {
        console.error("Error fetching User: ", error);
      },
    });
  }
  
}
