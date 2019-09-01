import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DelegateComponent} from "./delegate.component";
import {SharedModule} from "../../shared/shared.module";
import {DelegateRoutingModule} from "./delegate-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DelegateRoutingModule
  ],
  declarations: [DelegateComponent]
})
export class DelegateModule { }
