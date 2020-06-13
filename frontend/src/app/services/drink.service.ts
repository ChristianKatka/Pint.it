import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as localStorage from 'tns-core-modules/application-settings';


import { Drink } from '../dataclasses/drink';

import { backend } from '../connection';


@Injectable({
  providedIn: 'root'
})
export class DrinkService {

  public url = backend + '/drink/';

  public drink: Drink[];

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
   * SEARCHES FOR DRINK NAMES BY USER INPUT
   * 
   * Function which searches for beer's names based on user input.
   * If it founds any (max 15) it'll return them back to frontend 
   * bringing the beer's type (if there's any) with it. These values
   * will be displayed to user where one can choose any of them from 
   * a list.
   * 
   * @param {string} input User's input by which he/she tries to search 
   * for beer's names 
   * 
   */
  public searchDrinks(input: string): Observable<Drink[]> {
    const headers = ({ headers: this.createHeaders() });
    // If user input is empty return an empty Observable-array
    if (!input.trim()) return of([]);
    return this._http.get<Drink[]>(
      `${this.url}searchdrinks/${input.split(' ').join('-')}`, headers
    ) 
  }
}
