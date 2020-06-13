import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as localStorage from 'tns-core-modules/application-settings';
import { ConvertService } from './convert.service';
import { backend } from '~/app/connection';
import { map } from 'rxjs/operators';

import { Post } from '../dataclasses/post';



@Injectable({
  providedIn: 'root'
})
export class PostService {

  public url = backend + '/post/';

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
   * GET POST BY ID
   *
   * Function which'll do a GET-request to fetch 1 post by ID. If one is
   * found, it'll be returned back to component.
   *
   * @param {number} id ID of the post
   *
   */
  public getPostById(id: number): Observable<Post> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<Post>(`${this.url}postbyid/${id}`, headers)
      .pipe(map(res => {
        res.date = this._convertService.convertDate(res.createdAt);
        res.stars = this._convertService.convertRating(res.rating)
        return res;
      }));
  }


  /**
   * SEND A HTTP-POST REQUEST TO CREATE A NEW POST
   * 
   * Function which sends a HTTP POST-request to create a new post. If image
   * isn't brought through a parameter, only post's information will be sent 
   * to backend. 
   * 
   * @param {Post} post Contains all necessary information about a post 
   * @param {string} image Contains an image as a Base64String-type
   * @param {username} username Username of the user who's gonna make the post
   * 
   */
  public createPost(post: Post, image: string, username: string): Observable<any> {
    post.text = post.text.replace(/\n\s*\n/g, '\n\n');
    const headers = ({ headers: this.createHeaders() });
    const postContent = image ? { post: post, image: image } : { post: post };
    return this._http.post(`${this.url}createpost/${username}`, postContent, headers);
  }


  /**
   * GETS THE AMOUNT OF POSTS AS A NUMBER OF ONE USER
   * 
   * Function which gets the amount of posts one user has made as a number. If
   * there're none posts - 404 will be returned and 0 will be printed. 
   * 
   * @param {string} username Name of the user whose post-amounts we'll search
   *  
   */
  getUserPostsAmount(username: string): Observable<any> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.get<any>(`${this.url}userpostsamount/${username}`, headers);
  };


  /**
   * GETS ALL POSTS MADE BY A SINGLE USER
   * 
   * Function which finds all the posts a single user has made. 
   * The function will also sort the posts by order if the user has chosen so from the
   * menu on the top. Similarily it will sort them by value if the user chooses otherwise
   * 
   * @param {number} req.params.username User who is doing the request
   * @param {number} req.params.position Amount of posts that have already been fetched
   * @param {string} req.params.order In which order posts fill be fetched (date/popularity)
   * 
   */
  getUsersPosts(username: string, position: number, order: string): Observable<Post[]> {
    const headers = ({ headers: this.createHeaders() });
    // Converts order-parameter to right filter-value
    order = order === 'Uusimmat' ? 'createdAt' : 'value';
    return this._http.get<Post[]>(
      `${this.url}userposts/${username}/${position}/${order}`, headers
    ).pipe(map(res => {
      res.forEach(p => {
        p.date = this._convertService.convertDate(p.createdAt);
      });
      return res;
    }));
  }


  /**
   * GETS POST ACCORDING TO FILTERS
   * 
   * Function which gets posts according to filters given by component. Request will
   * only fetch 5 posts per request. 
   * 
   * According to parameters there are 2 different routes for getting posts.
   * 
   * @param {string} category1 In which order posts will be fetched
   * @param {string} category2 Will request fetch all posts or only those who user follows
   * @param {number} position How many posts has been already been fetched 
   * 
   */
  public getPosts(category1: string, category2: string, position: number): Observable<Post[]> {
    const headers = ({ headers: this.createHeaders() });
    // Determines in which order posts will be fetched
    const order = category1 === 'Uusimmat' ? 'createdAt' : 'value'
    // Search all user posts, or search posts only by followed
    const posturl = category2 === 'Kaikki' ? 'all' : 'followed';
    // Get user id from Nativescript's localstorage
    const userId = localStorage.getNumber('id');
    // HTTP Query
    return this._http.get<Post[]>(
      `${this.url}posts${posturl}/${order}/${position}/${userId}`, headers
    ).pipe(map(res => {
      res.forEach(p => {
        p.date = this._convertService.convertDate(p.createdAt);
        p.stars = this._convertService.convertRating(p.rating);
      });
      return res;
    }));
  }

  
  /**
   * UPDATE POST'S HIDDEN VALUE 
   * 
   * Function which'll either increase or decrease the post's hidden value through
   * HTTP-PUT -request. Boolean value telling if updation was successful will be returned
   * back to calling component. 
   * 
   * New value can be one of these: [1, 2, -1]. 
   * 
   * @param {number} id Post's ID which value will be updated
   * @param {number} amount The amount which'll inserted into an old value (can be minus -values)
   *   
   */
  public updatePostValue(id: number, amount: number): Observable<boolean> {
    const headers = ({ headers: this.createHeaders() });
    return this._http.put<boolean>(this.url + 'value', { id, amount }, headers);
  }


}
