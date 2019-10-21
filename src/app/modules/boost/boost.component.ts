import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GolosService} from '../../core/services/golos.service';
import {BehaviorSubject} from 'rxjs';
import * as golos from 'golos-js';
import {environment} from '../../../environments/environment';
golos.config.set('websocket', 'wss://api-full.golos.id/ws');

@Component({
  selector: 'app-boost',
  templateUrl: './boost.component.html',
  styleUrls: ['./boost.component.scss']
})
export class BoostComponent implements OnInit, OnDestroy {
  amount: string;
  sender: string;
  sendTo: string;
  url: string;
  redirect_uri: string;
  infoMessage: string;
  isOperationSuccess = false;
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
          this.sendTo = params['send_to'];
          this.url = params['url'];
          this.redirect_uri = params['redirect_uri'];
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
    this.isOperationSuccess = false;
    const account = this.paymentForm.get('account').value;
    const amount = this.amount;
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
        if (confirm('Send ' + amount + ' from ' + account + ' to ' + this.sendTo + '?')) {
          golos.broadcast.transfer(wif, account, this.sendTo, amount, this.url, (err, result) => {
            console.log(err, result);
            if (err) {
              return this.infoMessage = 'Error. Details:' + err.message;
            }
            this.isOperationSuccess = true;
            this.infoMessage = 'Success! ' + 'Check uplift queue: ' +
              `<a href='https://rentmyvote.org/dashboard/rentmyvote/bids' 
                target="_blank">https://rentmyvote.org/dashboard/rentmyvote/bids</a>`;
            this.paymentForm.get('password').setValue('');
            if (this.redirect_uri) {
              this.redirectBack();
            }
          });
        } else {
          return false;
        }
      } else {
        this.accountNameInvalid.next(true);
      }
    });
  }

  redirectBack() {
    setTimeout(() => {
      window.location.replace(this.redirect_uri);
    },5000)
  }

}
