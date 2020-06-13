import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as localStorage from 'tns-core-modules/application-settings';
import { ConvertService } from './convert.service';
import { backend } from '~/app/connection';
import { map } from 'rxjs/operators';

import { Notification } from '../dataclasses/notification';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public url = backend + '/notification/';

  constructor (
    private _http: HttpClient,
    private _convertService: ConvertService
  ) {}


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
   * CREATES NOTIFICATION
   * 
   * Creates notification for the user that it affects. When the function is called it makes a
   * http post call to the backed which then creates notification to the database.
   * 
   * @param {string} owner Who will receive the notification (will be converted to user's ID in backend)
   * @param {number} type What type of notification it is (e.g. 0 = someone started following you)
   * @param {number} postId To what post the notification is in par with (optional)
   * @param {number} commentId To what comment the notification is in par with (optional)
   * 
   */
  public createNotification(owner: string, type: number, postId?: number, commentId?: number): Observable<Notification> {
    const headers = ({ headers: this.createHeaders() });
    const notification = new Notification();
      notification.peer_user = localStorage.getString('username');
      notification.username = owner;
      notification.type = type;
      notification.post_id = postId;
      notification.comment_id = commentId;
    return this._http.post<Notification>(this.url + 'createnotification', notification, headers);
  }


  /**
   * DELETES NOTIFICATION
   * 
   * Creates HTTP-DELETE request to backend which'll try to delete a notification according to
   * 3 different values (we won't be needing notification's ID for this). Since DELETE cannot 
   * get BODY, we'll bring these values through parametres. 
   * 
   * @param {number} username Username of the notification's owner
   * @param {number} type What type of notification will be destroyed
   * @param {number} postId ID which is involved in that specific notification
   * @param {number} commentId ID which is involved in that specific notification
   * 
   */
  public deleteNotification(username: string, type: number, postId?: number, commentId?: number): Observable<boolean> {
    const headers = ({ headers: this.createHeaders() });
    const peer_user = localStorage.getString('username');
    return this._http.delete<boolean>(
      `${this.url}deletenotification/${username}/${peer_user}/${type}/${postId}/${commentId}`, headers
    );
  }


  /**
   * GET NOTIFICATION-DATA FROM BACKEND SERVER
   * 
   * Get notifications for that user who is logged in to the application.
   * Makes http get call to the backend what queryes the database and returns the results.
   * 
   */
  public getNotification(): Observable<Notification[]> {
    const headers = ({ headers: this.createHeaders() });
    const id = localStorage.getNumber('id');
    return this._http.get<Notification[]>(`${this.url}getnotifications/${id}`, headers)
      .pipe(map(res => {
        res.forEach(n => {
          n.date = this._convertService.convertDate(n.createdAt);
        });
        return res;
      }));
  }
}
