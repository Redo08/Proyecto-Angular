import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from 'src/app/models/role.model';
import { UserRoles } from 'src/app/models/user-roles.model';
import { User } from 'src/app/models/user.model';
import { RoleService } from 'src/app/services/role.service';
import { UserRoleService } from 'src/app/services/user-role.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode: number; // 1: ver, 2: crear, 3: actualizar
  userRoleForm: FormGroup;
  users: User[] = [];
  roles: Role[] = [];
  trySend: boolean = false;
  userRole: UserRoles = { id: 0, userId: 0, roleId: 0, startAt: '', endAt: ''};

  constructor(
    private fb: FormBuilder,
    private userRoleService: UserRoleService,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userRoleForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();

    const currentUrl = this.route.snapshot.url.join('/');
    if (currentUrl.includes('view')) {
      this.mode = 1;
    } else if (currentUrl.includes('create')) {
      this.mode = 2;
    } else if (currentUrl.includes('update')) {
      this.mode = 3;
    } else {
      this.router.navigate(['user-roles/list']);
    }

    this.configFormGroup();

    if (this.route.snapshot.params['id']) {
      this.userRole.id = Number(this.route.snapshot.params['id']);
      this.getUserRole(this.userRole.id);
    }
  }

  configFormGroup(): void {
    this.userRoleForm = this.fb.group({
      userId: [{ value: null, disabled: this.mode === 1 || this.mode === 3 }, [Validators.required]],
      roleId: [{ value: null, disabled: this.mode === 1 || this.mode === 3 }, [Validators.required]],
      startAt: ['', [Validators.required]],
      endAt: ['', [Validators.required]],
    }, { validators: this.dateRangeValidator });

    if (this.mode === 1) {
      this.userRoleForm.disable();
    }
  }

  get f() {
    return this.userRoleForm.controls;
  }
  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startAt = group.get('startAt')?.value;
    const endAt = group.get('endAt')?.value;
    console.log('Validando rango de fechas:', startAt, endAt);
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      return { invalidDateRange: true };
    }
    return null;
  }
  formatDateToBackend(dateTime: string): string {
    // Convierte YYYY-MM-DD a YYYY-MM-DD HH:MM:SS
    if (!dateTime) return '';
    return dateTime.replace('T', ' ') + ':00';
  }

  loadUsers(): void {
    this.userService.list().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  loadRoles(): void {
    this.roleService.list().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  getUserRole(id: number): void {
    this.userRoleService.view(id.toString()).subscribe({
      next: (userRole) => {
        this.userRole = userRole;
        const startAtFormatted = userRole.startAt ? userRole.startAt.replace(' ', 'T').slice(0, 16) : '';
        const endAtFormatted = userRole.endAt ? userRole.endAt.replace(' ', 'T').slice(0, 16) : '';
        this.userRoleForm.patchValue({
          userId: userRole.userId,
          roleId: userRole.roleId,
          startAt: startAtFormatted,
          endAt: endAtFormatted
        });
      },
      error: (error) => {
        console.error('Error al cargar asignación:', error);
        Swal.fire('Error', 'No se pudo cargar la asignación.', 'error');
      }
    });
  }

  back(): void {
    this.router.navigate(['user-roles/list']);
  }

  create(): void {
    this.trySend = true;
    if (this.userRoleForm.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error'
      });
      return;
    }
    const formData = this.userRoleForm.value;
    const payload = {
      startAt: this.formatDateToBackend(formData.startAt),
      endAt: this.formatDateToBackend(formData.endAt)
    };
    console.log('Valores del formulario:', formData);
    console.log('Payload antes de enviar:', payload);

    this.userRoleService.create(formData.userId, formData.roleId,payload)
    .subscribe({
      next: () => {
        Swal.fire({
          title: 'Creado!',
          text: 'Asignación creada correctamente.',
          icon: 'success'
        });
        this.router.navigate(['user-roles/list']);
      },
      error: (error) => {
        console.error('Error al crear asignación:', error);
        Swal.fire('Error', 'No se pudo crear la asignación.', 'error');
      }
    });
  }

  update(): void {
    this.trySend = true;
    if (this.userRoleForm.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error'
      });
      return;
    }
    const formData = this.userRoleForm.getRawValue();
    const updatedUserRole: UserRoles = {
      id: this.userRole.id,
      userId: formData.userId,
      roleId: formData.roleId,
      startAt: this.formatDateToBackend(formData.startAt),
      endAt: this.formatDateToBackend(formData.endAt)
    };
    this.userRoleService.update(updatedUserRole).subscribe({
      next: () => {
        Swal.fire({
          title: 'Actualizado!',
          text: 'Asignación actualizada correctamente.',
          icon: 'success'
        });
        this.router.navigate(['user-roles/list']);
      },
      error: (error) => {
        console.error('Error al actualizar asignación:', error);
        Swal.fire('Error', 'No se pudo actualizar la asignación.', 'error');
      }
    });
  }
}