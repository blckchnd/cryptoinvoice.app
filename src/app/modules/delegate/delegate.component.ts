import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {GolosService} from "../../core/services/golos.service";
import * as golos from 'golos-js';
golos.config.set('websocket', 'wss://api.golos.blckchnd.com/ws');

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit, OnDestroy {
  amount: number;
  sender: string;
  sendTo: string;
  memo: string;
  url: string;
  redirect_uri: string;
  infoMessage: string;
  transferTo = 'challenger';
  totalVestingShares: number;
  totalVestingFund: number;
  delegatedVest: string;
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
          this.memo = params['memo'];
          this.url = params['url'];
          this.redirect_uri = params['redirect_uri'];
        }
      });
    this.initForm();
    this.getGlobalProperties();
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
        this.getDelegatedVest();
        if (confirm('Send ' + this.delegatedVest + ' from ' + account + ' to ' + this.sendTo + '?')) {
          golos.broadcast.delegateVestingShares(wif, account, this.sendTo, this.delegatedVest, (err, result) => {
            console.log(err, result);
            if (err) {
              return this.infoMessage = 'Error. Details:' + err.message;
            }

            golos.broadcast.transfer(wif, account, this.transferTo, '0.001 GBG', this.memo, (err, result) => {
              console.log(err, result);
              if (err) {
                return this.infoMessage = 'Error. Details:' + err.message;
              }
              this.isOperationSuccess = true;
              this.infoMessage = 'Delegation success';
              this.paymentForm.get('password').setValue('');
              if (this.redirect_uri) {
                this.redirectBack();
              }
            });

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

  getGlobalProperties() {
    this.golosService.getDynamicGlobalProperties().subscribe(result => {
      this.totalVestingShares = result.total_vesting_shares.split(' ')[0];
      this.totalVestingFund = result.total_vesting_fund_steem.split(' ')[0];
    });
  }

  getDelegatedVest() {
    return this.delegatedVest = (this.amount * this.totalVestingShares / this.totalVestingFund)
      .toFixed(6).toString()+' GESTS';
  }

}
