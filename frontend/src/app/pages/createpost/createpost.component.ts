// General libraries
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { TextField } from 'tns-core-modules/ui/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import * as localStorage from 'tns-core-modules/application-settings';
import * as dialogs from 'tns-core-modules/ui/dialogs';
// Services
import { ConvertService } from '~/app/services/convert.service';
import { DrinkService } from '~/app/services/drink.service';
import { ImageService } from '~/app/services/image.service';
import { PostService } from '~/app/services/post.service';
// Dataclasses
import { Drink } from '~/app/dataclasses/drink';
import { Post } from '~/app/dataclasses/post';
import { Image } from 'tns-core-modules/ui/image';


@Component({
  selector: 'ns-createpost',
  templateUrl: './createpost.component.html',
  styleUrls: ['./createpost.component.css'],
  moduleId: module.id
})
export class CreatepostComponent implements OnInit {

  // Get button-elements from the template to temporary variables.
  @ViewChild('cameraBtn') public cameraButton: ElementRef;
  @ViewChild('galleryBtn') public galleryButton: ElementRef;
  @ViewChild('selectBtn') public selectButton: ElementRef;
  @ViewChild('firstTab') public firstTab: ElementRef;


  // Get's username from localStorage
  public username: string;
  // Will contain all the necessary information about the post
  public post = new Post();
  // Currently selected tab (starts at 0)
  public selectedIndex: number;
  // Boolean value telling if user is searching
  public searching: boolean;
  // Boolean value indicating if searching should be force-stopped
  public forceStopSearch: boolean;
  // Will contain Font Awesome's stars if user gives any
  public rate: string;
  // Observable array holding all searched drinks by user input
  public drinks$: Observable<Drink[]>;
  // Raw picture which'll be placed for user to view
  public picture: Image;
  // Raw picture converted to base64string-mode for HTTP-calls
  public base64picture: string;
  // Boolean value toggling if image-options are showing
  public imageOptionsUp: boolean;
  // Indicator showing if post if being made
  public isBusy: boolean;


  constructor (
    private _routerExtensions: RouterExtensions,
    private _convertService: ConvertService,
    private _drinkService: DrinkService,
    private _postService: PostService,
    private _imageService: ImageService
  ) {}

  ngOnInit() {
    this.username = localStorage.getString('username');
  }


  // Converts rating
  public ratingValue(event): void {
    this.rate = this._convertService.convertRating(event.value);
  }

  
  /**
   * SENDS THE POST 
   * 
   * After user pushes the SEND-button the function will check whether post's text were given
   * (which is the only mandatory field). If one is given, function will show activity-indicator 
   * for the user and pushes post's information to service.
   * 
   * After frontpage get's feedback from the post it'll determine whether post was successfully 
   * added to database. If success, it'll transform user to frontpage. If post has failed 
   * (usually because of 500 internet-error) an alert will be shown telling user that the post 
   * has failed.
   * 
   */
  public sendPost(): void {
    if (this.post.text) {
      this.isBusy = true;
      this._postService.createPost(this.post, this.base64picture, this.username)
        .subscribe(() => {
          this.isBusy = false;
          this._routerExtensions.navigate(['/frontpage'], { animated: true, transition: {
            name: 'slide', duration: 200, curve: 'easeInOut'
          }});
        }, err => {
          console.error(err);
          this.isBusy = false;
          this._convertService.convertPrompt('Postausta ei voitu lähettää', null, null, 5);
      });
    } else {
      this._convertService.convertPrompt('Postauksen teksti ei voi olla tyhjä', null, null, 2);
    }
  }


  /**
   * REMOVES IMAGE
   * 
   * Function which simply removes the image from the post and from user's view.
   * 
   */
  public removeImage(): void {
    this.picture = new Image();
    this.base64picture = '';
    this.firstTab.nativeElement.backgroundImage = '~/assets/images/sketchs/createpost-picture-3.jpg';
  }


  /**
   * TOGGLES BETWEEN IMAGE MODES
   * 
   * Function which'll show options for pushing an image to a new post. After user
   * presses the "paperclip"-button, various options, including camera and gallery, will
   * show up with a smooth animation.
   * 
   */
  public toggleImageOptions(): void {
    if (!this.imageOptionsUp) {
      this.cameraButton.nativeElement.animate({
        opacity: 1,
        duration: 80,
        translate: { x: 0, y: -130 }
      });
      this.galleryButton.nativeElement.animate({
        opacity: 1,
        duration: 80,
        translate: { x: 0, y: -65 }
      });
      this.selectButton.nativeElement.animate({
        duration: 150,
        rotate: 180
      });
      this.imageOptionsUp = true;
    } else {
      this.cameraButton.nativeElement.animate({
        opacity: 0,
        duration: 80,
        translate: { x: 0, y: 0 }
      });
      this.galleryButton.nativeElement.animate({
        opacity: 0,
        duration: 80,
        translate: { x: 0, y: 0 }
      });
      this.selectButton.nativeElement.animate({
        duration: 150,
        rotate: 0
      });
      this.imageOptionsUp = false;
    }
  }


  /**
   * CLOSES TEXTFIELDES TEXTBOARDS AND SEARCH SELECTION
   *
   * This function will be executed when user taps away from textfield(s) or from
   * search selection. After it'll do a blank search with empty string to return an
   * empty array which'll close search-window.
   *
   * @param {TextField} nameField Beer's name textfield input (optional)
   * @param {TextField} typeField Beer's type textfield input (optional)
   * @param {TextField} descField Description of the post (optional)
   *
   */
  closeElements(nameField?: TextField, typeField?: TextField, descField?: TextField): void {
    if (nameField) nameField.dismissSoftInput();
    if (typeField) typeField.dismissSoftInput();
    if (descField) descField.dismissSoftInput();
    if (this.imageOptionsUp) this.toggleImageOptions();
    this.search('');
  }


  /**
   * CLOSES AND/OR FORCE-CLOSES BEER'S NAME FIELD
   *
   * Function which closes and/or force-closes beer's name textfield-input.
   * Normal closing will only close name-search for that moment. Forcing
   * means that input will only search for beer names if user re-focuses
   * that same textfield.
   *
   * @param {boolean} force Don't open name-search without re-focusing field
   *
   */
  dismissSearch(force: boolean): void {
    this.searching = false;
    if (force) this.forceStopSearch = true;
  }


  /**
   * RETURNS FOCUS FOR NAME-SEARCH
   *
   * This function will fire if user goes to next input field and then back to
   * beer's name input. This'll override force-stop of name search and start
   * re-searching them with a keyword again.
   *
   */
  returnFocus(): void {
    if (this.forceStopSearch) this.forceStopSearch = false;
  }


  /**
   * PICKS A BEER FROM NAME-SUGGESTION LIST TO INPUT-FIELDS
   *
   * Function which'll be executed if user picks something from
   * name-search suggestions. These values will be then inserted into
   * two-way binding inputs (Beer name & Beer type) -- meaning they'll
   * saved in form and displayed to user.
   *
   * @param {Drink} selectedDrink Drink which was selected from list
   * @param {TextField} nameField Beer's name field (whose keyboard will be closed)
   *
   */
  public chooseDrink(selectedDrink: Drink, nameField: TextField): void {
    nameField.dismissSoftInput();
    this.dismissSearch(true);
    this.post.drink_name = selectedDrink.name;
    this.post.drink_type = selectedDrink.type;
  }


  /**
   * SEARCHS FOR BEER'S NAMES BY USER INPUT
   *
   * Function which'll search for beer's names based on user input. If search
   * is force-stopped it'll do nothing. Also if the search field is empty it'll
   * stop the search.
   *
   * @param {string} drink User input which'll be used for search
   *
   */
  public search(drink: string): void {
    if (!this.forceStopSearch) {
      if (!drink) this.searching = false;
      else {
        this.searching = true;
        this.drinks$ = this._drinkService.searchDrinks(drink);
      }
    }
  }


  /**
   * EMPTIES DRINKS
   *
   * Function which'll empty all the additional information about the post.
   *
   */
  public empty(): void {
    this.post.drink_name = '';
    this.post.drink_type = '';
    this.post.rating = 0;
  }


  /**
   * OPEN CAMERA AND TAKE PICTURE TO THE POST
   *
   * Calls service's takePicture() -method to get picture and base64-string of it.
   * Returned values will be placed inside global variables inside class. 
   *
   */
  public takePicture(): void {
    this.toggleImageOptions();
    this._imageService.takePicture((res, err) => {
      if (res) {
        this.picture = res.picture;
        this.base64picture = res.base64picture;
        // Blurs the background-image
        this.firstTab.nativeElement.backgroundImage = '~/assets/images/sketchs/createpost-picture-3-blur.jpg';
      } else {
        console.log(err);
      }
    });
  }


  /**
   * CHOOSE SINGLE PICTURE FROM PHONES GALLERY
   *
   * Calls service's getPicture() -method to get picture and base64-string of it.
   * Returned values will be placed inside global variables inside class.
   *
   */
  public getPicture(): void {
    this.toggleImageOptions();
    this._imageService.getPicture((res, err) => {
      console.log(res.base64picture);
      if (res) {
        this.picture = res.picture;
        this.base64picture = res.base64picture;
        // Blurs the background-image
        this.firstTab.nativeElement.backgroundImage = '~/assets/images/sketchs/createpost-picture-3-blur.jpg';
      } else {
        console.log(err);
      }
    })
  }

}