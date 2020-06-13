import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as localStorage from 'tns-core-modules/application-settings';

import { User } from '../dataclasses/user';
import { backend } from '~/app/connection';

const headers = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class UserService {

  public url = backend + '/user/';

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
   * SEARCHERS USERS BY THEIR USERNAMES WITH SEARCH-WORD
   * 
   * Function which'll do a HTTP-GET request to search users via 
   * search-word which'll target usernames. If any users are found,
   * username and img-name will be returned back to calling component.
   * 
   * @param {string} searchWord User's search-word, which will be used 
   * to search users (via username) 
   * 
   */
  public searchUsers(searchWord: string): Observable<User[]> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<User[]>(
      this.url + 'searchusers/' + searchWord, headers
    );
  }


  /**
   * SENDS USER'S NEW IMAGE TO BACKEND AS A STRING-FORMAT
   * 
   * Function which'll update user's profile-image. If updation is successful,
   * new image's name will be returned.
   * 
   * @param {string} base64image New profile-image in Base64String-type
   *  
   */
  public updateUserImage(base64image: string): Observable<{img: string}> {
    const headers = ({ headers: this.createHeaders() });
    const id = localStorage.getNumber('id');
    return this._http.put<{img: string}>(this.url + 'updateimage', { base64image, id }, headers);
  }

  
  /**
   * SENDS USER'S NEW BIO TO BACKEND
   * 
   * Function which'll update user's bio. If updation is successful, update bio
   * will be returned back to user.
   * 
   * @param {string} bio User's new (updated) bio
   * 
   */
  public updateUserBio(bio: string): Observable<{bio: string}> {
    bio = bio.replace(/\n\s*\n/g, '\n\n');
    const headers = ({ headers: this.createHeaders() });
    const id = localStorage.getNumber('id');
    return this._http.put<{bio: string}>(this.url + 'updatebio', { bio, id }, headers);
  }

  
  /**
   * GETS USER INFORMATION FROM DATABASE
   * 
   * A function which will be called when entering your own or someones profile.
   * Returns user information excluding password.
   * 
   * @param {string} Username User whose information we want to see
   * 
   */
  getProfile(username: string): Observable<User> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<User>(this.url + username, headers);
  };


  /**
   * CHECKS IF USERNAME IS TAKEN
   * 
   * Function which'll make HTTP-GET request to check whether username is taken.
   * Boolean value true/false will be returned.
   * 
   * @param {string} username Username which'll be checked 
   * 
   */
  checkUsername(username: string): Observable<{taken: boolean}> {
    return this._http.get<{taken: boolean}>(
      `${this.url}checkusername/${username}`, headers);
  }

}
