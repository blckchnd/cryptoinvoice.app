import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BoostComponent} from "./boost.component";

const boostRoutes: Routes = [
  {path: '', component: BoostComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(boostRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BoostRoutingModule {
}
