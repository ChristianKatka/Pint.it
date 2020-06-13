import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as localStorage from 'tns-core-modules/application-settings';
import { ConvertService } from './convert.service';
import { backend } from '../connection';
import { map } from 'rxjs/operators';


import { Comment } from '../dataclasses/comment';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  // Root url
  public url = backend + '/comment/';

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
   * GET COMMENT BY ID
   * 
   * Function which'll do a GET-request to fetch 1 comment by ID. If one is 
   * found, it'll be returned back to component.
   * 
   * @param {number} id ID of the comment 
   * 
   */
  public getCommentById(id: number): Observable<Comment> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<Comment>(`${this.url}commentbyid/${id}`, headers)
      .pipe(map(res => {
        res.date = this._convertService.convertDate(res.createdAt);
        return res;
      }));
  }


  /**
   * CALLS CREATE COMMENT HTTP REQUEST
   * 
   * Function that handles comment creating. HTTP-POST-request.
   * In body we pass in comment object what has data including the comment itself, what post was
   * commented and and user who made it (logged in user)
   * 
   * @param {Comment} comment Whole comment as an object
   * 
   */
  public createComment(comment: Comment): Observable<Comment> {
    comment.text = comment.text.replace(/\n\s*\n/g, '\n\n');
    comment.username = localStorage.getString('username');
    const headers = ({ headers: this.createHeaders() });
    return this._http.post<Comment>(`${this.url}createcomment/`, comment, headers);
  }


  /**
   * GETS 10 COMMENTS AT ONCE FOR POST
   * 
   * Function which gets 10 comments at a time for 1 post. 
   *
   * @param {number} postId ID of the post whose comments we'll search 
   * 
   */
  public getComments(postId: number, order: string, position: number): Observable<Comment[]> {
    const headers = ({ headers: this.createHeaders() });
    // Change url depending on if newest or most-likes comments will be fetched
    order = order === 'Uusimmat' ? 'latestcomments' : 'mostlikedcomments';
    return this._http.get<Comment[]>(
      `${this.url}${order}/${postId}/${position}`, headers
    ).pipe(map(res => {
      res.forEach(c => {
        c.date = this._convertService.convertDate(c.createdAt)
      });
      return res;
    }));
  }


  /**
   * GETS AMOUNT OF COMMENTS FOR A SET OF POSTS
   * 
   * Does a GET-request for a set of posts. It'll count the amount of
   * comments in each of the submitted posts.
   * 
   * @param {number[]} postIds ID's for the posts. Will be converted to a string
   * for the request.
   * @example [1, 2, 4, 39, 92] => "1-2-4-39-92"
   * 
   */
  public getCommentAmountForPosts(postIds: number[]): Observable<any> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get(
      `${this.url}commentamount/${postIds.join('-')}`, headers
    );
  }


  /**
   * GETS 0-2 LATEST COMMENTS FOR FRONTPAGE'S POSTS
   * 
   * Function which'll get the 0-2 latest comments to frontpage's posts. These will
   * be printed underneath those posts. If there isn't any comments, none will be 
   * printed or fetched. Http-request will request comments only for one post at a
   * time.
   * 
   * @param {number} postId Post's ID whose comments we'll fetch
   * 
   */
  public getCommentsFrontpage(postId: number): Observable<Comment[]> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<Comment[]>(
      `${this.url}commentsfrontpage/${postId}`, headers
    ).pipe(map(res => {
      res.forEach(c => {
        c.date = this._convertService.convertDate(c.createdAt);
      });
      return res;
    }));
  }

}
