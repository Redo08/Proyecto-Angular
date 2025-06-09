import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';


@NgModule({
  declarations: [
    ListComponent,
    ManageComponent,
    RolePermissionsComponent
  ],
  imports: [
    CommonModule,
    RolesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class RolesModule { }
