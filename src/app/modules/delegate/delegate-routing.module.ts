import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DelegateComponent} from "./delegate.component";

const delegateRoutes: Routes = [
  {path: '', component: DelegateComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(delegateRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DelegateRoutingModule {
}
