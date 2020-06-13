// Modules
import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { Routes } from '@angular/router';

// Components
import { LoginComponent } from './pages/login/login.component';
import { FrontpageComponent } from './pages/frontpage/frontpage.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { CreatepostComponent } from './pages/createpost/createpost.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';

// URL-routes
const routes: Routes = [
  { path: 'frontpage', component: FrontpageComponent },
  { path: 'login/:socialId', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'createpost', component: CreatepostComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent },
  // Path if URL is in root
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // If URL-adress isn't found
  { path: '**', redirectTo: 'frontpage', pathMatch: 'full' }
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {}
