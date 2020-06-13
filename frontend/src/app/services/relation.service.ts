import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as localStorage from 'tns-core-modules/application-settings';

import { Relation } from '../dataclasses/relation';
import { backend } from '~/app/connection';


@Injectable({
  providedIn: 'root'
})
export class RelationService {

  public url = backend + '/relation/';

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
   * CHECKS WHETHER LOGGED IN USER FOLLOWS ANOTHER ONE
   * 
   * Function which checks whether another user already follows another one
   * via calling backend function. This function will be called everytime 
   * user goes to another's profile-page.
   * 
   * @param {number} follows Another user's ID whose relation will be checked
   * 
   */
  getFollowStatus(follows: number): Observable<any> {
    const headers = ({ headers: this.createHeaders() });
    const id = localStorage.getNumber('id');
    return this._http.get<any>(`${this.url}checkfollowing/${id}/${follows}`, headers);
  }


  /**
   * TOGGLE BETWEEN FOLLOW AND UNFOLLOW
   * 
   * Calls backend function which makes us relation between user. Follow / unfollow 
   * 
   * @param {number} follows User's ID whose profile you are visiting.
   * 
   */
  public toggleFollower(follows): Observable<Relation> {
    const headers = ({ headers: this.createHeaders() });
    const id = localStorage.getNumber('id');
    return this._http.post<Relation>(`${this.url}togglefollower`, { id, follows }, headers);
  }


  /**
   * GET FOLLOWERS FROM BACKEND
   * 
   * Calls backend function which counts how many people are followed by specific user.
   * If there's any rows found, it'll return that number as a JSON.
   * 
   * @param {number} userId The id of the user whose relations we're fetching
   * 
   */
  public getFollowers(userId: number): Observable<{ count: number }> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<{ count: number }>(`${this.url}followers/${userId}`,
      headers
    );
  };


  /**
   * GET AMOUNT OF PEOPLE USER IS FOLLOWING FROM BACKEND
   * 
   * Calls backend function which counts how many people specific user is following.
   * If there's any rows found, it'll return that number as a JSON.
   * 
   * @param {number} userId The id of the user whose relations we're fetching
   * 
   */
  public getFollowing(userId: number): Observable<{ count: number }> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<{ count: number }>(`${this.url}followed/${userId}`,
      headers
    );
  };


}
