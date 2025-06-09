import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';

const routes: Routes = [
   // Cuando la ruta completa sea '/users/:userId/passwords', se mostrará ListComponent
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {path: 'list',component: ListComponent, // Usa tu ListComponent
     // Opcional: si quieres proteger estas rutas individualmente
  }, 

  // Para crear una contraseña: '/users/:userId/passwords/create'
  { path: 'create', component: ManageComponent }, 

  // Para editar una contraseña específica: '/users/:userId/passwords/:passwordId/edit'
  { path: ':passwordId/view', component: ManageComponent },
  // Ruta para editar una contraseña específica (ej: /users/:userId/passwords/:passwordId/edit)
  { path: ':passwordId/edit', component: ManageComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasswordRoutingModule { }
