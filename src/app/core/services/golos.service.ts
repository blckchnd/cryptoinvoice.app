import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import * as golos from 'golos-js';

@Injectable({
  providedIn: 'root'
})
export class GolosService {

  constructor() { }

  public getAccounts(data) {
    return Observable.create((observer) => {
      golos.api.getAccounts(data, function (err, result) {
        if (result) {
          observer.next(result);
        } else {
          observer.next(err);
        }
      });
    });
  }
}
