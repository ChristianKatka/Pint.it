import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { backend } from '~/app/connection';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import { RouterExtensions } from 'nativescript-angular/router';
import { url } from '~/app/picture-url';

import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PreviewNotificationComponent } from '../../modals/preview-notification/preview-notification.component';
 
// Services
import { ConvertService } from '~/app/services/convert.service';
import { NotificationService } from '~/app/services/notification.service';

// Dataclasses
import { Notification } from '../../dataclasses/notification';
import { ListViewEventData } from 'nativescript-ui-listview';


@Component({
  selector: 'ns-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  moduleId: module.id,
})
export class NotificationsComponent implements OnInit {

  public isBusy = true;
  // Public images
  public url = url;
  // Array which includes all the notifications
  public notifications: Notification[];
  // Boolean value keeping track if there isn't any notifications
  public noNotifications: boolean;
  // Types of notifications which'll be shown to user
  public typeOfNotification = [
    'Alkoi seuraamaan sinua', 'Tykkäsi kommentistasi', 
    'Kommentoi postaustasi', 'Tykkäsi postauksestasi'
  ];


  constructor (
    public modal: ModalDialogService,
    public vcRef: ViewContainerRef,
    public router: RouterExtensions,
    private _notificationService: NotificationService,
    private _convertService: ConvertService
  ) {}

  ngOnInit() {
    this.getNotifications();
  }


  // Converts date
  public convertDate(date: Date): string {
    return this._convertService.convertDate(date);
  }


  /**
   * SHOWS THE CONTEXT OF THE NOTIFICATION
   * 
   * Function which'll show the context of the notification in a different modal.
   * It'll take the index from the template (placement in notifications -array), 
   * and use that index to bring specific information to the modal.
   * 
   * If the notification is context to "Someone started following you", modal won't
   * be opened -- instead user will be navigated to that person's profile-page.
   * 
   * @param {index} index Index in template (notifications -variable) 
   * 
   */
  public previewNotification(index: number): void {
    if (this.notifications[index].type === 0) {
      this.router.navigate(['/profile', this.notifications[index].peer_user]);
    } else {
      const options = {
        context: {
          commentId: this.notifications[index].comment_id,
          postId: this.notifications[index].post_id
        },
        fullscreen: true,
        viewContainerRef: this.vcRef
      };
      this.modal.showModal(PreviewNotificationComponent, options);
    }
  }



  /**
   * GET NOTIFICATION DATA FROM BACKEND
   * 
   * Get's notifications from the backend. If there's no notifications, an extra message
   * will be printed to user. After a set of notifications has been fetched, all of their
   * types will be converted from number into a more readable string.
   * 
   * @param {ListViewEventData} pullUpEvent Event if user pulls up to refresh (optional)
   * @example Notifications like "someone liked your post" etc.
   * 
   */
  public getNotifications(pullUpEvent?: ListViewEventData): void {
    this.noNotifications = false;
    this._notificationService.getNotification()
      .subscribe(notifications => {
        if (notifications.length < 1) {
          this.noNotifications = true;
        }
        // If method was called with 'Pull up to refresh' -method
        if (pullUpEvent) pullUpEvent.object.notifyPullToRefreshFinished();
        this.notifications = notifications;
        // Convert every type from number to string
        this.notifications.forEach(n => {
          n.typeString = this.typeOfNotification[n.type];
        });
        this.isBusy = false;
      }, err => {
        this.isBusy = false;
        console.error(err);
        this._convertService.convertPrompt('Ilmoituksia ei voitu ladata', null, null, 6);
      });
  }

}
