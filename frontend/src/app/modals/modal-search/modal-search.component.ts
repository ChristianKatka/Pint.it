import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { backend } from '~/app/connection';
import { UserService } from '../../services/user.service';
import { ModalDialogParams } from 'nativescript-angular/directives/dialogs';
import { url } from '~/app/picture-url';

import { User } from '~/app/dataclasses/user';

@Component({
  selector: 'ns-modal-search',
  templateUrl: './modal-search.component.html',
  styleUrls: ['./modal-search.component.css'],
  moduleId: module.id,
})
export class ModalSearchComponent implements OnInit {

  // Root url for user's profile-images
  public url = url;
  // Users found from service
  public users$: Observable<User[]>;
  // If users weren't found with search-word
  public usersNotFound: boolean;


  constructor (
    private _params: ModalDialogParams,
    private _userService: UserService
  ) {}

  ngOnInit() {}
  

  // Closes modal
  public closeModal(username?: string): void {
    this._params.closeCallback(username);
  }
  // Go to other user's profile
  public goToProfile(username: string): void {
    this.closeModal(username);
  }


  /**
   * SEARCH USERS FROM BACKEND WITH SEARCH-WORD
   * 
   * Function which'll try to find users with a search-word. If any
   * users are found, these values will be placed inside observable-variable.
   * These values will be shown in template's listview asynchroniusly.
   * 
   * @param {string} searchWord User's search-word for locating users 
   * 
   */
  public searchUsers(searchWord: string): void {
    this.users$ = this._userService.searchUsers(searchWord);
  }



}
