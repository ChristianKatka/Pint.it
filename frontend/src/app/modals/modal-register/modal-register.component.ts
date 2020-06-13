import { Component, OnInit } from '@angular/core';

import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';

import { UserService } from '~/app/services/user.service';
import { AuthService } from '~/app/services/auth.service';

import { RegisterInfo } from '../../dataclasses/registerInfo';
import { ConvertService } from '../../services/convert.service';


@Component({
  selector: 'ns-modal-register',
  templateUrl: './modal-register.component.html',
  styleUrls: ['./modal-register.component.css'],
  moduleId: module.id,
})
export class ModalRegisterComponent implements OnInit {

  // Register-info (username, pwd, social-id)
  public registerInfo = new RegisterInfo();
  // Tells component if it's registration with social-login
  public socialRegistration: boolean;

  // Check's username and pwd for any malicous characters
  public usernameMatch = new RegExp('^[a-zA-Z0-9]*$');
  public passwordMatch = new RegExp('^[öåäÄÖÅ]*$');

  // Info which tells if username is taken and/or valid
  public usernameInfo: string;
  // Indicator telling that username is being check
  public searchingUsername: boolean;

  constructor (
    private _userService: UserService,
    private _authService: AuthService,
    private _convertService: ConvertService,
    private _params: ModalDialogParams,
    public modal: ModalDialogService
  ) {}

  ngOnInit() {
    this.checkSocialRegistration();
  }


  /**
   * CHECKS WHETHER USER IS DOING NORMAL OR SOCIAL REGISTRATION
   * 
   * Function which'll check whether user is doing registration
   * normally or with the help of social-login (Google/Facebook).
   * 
   * If social-registration is true, user only has choose an username.
   * 
   */
  public checkSocialRegistration(): void {
    if (this._params.context) {
      this.socialRegistration = true;
      this.registerInfo.socialId = this._params.context;
    }
  }


  /**
   * CHECKS GIVEN USERNAME
   * 
   * Function which checks username given by the user. If the username
   * contains illegal characters or is taken by another user, an error 
   * message will be prompted to the user.
   * 
   * @param {boolean} calledFromButton (optional) If 
   * the check-function was called from the submit-button.
   *  
   */
  public checkUsername(calledFromButton?: boolean): void {
    if (this.registerInfo.username) {
      if (this.registerInfo.username.match(this.usernameMatch)) {
        this.searchingUsername = true;
        this._userService.checkUsername(this.registerInfo.username).subscribe(res => {
          this.searchingUsername = false;
          if (res.taken) this.usernameInfo = 'Käyttäjätunnus varattu';
          else {
            this.usernameInfo = 'OK';
            if (calledFromButton) this.register();
          }
        }, err => {
          console.error(err);
        });
      } else {
        this.usernameInfo = 'Ei erikoismerkkejä'
      }
    } else {
      this.usernameInfo = ''
    }
  }


  /**
   * REGISTERS A NEW USER (NORMAL & SOCIAL)
   * 
   * Function which registers a new user. First it'll check whether user
   * is doing a social-registration. If it's normal one, username and password
   * will be checked for any malicous characters. 
   * 
   * If registration fails, an error message will be prompted to user. If it
   * succeeds, modal will be closed while bringing user information and token back
   * to login-component.
   * 
   */
  public register(): void {
    if (this.socialRegistration || 
      (this.registerInfo.password && !this.registerInfo.password.match(this.passwordMatch))) {
      this._authService.register(this.registerInfo)
        .subscribe(res => {
          this._params.closeCallback(res);
        }, err => {
          console.error(err);
        })
    } else {
      this._convertService.convertPrompt('Salasana ei sisältää skandinaavisia aakkosia (Å, Ä & Ö)');
      this.registerInfo.password = '';
      this.registerInfo.rePassword = '';
    }
  }

}
