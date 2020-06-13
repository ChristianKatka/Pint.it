import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as localStorage from 'tns-core-modules/application-settings';
import { backend } from '../connection';

import { PostLike } from '../dataclasses/post-like';
import { CommentLike } from '../dataclasses/comment-like';


@Injectable({
  providedIn: 'root'
})
export class LikeService {


  public userId = localStorage.getNumber('id');
  public url = backend + '/like/';

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
   * WILL CHECK IF USER HAS LIKED ANY COMMENTS
   * 
   * Function which'll do HTTP-GET request to check whether user has liked from any 
   * of the comments which will come as parameter. Backend will return commentId and a 
   * boolean value representing if the user has liked the comment or not.
   * 
   * @param {number[]} commentIds Set of comments ID's which'll be used to distinct comments 
   * 
   */
  public getUserCommentLikes(commentIds: number[]): Observable<CommentLike[]> {
    const headers = ({ headers: this.createHeaders() });
    const userId = localStorage.getNumber('id');
    return this._http.get<CommentLike[]>(
      `${this.url}usercommentlikes/${userId}/${commentIds.join('-')}`, headers
    );
  }


  /**
   * TOGGLES LOGGED IN USER'S LIKE FOR ONE COMMENT
   * 
   * Function which'll do HTTP-PUT request to toggle one comment's like from logged user.
   * If user has liked comment and will push the like -button, that like will be deleted and
   * vice versa. Returns boolean telling whether like has been removed (false) or added (true)
   * 
   * @param {number} commentId Comment's ID from which the logged user's like will be checked 
   * 
   */
  public toggleUserCommentLike(commentId: number): Observable<{ liked: boolean }> {
    const headers = ({ headers: this.createHeaders() });
    const userId = localStorage.getNumber('id');
    return this._http.put<{ liked: boolean }>(
      `${this.url}toggleusercommentlike`, { userId, commentId }, headers
    );
  }


  /**
   * FUNCTION GETS ALL POSTS THAT AN USER HAS LIKED
   * 
   * HTTP Get request which will return all posts that an user has liked
   * 
   * Because post id's are being sent in url as parameters, the arrays need to be converted to string using join function
   * 
   * @param {number[]} postIds post id's will be converted to a string for url parameters
   * @example [1, 2, 4, 39, 92] => "1-2-4-39-92"
   */
  public getUserPostLikes(postIds: number[]): Observable<PostLike[]> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<PostLike[]>(`${this.url}getuserpostlikes/${this.userId}/${postIds.join('-')}`, headers);
  }


  /**
   * FUNCTION THAT HANDLES LIKING IN POST (POST LIKE)
   * 
   * Calls BACKEND function that handles liking posts and returns likes as true or false.
   * The data being sent includes which post was liked and who liked that post.
   * 
   * 
   * @param {number} postId What post was liked 
   * 
   */
  public toggleUserLikePost(postId: number): Observable<{ liked: boolean }> {
    const headers = ({ headers: this.createHeaders() });
    const userId = localStorage.getNumber('id');
    return this._http.put<{ liked: boolean }>(this.url + 'toggleuserpostlike', { postId, userId }, headers)
  }


  /**
   * GETS AMOUNT OF LIKES FOR A SET OF POSTS
   * 
   * Does a GET-request for a set of posts. It'll count the amount of likes
   * in each of the submitted posts. 
   * 
   * @param {number[]} postIds ID's for the posts. Will be converted to a string
   * for the request.
   * @example [1, 2, 4, 39, 92] => "1-2-4-39-92"
   *  
   */
  public getPostsLikes(postIds: Number[]): Observable<any> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get(
      `${this.url}postslikes/${postIds.join('-')}`, headers
    );
  }


  /**
   * GETS LIKES FOR A SET OF COMMENTS
   * 
   * Does a GET-request for a set of comments. It'll count the amount of likes
   * in each of the submitted comments.
   * 
   * @param {number[]} commentIds ID's for the comments. WIll be converted to a string 
   * for the request.
   * @example [1, 2, 3, 4, 392] => "1-2-3-4-392"
   * 
   */
  public getCommentLikes(commentIds: Number[]): Observable<any> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get(
      `${this.url}commentlikes/${commentIds.join('-')}`, headers
    );
  }


}
