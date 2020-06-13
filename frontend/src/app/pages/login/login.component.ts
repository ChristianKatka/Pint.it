// Libraries
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { Router } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import { ITnsOAuthTokenResult } from 'nativescript-oauth2';
import { tnsOauthLogin } from '../../auth/oauth-login';
import * as localStorage from 'tns-core-modules/application-settings';

// Modal libraries
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { ModalRegisterComponent } from '~/app/modals/modal-register/modal-register.component';

// Services
import { AuthService } from '~/app/services/auth.service';
import { ConvertService } from '../../services/convert.service';
// Dataclasses
import { LoggedUser } from '~/app/dataclasses/logged-user';



@Component({
  selector: 'ns-login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  // User-information for normal login
  public username: string;
  public password: string;

  // Checks username and password for wrong characters
  public usernameMatch = new RegExp('^[a-zA-Z0-9]*$');
  public passwordMatch = new RegExp('^[öåäÄÖÅ]*$');

  // Visual indicator telling that logging is in process
  public logging: boolean;


  constructor (
    public router: Router,
    public modal: ModalDialogService,
    public vcRef: ViewContainerRef,
    public page: Page,
    public routerExtension: RouterExtensions,
    private _authService: AuthService,
    private _convertService: ConvertService,
  ) {}

  ngOnInit(): void {
    this.checkTokenDate();
    this.page.actionBarHidden = true;
    const interval = setInterval(() => {
      if (localStorage.getString('platform') === 'google') {
        if (localStorage.getString('token')) {
          clearInterval(interval);
          this.navigateFrontpage();
          return;
        }
        if (localStorage.getString('socialId')) {
          clearInterval(interval);
          this.register(localStorage.getString('socialId'));
          return;
        }
      }
    }, 500);
  }


  // Check token expriation -date
  public checkTokenDate(): void {
    if (this._authService.checkTokenDate()) {
      this.navigateFrontpage(null, true);
    } else {
      this._authService.sendLoginInfo(false);
    }
  }


  /**
   * NAVIGATES USER TO FRONTPAGE
   * 
   * Function which'll firstly store all necessary information from the 
   * user to local-storage. After all the necessary information is stored, user
   * will be navigated to frontpage.
   * 
   * If user does Google's social-login and is already an existing user, data-variable
   * will be empty. There's a specific section in Auth.Service's function which stores
   * important data to local-storage. These will be inserted to specific points in 
   * localstorage in this function.
   * 
   * @param {LoggedUser} data Includes all the data from l{ogged user (optional)
   * @param {boolean} skip If localstorage-process will be skipped
   * 
   */
  public navigateFrontpage(data?: LoggedUser, skip?: boolean): void {

    if (!skip) {
      
      // If user data is being passed through parameter
      if (data) {
        localStorage.setNumber('id', data.user.id);
        localStorage.setString('username', data.user.username);
        localStorage.setString('token', data.token);
        if (data.user.img) localStorage.setString('img', data.user.img);
        if (data.user.bio) localStorage.setString('bio', data.user.bio)
      }
      // If there's no data (ONLY GOOGLE'S SOCIAL LOGIN WITHOUT SOCIAL-REGISTRATION)
      else {
        const creds = JSON.parse(localStorage.getString('userCreds'));
        localStorage.remove('userCreds');
        localStorage.setNumber('id', creds.id);
        localStorage.setString('username', creds.username);
        if (creds.bio) localStorage.setString('bio', creds.bio);
        if (creds.img) localStorage.setString('img', creds.img);
      } 
    }

    this._authService.sendLoginInfo(true);

    // Navigate to frontpage
    setTimeout(() => {
      this.routerExtension.navigate(['/frontpage'], {
        animated: true,
        transition: { name: 'slide', duration: 200, curve: 'easeInOut' },
        clearHistory: true
      });
    }, 50);
  }


  /**
   * NORMAL AND SOCIAL REGISTRATION
   * 
   * Function which opens a registration modal. In case user has used 
   * social API's for logging, social-id will be included in the modal.
   * If registration is successful, user-information and token will be 
   * pushed to navigate-function. 
   * 
   * @param {string} socialId If user is using social API's for 
   * registration (optional)
   *  
   */
  public register(socialId?: string): void {
    localStorage.clear();
    const options: ModalDialogOptions = {
      context: socialId ? socialId : '',
      fullscreen: false,
      viewContainerRef: this.vcRef
    };
    this.modal.showModal(ModalRegisterComponent, options).then(res => {
      if (res) {
        this.navigateFrontpage(res);
      }
    });
  }


  /**
   * NORMAL LOGIN
   * 
   * Function which'll do a normal login to user. First the function will check
   * whether username and password are valid ones before continuing. 
   * 
   * If login is successful, another function will be called bringing user 
   * information and token with it.
   * 
   */
  public login(): void {
    if (this.username.match(this.usernameMatch)) { 
      if (!this.password.match(this.passwordMatch)) {
        this.logging = true;
        this._authService.login(this.username, this.password).subscribe(
          res => {
            this.logging = false;
            localStorage.clear();
            this.navigateFrontpage(res);
          },
          err => {
            console.error(err);
            this.logging = false;
            this._convertService.convertPrompt('Väärä käyttäjätunnus / salasana', 'Kirjautuminen epäonnistui');
            this.username = '';
            this.password = '';
          }
        );
      } else {
        this._convertService.convertPrompt('Salasana ei saa sisältää (Ä, Ö tai Å)', 'Kirjautuminen epäonnistui');
        this.password = '';
      }
    } else {
        this._convertService.convertPrompt('Käyttäjätunnus hyväksyy (A-Z) & (0-9)', 'Kirjautuminen epäonnistui', null, 1);
        this.username = '';
      } 
  }


  /**
   * SOCIAL LOGIN WITH GOOGLE+ AND FACEBOOK
   * 
   * Function which'll handle social login. First it'll call an external function 
   * (tnsOauthLogin) with platform of user's choosing. If social login is successful
   * token will be returned which can be used to get information about an social-user.
   * 
   * This result will be used with AuthService's function call. After backend has processed 
   * the token, it'll return a prefined set of data back, which can be:
   * 
   * A) New social user => { redirect: false, socialId: socialId }
   *  User will be brought to register-modal where he/she chooses an username.
   * 
   * B) Existing social user => { redirect: true, user: user, token: token }
   *  User will be navigated to frontpage.
   * 
   * @param {string} platform Which social-platform user will use (Google/Facebook)
   * 
   * @ALERT There's a bug with Google's social login. After the social-login is successful,
   * function cannot automatically navigate to different pages or open register -modal. 
   * Because of this, manual interaction is needed from user. User is prompted to press
   * Google's social-login button again to finish the social-registration/login.
   * 
   */
  public socialLogin(platform: string): void {
    tnsOauthLogin(platform)
      .then((result: ITnsOAuthTokenResult) => {
        this._authService.socialLogin(result, platform).subscribe(
          res => {
            if (!res.redirect) {
              if (platform === 'facebook') {
                this.register(res.socialId);
              }
            } else {
              if (platform === 'facebook') {
                this.navigateFrontpage(res);
              }
            }
          },
          err => {
            console.error(err);
             this._convertService.convertPrompt('Sosiaalinen kirjautuminen epäonnistui');
          }
        );
      }).catch(err => {
        console.error(err);
        this._convertService.convertPrompt('Sosiaalinen kirjautuminen epäonnistui');
      });
  }
}