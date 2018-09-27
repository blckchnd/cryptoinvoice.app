import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  pathToAssetsFolder = environment.pathToAssetsFolder;
  constructor(
    private renderer: Renderer2
  ) {
    this.renderer.addClass(document.body, 'home');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'home');
  }

}
