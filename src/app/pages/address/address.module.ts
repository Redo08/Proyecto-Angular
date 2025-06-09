import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { AddressRoutingModule } from './address-routing.module';
import { ManageComponent } from './manage/manage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ManageComponent
  ],
  imports: [
    CommonModule,
    AddressRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LeafletModule
  ]
})
export class AddressModule { }
