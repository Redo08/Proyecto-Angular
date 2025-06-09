import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { ManageComponent } from './manage/manage.component';

const routes: Routes = [
  { path: '', component: ListComponent }, // Ruta vacía para la lista de sesiones por usuario
  { path: 'create', component: ManageComponent },
  { path: ':sessionId/view', component: ManageComponent }, // Ahora se resolverá como /users/:userId/sessions/:sessionId/view
  { path: ':sessionId/edit', component: ManageComponent }, // Ahora se resolverá como /users/:userId/sessions/:sessionId/edit
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule { }
