import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ITnsOAuthTokenResult } from 'nativescript-oauth2';
import { map } from 'rxjs/operators';
import * as localStorage from 'tns-core-modules/application-settings';
import { backend } from '../connection';
import { JwtHelperService } from '@auth0/angular-jwt';

import { RegisterInfo } from '../dataclasses/registerInfo';
import { LoggedUser } from '../dataclasses/logged-user';

const headers = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Root url
  public url = backend + '/auth/';
  // JSON Web token -helper to decode tokens
  private jwtHelp = new JwtHelperService();
  // Login condition which app-component's navbar will use
  public loginCond = new Subject<boolean>();


  constructor(private _http: HttpClient) { }

  
  // Creates headers for users. These will be validated in backend.
  public createHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'id': localStorage.getNumber('id').toString(),
      'token': localStorage.getString('token'),
      'username': localStorage.getString('username')
    });
    return headers;
  }


  /**
   * SENDS LOGIN-INFORMATION
   * 
   * Sends next value to Subject-variable.
   * 
   * @param {boolean} loggedIn True/false  
   */
  public sendLoginInfo(loggedIn: boolean): void {
    this.loginCond.next(loggedIn);
  }


  /**
   * RETURNS LOGIN CONDITION AS OBSERVABLE
   * 
   * Function which returns login-condition (true/false) to
   * components who subscribes to it.
   * 
   */
  public returnLoginInfo(): Observable<boolean> {
    return this.loginCond.asObservable();
  }


  /**
   * CHECKS TOKEN'S VALIDATION DATE
   * 
   * Function which'll check the validation date of token. If there's
   * no token or the token's date is expired, it'll return false meaning
   * that the user is not authorized.
   * 
   * If token is in localstorage and it's valid, it'll return true meaning
   * user is authorized. 
   * 
   * Because of this, the user won't need to login everytime they open the app.
   * 
   */
  public checkTokenDate(): boolean {
    const token = localStorage.getString('token');
    if (!token || this.jwtHelp.isTokenExpired(token)) {
      return false;
    }
    return true;
  }


  /**
   * CHANGES USER`S PASSWORD
   * 
   * Sends a HTTP-post query to the backend, which will then
   * confirm and change the password.
   * 
   * @param {string} oldPwd User's old password 
   * @param {string} newPwd User's new password
   * 
   */
  public changePassword(oldPwd: string, newPwd: string): Observable<boolean> {
    const id = localStorage.getNumber('id');
    const headers = ({ headers: this.createHeaders() });
    return this._http.post<boolean>(
      this.url + 'changepassword/' + id, { oldPwd, newPwd }, headers
    );
  }


  /**
   * NORMAL LOGIN
   * 
   * Sends username and password to backend for credentials -validation. Returns 
   * user information and token if success.
   * 
   * @param {string} username Username of the user who is trying to login 
   * @param {string} password Password of the user who is trying to login
   * 
   */
  public login(username: string, password: string): Observable<LoggedUser> {
    return this._http.post<LoggedUser>(`${this.url}login/`,
      { username, password }, headers
    );
  }


  /**
   * REGISTERING A NEW USER (NORMAL + SOCIAL)
   * 
   * Sends registration-data to backend for creating a new user. Depending on 
   * whether user made normal or social -registration, password or social-id will
   * be sent respectively.
   * 
   * @param {RegisterInfo} data Contains all data from new registration 
   * 
   */
  public register(data: RegisterInfo): Observable<LoggedUser> {
    return this._http.post<LoggedUser>(`${this.url}register/`, data, headers);
  }


  /**
   * SOCIAL LOGIN (OLD AND EXISTING SOCIAL-USERS)
   * 
   * Sends token gotten from social-login either from Facebook or Google. This token
   * will be validated in backend. User information and token will be returned if social-user
   * is already in database. If not, only social-id will be returned for social-registration.
   * 
   * @param {ITnsOAuthTokenResult} result Token-result gotten from social-login
   * @param {string} platform Which platform is used
   * 
   */
  public socialLogin(result: ITnsOAuthTokenResult, platform: string): Observable<LoggedUser> {
    // Depending on the platform, change the route of the social-login
    const route = platform === 'google' ? 'googlelogin' : 'fblogin';
    return this._http.post<LoggedUser>(this.url + route, result, headers)
      .pipe(map(res => {
        if (platform === 'google') {
          if (!res.redirect) {
            // Google -> Social login
            localStorage.setString('platform', platform);
            localStorage.setString('socialId', res.socialId);
          } else {
            // Google -> Social registration
            localStorage.setString('platform', platform);
            localStorage.setString('userCreds', JSON.stringify(res.user));
            localStorage.setString('token', res.token);
          }
        }
        return res;
      }
      ))
  }
}
