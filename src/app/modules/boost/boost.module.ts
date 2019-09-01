import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoostComponent } from './boost.component';
import {BoostRoutingModule} from "./boost-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    BoostRoutingModule,
    SharedModule
  ],
  declarations: [BoostComponent]
})
export class BoostModule { }
