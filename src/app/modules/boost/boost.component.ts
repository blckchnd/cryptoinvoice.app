import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GolosService} from "../../core/services/golos.service";
import {BehaviorSubject} from "rxjs";
import * as golos from 'golos-js';

@Component({
  selector: 'app-boost',
  templateUrl: './boost.component.html',
  styleUrls: ['./boost.component.scss']
})
export class BoostComponent implements OnInit {
  amount: string;
  sender: string;
  url: string;
  infoMessage: string;
  paymentForm: FormGroup;
  public accountNameInvalid = new BehaviorSubject<boolean>(false);
  public privateKeyInvalid = new BehaviorSubject<boolean>(false);
  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private golosService: GolosService) { }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        if (params) {
          this.amount = params['amount'];
          this.sender = params['sender'];
          this.url = params['url'];
        }
      });
    this.initForm();
  }

  initForm() {
    this.paymentForm = this.fb.group({
      account: [this.sender, [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9.\-_$@*!]{3,30}$/)
      ]],
      password: ['', [
        Validators.required,
      ]]
    });
  }

  sentPayment() {
    const account = this.paymentForm.get('account').value;
    const sendTo = 'uplift';
    const amount = this.amount + " GBG";
    this.golosService.getAccounts([account]).subscribe(res => {
      if (res.length > 0) {
        this.accountNameInvalid.next(false);
        this.privateKeyInvalid.next(false);
        const pubWif = res[0].active.key_auths[0][0];

        let wif = this.paymentForm.get('password').value;
        let isWIF = false;
        try {
          isWIF = golos.auth.wifIsValid(wif, pubWif);
        } catch (e) {
          console.log(e);
        }
        if (!isWIF) {
          var keys = golos.auth.getPrivateKeys(account, wif, ['active']);
          wif = keys.active;

          try {
            isWIF = golos.auth.wifIsValid(wif, pubWif);
          } catch (e) {
            console.error(e);
          }
        }
        if (!isWIF) {
          return this.privateKeyInvalid.next(true);
        }
        if (confirm("Send "+ amount + " from "+account+ " to "+sendTo+"?")) {
          golos.broadcast.transfer(wif, account, sendTo, amount, this.url, (err, result) => {
            console.log(err, result);
            if (err) {
              console.log(err);
              var jsone = JSON.stringify(err, null, 4);
              console.log(jsone);
              this.infoMessage = 'Error. Details:' + jsone;
              // document.getElementById('out').insertAdjacentHTML("afterbegin","<div class='err'><h2>Error!</h2>Details: <xmp>"+jsone+"</xmp></div>");
              return alert(err);
            }
            let json = JSON.stringify(result, null, 4);
            window.scrollTo(0, 0);
            this.infoMessage = 'Succes' + jsone;
            // document.getElementById('out').insertAdjacentHTML("afterbegin","<h2>Success!</h2><h3>Check uplift queue: <a href='https://uplift.rentmyvote.org'>https://uplift.rentmyvote.org</a></h3>RAW Transaction: </br><xmp>"+json+"</xmp>");
          });
        } else {
          return false;
        }
      } else {
        this.accountNameInvalid.next(true);
      }
    });
  }

}
