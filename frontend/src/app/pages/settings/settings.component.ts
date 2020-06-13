import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import * as localStorage from 'tns-core-modules/application-settings';
import { ConvertService } from '../../services/convert.service';

// Modal services and components
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ModalSettingsPasswordComponent } from '../../modals/modal-settings-password/modal-settings-password.component';
import { ModalSettingsProfileComponent } from '../../modals/modal-settings-profile/modal-settings-profile.component';

@Component({
  selector: 'ns-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  moduleId: module.id,
})
export class SettingsComponent implements OnInit {

  public item = [
    { name: 'Salasanan vaihto', component: ModalSettingsPasswordComponent },
    { name: 'Muokkaa profiilia', component: ModalSettingsProfileComponent },
    { name: 'Kirjaudu ulos' },
  ];


  constructor (
    private _modal: ModalDialogService,
    private _vcRef: ViewContainerRef,
    private _convertService: ConvertService
  ) {}

  ngOnInit() {}


  /**
   * LOGS USER OUT OR OPENS MODAL FOR CHANGING PROFILE/PASSWORD 
   * 
   * Function which'll open modal for user according to which index he pressed on array
   * of objects. 
   * 
   * If user clicks the logout -view, alert-prompt will be opened which'll
   * confirm if user actually wants to logout from the application.
   * 
   * @param {number} index Which index user pressed from ListView
   *  
   */
  public showModal(index: number): void {
    // If user taps "Logout" -button
    if (index === 2) {
      this._convertService.convertPrompt('Haluatko varmasti kirjautua ulos?', 'Kirjaudu ulos', 'Kirjaudu ulos', 3, true);
    } 
    else {
      if (index === 0 && localStorage.getString('socialId')) {
        TNSFancyAlert.showError('Seis!', 'Olet kirjautunut sosiaalisen \
          median avulla. Et voi vaihtaa salasanaa.', 'Ok');
      } else {
        const options = {
          fullscreen: index > 0 ? true : false,
          viewContainerRef: this._vcRef 
         };
         this._modal.showModal(this.item[index].component, options);
      }
    }
  }

  
}

