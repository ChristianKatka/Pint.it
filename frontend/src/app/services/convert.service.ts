import { Injectable } from '@angular/core';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import { RouterExtensions } from 'nativescript-angular/router';
import * as localStorage from 'tns-core-modules/application-settings';

@Injectable({
  providedIn: 'root'
})
export class ConvertService {

  constructor(private _router: RouterExtensions) {}


  /**
   * CONVERTS EVENTS INTO FANCY ALERTS FOR USER
   * 
   * Function, which'll convert parameters into fancy alerts for the user. Alerts are being used
   * almost everywhere so this one function will handle them all.
   * 
   * @param {string} text Additional text, telling more about the alert's subject 
   * @param {string} title Title of the alert (DEFAULT = "Virhe") 
   * @param {string} okButtonText Text of the button (DEFAULT = "Ok")
   * @param {number} spaceAmount Alert's text cannot be centered, so we'll create spaces manually
   *  by user input (DEFAULT = 3)
   * @param {boolean} logout If this alert is being used to logout from the application (optional)
   * @param {boolean} showSuccess If success-prompt is wanted instead of error-prompt (optional)
   *  
   */
  public convertPrompt(text: string, title?: string, okButtonText?: string, 
    spaceAmount?: number, logout?: boolean, showSuccess?: boolean) {

      title = title || 'Virhe';
      okButtonText = okButtonText || 'Ok';
      spaceAmount = spaceAmount || 3;
      
      let space: string = '';
      // Number determines how much space there'll be before text (text cannot be centered)
      for (let i = 0; i < spaceAmount; i++) {
        space += '\t';
      }
      if (showSuccess) {
        TNSFancyAlert.showSuccess(title, space + text, okButtonText);
      } else {
        TNSFancyAlert.showError(title, space + text, okButtonText).then(() => {
          // If user presses Logout -button
          if (logout) {
            localStorage.clear();
            this._router.navigate(['/login'], {
              animated: true,
              transition: { name: 'slide', duration: 200, curve: 'easeInOut' },
              clearHistory: true
            });
          }
        });
      }
  }


  /**
   * CONVERT LARGE NUMBERS FOR BETTER VIEW
   *
   * Function which'll convert a large number (larger than 9990) to a more
   * readable number.
   *
   * @example 1 390 910 => 1.4 milj.
   * @example 13 830 => 14 t.
   * @example 9103 => 9103
   *
   * @param {number} amount The amount which'll be converted.
   * 
   * @return {number/string} If number is lower than 9990 return the number
   * normally. If it's higher than that, return that number with decimal and a
   * valid string after it.
   *
   */
  public convertNumber(amount: number): any {
    if (amount > 999000) {
      return Math.round((amount /= 1000000) * 10) / 10 + ' milj.';
    } else if (amount > 9990) {
      return Math.round(amount / 1000) + ' t.';
    }
    return amount;
  }


  /**
   * CONVERT NUMERIC RATING TO A STAR SYMBOL(S)
   * 
   * Function which'll convert numeric rating to a set of stars according to the
   * value of the rating. It'll make an array from rating value and loop through
   * it to generate the right amount of stars. 
   *
   * @param {number} rating The star rating
   * @example Rating 3 => 3 stars etc
   * 
   */
  public convertRating(rating: number): any {

    let stars = '';
    Array(rating).fill(0).forEach(() => {
      stars += String.fromCharCode(0xf005);
    });
    return stars;
  }



  /**
   * CONVERT A DATE INTO READABLE STRING
   * 
   * A function which converts a date-object into a string. String
   * will tell when did the post/comment was created etc. Time between
   * two dates are placed into various variables. 
   * 
   * @param {Date} dateParam Date-object which we want to 
   * convert into a string.
   * @returns {string} Returns the time (with text) between the parameter-
   * date and current date.
   * 
   */
  public convertDate(dateParam: Date): string {    

    // Convert string to a proper date
    const date: any = new Date(dateParam);
    // Convert current date to a date-object
    const today: any = new Date();
    
    // Get seconds, hours, days etc. between date-parameter and current date
    const seconds: any = Math.round((today - date) / 1000);
    const minutes: any = Math.round(seconds / 60);
    const hours: any = Math.round(minutes / 60);
    const days: any = Math.round(hours / 24);
    const months: any = Math.round(days / 30);
    
    // Returns a string according to the date
    if (seconds <= 5) {
        return 'Juuri nyt';
    } else if (seconds <= 60) {
        return `${seconds} sekuntia sitten`;
    } else if (seconds <= 90) {
        return 'noin minuutti sitten';
    } else if (minutes <= 60) {
        return `${minutes} minuuttia sitten`;
    } else if (hours === 1) {
        return `${hours} tunti sitten`;
    } else if (hours > 1 && hours <= 24) {
        return `${hours} tuntia sitten`;
    } else if (days >= 1 && days <= 31) {
        return `${days} päivää sitten`;
    } else if (months === 1) {
        return `${months} kuukausi sitten`;
    } else if (months > 1 && months <= 12) {
        return `${months} kuukautta sitten`;
    } else if (today.getFullYear() - date.getFullYear() === 1) {
        return `${today.getFullYear() - date.getFullYear()} vuosi sitten`;
    } else if (today.getFullYear() - date.getFullYear() > 1) {
        return `${today.getFullYear() - date.getFullYear()} vuotta sitten`;
    } else {
        return '--';
    }
  }


}
