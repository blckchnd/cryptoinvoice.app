import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit, OnDestroy {

  constructor(
    private renderer: Renderer2
  ) {
    this.renderer.addClass(document.body, 'not-found');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'not-found');
  }

}
