import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Theater } from "src/app/models/theater.model";
import { TheaterService } from "src/app/services/theater.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-manage",
  templateUrl: "./manage.component.html",
  styleUrls: ["./manage.component.scss"],
})
export class ManageComponent implements OnInit {
  mode: number; // 1: view, 2 create, 3 update
  theater: Theater;
  theFormGroup: FormGroup; // Policía de 
  trySend: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private theatersService: TheaterService,
    private router: Router,
    private theFormBuilder: FormBuilder // Definir las reglas
  ) {
    this.trySend = false;
    this.theater = { id: 0 };
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
      this.theater.id = this.activatedRoute.snapshot.params.id;
      this.getTheater(this.theater.id);
    }
  }
  configFormGroup() {
    console.log("creando")
      this.theFormGroup = this.theFormBuilder.group({
        // primer elemento del vector, valor por defecto
        // lista, serán las reglas
        id: [0, []],
        capacity: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
        location: ['', [Validators.required, Validators.minLength(2)]]
      })
  }

  get getTheFormGroup() {
    return this.theFormGroup.controls
  }

  back() {
    this.router.navigate(["/theaters/list"]);
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
    this.theatersService.create(this.theFormGroup.value).subscribe({
      next: (theater) => {
        console.log("Theater created successfully:", theater);
        Swal.fire({
          title: "Creado!",
          text: "Registro creado correctamente.",
          icon: "success",
        });
        this.router.navigate(["/theaters/list"]);
      },
      error: (error) => {
        console.error("Error creating theater:", error);
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
    this.theatersService.update(this.theater).subscribe({
      next: (theater) => {
        console.log("Theater updated successfully:", theater);
        Swal.fire({
          title: "Actualizado!",
          text: "Registro actualizado correctamente.",
          icon: "success",
        });
        this.router.navigate(["/theaters/list"]);
      },
      error: (error) => {
        console.error("Error updating theater:", error);
      },
    });
  }

  getTheater(id: number) {
    this.theatersService.view(id).subscribe({
      next: (theater) => {
        this.theater = theater;
        console.log("Theater fetched successfuly:", this.theater);
        this.theFormGroup.patchValue({
          id: this.theater.id,
          capacity: this.theater.capacity,
          location: this.theater.location
        });      
      },
      error: (error) => {
        console.error("Error fetching theater: ", error);
      },
    });
  }
}
