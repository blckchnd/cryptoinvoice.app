import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import * as golos from 'golos-js';
golos.config.set('websocket', 'wss://api-full.golos.id/ws');

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

  getDynamicGlobalProperties() {
    return Observable.create((observer) => {
      golos.api.getDynamicGlobalProperties(function(err, data){
        if (data) {
          observer.next(data);
        }
      });
    });
  }

  multiBroadCast(operations, wif) {
    return Observable.create((observer) => {
      golos.broadcast.send( { operations: operations, extensions: [] }, { posting: wif },
        function(err, data) {
          if (data) {
            observer.next(data);
          } else {
            observer.next(err);
          }
        });
    });
  }
}
