import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GolosService} from '../../core/services/golos.service';
import {BehaviorSubject} from 'rxjs';
import * as golos from 'golos-js';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-boost',
  templateUrl: './boost.component.html',
  styleUrls: ['./boost.component.scss']
})
export class BoostComponent implements OnInit, OnDestroy {
  amount: string;
  sender: string;
  url: string;
  infoMessage: string;
  isOperationSucces = false;
  paymentForm: FormGroup;
  public accountNameInvalid = new BehaviorSubject<boolean>(false);
  public privateKeyInvalid = new BehaviorSubject<boolean>(false);
  pathToAssetsFolder = environment.pathToAssetsFolder;
  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private golosService: GolosService,
              private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'boost');
  }

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

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'boost');
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
    this.infoMessage = '';
    this.isOperationSucces = false;
    const account = this.paymentForm.get('account').value;
    const sendTo = 'broker1';
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
        if (confirm('Send ' + amount + ' from ' + account + ' to ' + sendTo + '?')) {
          golos.broadcast.transfer(wif, account, sendTo, amount, this.url, (err, result) => {
            console.log(err, result);
            if (err) {
              return this.infoMessage = 'Error. Details:' + err.message;
            }
            this.isOperationSucces = true;
            this.infoMessage = 'Succes! ' + 'Check uplift queue: ' +
              `<a href='https://uplift.rentmyvote.org' target="_blank">https://uplift.rentmyvote.org</a>`;
            this.paymentForm.get('password').setValue('');
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
