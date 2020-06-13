import { Component, OnInit } from '@angular/core';
import { AuthService } from '~/app/services/auth.service';
import { ConvertService } from '../../services/convert.service';
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";

@Component({
  selector: 'ns-modal-settings-password',
  templateUrl: './modal-settings-password.component.html',
  styleUrls: ['./modal-settings-password.component.css'],
  moduleId: module.id,
})
export class ModalSettingsPasswordComponent implements OnInit {

  public oldPassword: string;
  public newPassword: string; 
  public newPasswordConfirm: string;

  public passwordMatch = new RegExp('^[öåäÄÖÅ]*$');

  constructor (
    private _authService: AuthService,
    private _convertService: ConvertService,
    private _params: ModalDialogParams
  ) { }

  ngOnInit() {

  }


  /**
   * CHANGES THE USER`S PASSWORD
   * 
   * First the function confirms that the user enters an already existing
   * password correctly. User then enters a new password which replaces the 
   * old one. The new password is crypted in backend. 
   * Returns feedback to user whether the process was successfull or not.
   * 
   */
  public changePassword(): void {
    if (this.newPassword === this.newPasswordConfirm) { 
      if (!this.newPassword.match(this.passwordMatch)) {
        this._authService.changePassword(this.oldPassword, this.newPassword)
          .subscribe(() => {
            this._params.closeCallback();
          }, err => {
            if (err.status === 403) {
              this._convertService.convertPrompt('Väärä salasana');
            } else if (err.status === 409) {
              this._convertService.convertPrompt('Sosiaalisesti kirjautunut käyttäjä ei voi vaihtaa salasanaa', 
                null, null, 0);
              this._params.closeCallback();
            } else {
              this._convertService.convertPrompt('Salasanaa ei voitu vaihtaa')
            }
          });
      } else {
        this.newPassword = '';
        this.newPasswordConfirm = '';
        this._convertService.convertPrompt('Salasana ei saa sisältää skandinaavisia merkkejä (Ä,Ö,Å)', null, null, 0);
      }
    } else {
      this._convertService.convertPrompt('Uudet salasanat eivät täsmää');
    } 
}
}