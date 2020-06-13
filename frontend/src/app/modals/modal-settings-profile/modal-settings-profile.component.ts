import { Component, OnInit } from '@angular/core';
import * as localStorage from 'tns-core-modules/application-settings';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import { backend } from '../../connection';
import { url } from '~/app/picture-url';
import { RouterExtensions } from 'nativescript-angular/router';

// Modal libraries
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
// Services
import { ImageService } from '~/app/services/image.service';
import { UserService } from '~/app/services/user.service';
import { ConvertService } from '../../services/convert.service';


@Component({
  selector: 'ns-modal-settings-profile',
  templateUrl: './modal-settings-profile.component.html',
  styleUrls: ['./modal-settings-profile.component.css'],
  moduleId: module.id,
})
export class ModalSettingsProfileComponent implements OnInit {


  // Logged in user
  public username = localStorage.getString('username');

  // Root url of user's image
  public url = url;
  // Current user's image
  public currentImage: string;

  // Old bio and dynamic bio (will be compared)
  public oldBio: string;
  public bio: string;
  
  // Indicator telling if updation is in process
  public imageChanging: boolean;
  public bioChanging: boolean;


  constructor(
    private _userService: UserService,
    private _imageService: ImageService,
    private _convertService: ConvertService,
    private _params: ModalDialogParams,
    private _routerExtensions: RouterExtensions
  ) { }

  ngOnInit() {
    this.imageChanging = true;
    TNSFancyAlert.shouldDismissOnTapOutside = true;
    this.currentImage = localStorage.getString('img');
    this.bio = localStorage.getString('bio');
    this.oldBio = localStorage.getString('bio');
    setTimeout(() => this.imageChanging = false, 1500);
  }


  // Closes modal
  public goBack(): void {
    this._params.closeCallback();
  }
  // Hides keyboard
  public hideKeyboard(bioField: any): void {
    bioField.dismissSoftInput();
  }


  /**
   * UPDATES USER'S IMAGE
   * 
   * Function which will update user's image. This function will be called when user 
   * chances profile image. It'll pass the new image as a base64string -format to service
   * which will pass it to backend. 
   * 
   * If image-updation is successful, new image's string will
   * be placed inside localstorage and current-image.
   * 
   * @param {string} base64picture New profile-picture as a base64string -format 
   * 
   */
  public updateUserImage(base64picture: string): void {
    this.imageChanging = true;
    this._userService.updateUserImage(base64picture).subscribe(res => {
      localStorage.setString('img', res.img)
      this.currentImage = res.img;
      setTimeout(() => this.imageChanging = false, 1000);
    }, err => {
      this.imageChanging = false;
      this._convertService.convertPrompt('Kuvaasi ei voitu päivittää', null, null, 5);;
    });
  }


  /**
   * UPDATES USER'S BIO
   * 
   * Function which'll update user's bio. If bio isn't empty and it's different than old bio,
   * it'll passed to service which will pass it to backend.
   * 
   * If bio-updation is succesful, new bio-string will be placed inside localstorage
   * and to oldBio -variable.
   * 
   */
  public updateUserBio(): void {
    if (this.bio.length > 0 && this.bio !== this.oldBio) {
      this.bioChanging = true;
      this._userService.updateUserBio(this.bio).subscribe(res => {
        this.bioChanging = false;
        localStorage.setString('bio', res.bio);
        this.oldBio = res.bio;
        this.bio = res.bio;
        // close modal then navigate to profile
        this._params.closeCallback()
        setTimeout(() =>{
          this._routerExtensions.navigate(['/profile/', this.username])
        }, 50);
      }, err => {
        this.bioChanging = false;
        this._convertService.convertPrompt('Bioa ei voitu päivittää', null, null, 5);
      });
    }
  }


  /**
   * TAKES NEW PICTURE
   * 
   * Function will call ImageService's function to take a new image. If new image is taken,
   * we'll pass it's base64string -format to updateUserImage() -function.
   * 
   */
  public takePicture(): void {
    this._imageService.takePicture((res, err) => {
      if (res) {
        this.updateUserImage(res.base64picture)
      } else {
        console.error(err);
      }
    });
  }


  /**
   * GET'S NEW PICTURE FROM GALLERY
   * 
   * Function will call ImageService's function to pick a new image. If new image is picked,
   * we'll pass it's base64string -format to updateUserImage() -function.
   *  
   */
  public getPicture(): void {
    this._imageService.getPicture((res, err) => {
      if (res) {
        this.updateUserImage(res.base64picture);        
      } else {
        console.error(err);
      }
    });
  }


}
