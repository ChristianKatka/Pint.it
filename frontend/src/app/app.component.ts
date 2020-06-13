import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { setCurrentOrientation } from 'nativescript-screen-orientation';
import { AuthService } from './services/auth.service';
import { TNSFancyAlert } from 'nativescript-fancyalert';

@Component({
  selector: 'my-app',
  moduleId: module.id,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  // Boolean value telling whether navbar will be visible or not
  public showNavbar: boolean = true;


  public constructor(private _authService: AuthService) {}

  ngOnInit() {
    // Sets phone's orientation to always be on portrait -mode
    setCurrentOrientation('portrait', () => console.log());
    this.returnLoginInfo();
    TNSFancyAlert.shouldDismissOnTapOutside = true;
    TNSFancyAlert.customViewColor = '#fff';
  }

  
  /**
   * CHECKS IF USER IS LOGGED IN
   * 
   * Function which'll check if user is logged in. It'll subscribe to 
   * Subject-value, meaning it'll detect whenever the boolean-value changes.
   * If value is true, it'll show the navbar, otherwise hides it.
   * 
   */
  public returnLoginInfo() {
    this._authService.returnLoginInfo().subscribe(cond => {
      this.showNavbar = cond;
    });
  }
}
