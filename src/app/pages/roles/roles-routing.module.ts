import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';
import { RolePermissionsComponent } from './role-permissions/role-permissions.component';

const routes: Routes = [
  {path:"list", component:ListComponent},
  {path:"create",component:ManageComponent},
  {path:"update/:id",component:ManageComponent},
  {path:"view/:id",component:ManageComponent},
  //{path:"delete/:id",component:ManageComponent} No es necesario ya se hace desde el list
  { path: ":id/permissions", component: RolePermissionsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
