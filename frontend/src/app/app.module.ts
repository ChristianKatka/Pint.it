// Modules
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { AppRoutingModule } from './app-routing.module';
import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { NativeScriptUIDataFormModule } from 'nativescript-ui-dataform/angular';
import { NativeScriptFormsModule } from "nativescript-angular/forms"
import { DropDownModule } from 'nativescript-drop-down/angular';

// Components
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './pages/login/login.component';
import { FrontpageComponent } from './pages/frontpage/frontpage.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { CreatepostComponent } from './pages/createpost/createpost.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ModalCommentComponent } from './modals/modal-comment/modal-comment.component';
import { ModalCategoryComponent } from './modals/modal-category/modal-category.component';
import { ModalSettingsProfileComponent } from './modals/modal-settings-profile/modal-settings-profile.component';
import { ModalRegisterComponent } from './modals/modal-register/modal-register.component';
import { ModalSettingsPasswordComponent } from './modals/modal-settings-password/modal-settings-password.component';
import { PreviewNotificationComponent } from './modals/preview-notification/preview-notification.component';
import { ModalSearchComponent } from './modals/modal-search/modal-search.component';


@NgModule({
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    ModalCommentComponent,
    ModalCategoryComponent,
    ModalSettingsProfileComponent,
    ModalSettingsPasswordComponent,
    ModalRegisterComponent,
    PreviewNotificationComponent,
    ModalSearchComponent
  ],
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    NativeScriptUIListViewModule,
    NativeScriptHttpClientModule,
    NativeScriptUIDataFormModule,
    NativeScriptFormsModule,
    DropDownModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    FrontpageComponent,
    NavbarComponent,
    NotificationsComponent,
    CreatepostComponent,
    ProfileComponent,
    SettingsComponent,
    ModalCommentComponent,
    ModalCategoryComponent,
    ModalSettingsProfileComponent,
    ModalRegisterComponent,
    ModalSettingsPasswordComponent,
    PreviewNotificationComponent,
    ModalSearchComponent
  ],
  providers: [
    ModalDialogService
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule {

}
