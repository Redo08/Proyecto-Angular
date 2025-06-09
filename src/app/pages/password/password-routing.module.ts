import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';

const routes: Routes = [
  { path: 'passwords/list/:userId', component: ListComponent }, // Para ver historial de un usuario
  { path: 'passwords/create/:userId', component: ManageComponent }, // Para crear para un usuario
  { path: 'passwords/edit/:passwordId', component:ManageComponent }, // Para editar una contraseña específica
  

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasswordRoutingModule { }
