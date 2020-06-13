import { Injectable } from '@angular/core';
import { Image } from 'tns-core-modules/ui/image';
import * as imagepicker from 'nativescript-imagepicker';
import * as camera from 'nativescript-camera';
import { ImageSource } from 'tns-core-modules/image-source/image-source';
import { ConvertService } from './convert.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private _convertService: ConvertService) { }


  /**
   * OPEN CAMERA AND TAKE PICTURE TO THE POST
   *
   * Function which asks for user permission first about the camera. If user gives
   * permission for camera it'll be opened.
   *
   * If user takes takes a photo a various things will happen:
   *
   *  1. New object from ImageSource will be created. This source-object will be used to
   *  create a Base64String from the image (Img-file to string in a nutshell). We'll
   *  convert this image to string so we can pass it with HTTP-POST request.
   *
   *  2. Saved image will be saved to gallery. Through the url of the image it'll be
   *  displayed to user.
   *
   * @param {function} callback Callback method which component-caller will bring here. This
   * callback will be called after image and source or error has been gotten.
   * @returns {picture: Image, base64picture: string} Return Image-object and string-based image
   * (through callback!)
   * 
   */
  public takePicture(callback): void {
    camera.requestPermissions().then(() => {
      const options = {
        height: 500,
        keepAspectRatio: true,
        saveToGallery: true
      };
      camera
        .takePicture(options)
        .then(imageAsset => {
          const source = new ImageSource();
          const picture = new Image();
          picture.src = imageAsset.android;
          source.fromAsset(imageAsset).then(source => {
            callback({ picture: picture, base64picture: source.toBase64String('jpg', 30) }, null);
          });
        });
    }).catch(err => {
      this._convertService.convertPrompt('Kuvaa ei voitu valita', null, null, 5);
      callback(null, err)
    });
  }


  /**
   * FETCHES PICTURE FROM GALLERY
   * 
   * Function which will fetch single image from user's phone-gallery. After an image has been
   * fetched, it's source value will be placed inside new Image-object. Finally the image will
   * be converted to Base64String -value to pass to backend.
   * 
   * @param {function} callback Callback method which component-caller will bring here. This
   * callback will be called after image and source or error has been gotten.
   * @returns {picture: Image, base64picture: string} Return Image-object and string-based image
   * (through callback!)
   * 
   */
  public getPicture(callback): void {
    const context = imagepicker.create({
      mode: 'single'
    });
    context
      .authorize().then(() => {
        return context.present();
      })
      .then(imageAsset => {
        const source = new ImageSource();
        const picture = new Image();
        picture.src = imageAsset[0].android;
        source.fromAsset(imageAsset[0]).then(source => {
          callback({ picture: picture, base64picture: source.toBase64String('jpg', 30) }, null);
        });
      })
      .catch(err => {
        this._convertService.convertPrompt('Kuvaa ei voitu valita', null, null, 5);
        callback(null, err)
      });
  }


}
