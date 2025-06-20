import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TheatersRoutingModule } from "./theaters-routing.module";
import { ListComponent } from "./list/list.component";
import { ManageComponent } from "./manage/manage.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [ListComponent, ManageComponent],
  imports: [
    CommonModule,
    TheatersRoutingModule,
    FormsModule, // Permite que se active la reactividad
    ReactiveFormsModule,
  ],
})
export class TheatersModule {}
