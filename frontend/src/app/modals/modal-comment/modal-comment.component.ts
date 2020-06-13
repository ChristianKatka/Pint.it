import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { ListViewEventData, LoadOnDemandListViewEventData } from 'nativescript-ui-listview';
import { Label } from 'tns-core-modules/ui/label/label';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import * as localStorage from 'tns-core-modules/application-settings';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import { Router } from '@angular/router';
import { backend } from '../../connection';
import { url } from '~/app/picture-url';

import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ModalCategoryComponent } from '../../modals/modal-category/modal-category.component';

import { CommentService } from '~/app/services/comment.service';
import { ConvertService } from '~/app/services/convert.service';
import { PostService } from '../../services/post.service';
import { LikeService } from '~/app/services/like.service';
import { NotificationService } from '~/app/services/notification.service';

import { Comment } from '~/app/dataclasses/comment';


@Component({
  selector: 'ns-modal-comment',
  templateUrl: './modal-comment.component.html',
  styleUrls: ['./modal-comment.component.css'],
  moduleId: module.id
})
export class ModalCommentComponent implements OnInit {

  public url = url;
  // User's own profile-picture
  public profilePic: string;

  public isBusy = false;
  // Order in which comments will be fetched
  public order: string;
  // Post's ID whose comments we'll be looking
  public postId: number;
  // All comments in one variable
  public comments: Comment[];
  // User making new comment. text and which user is logged in
  public newComment = new Comment();
  // Owner of the post
  public postOwner: string;


  constructor(
    public modal: ModalDialogService,
    public vcRef: ViewContainerRef,
    public router: Router,
    private _params: ModalDialogParams,
    private _commentService: CommentService,
    private _convertService: ConvertService,
    private _likeService: LikeService,
    private _notificationService: NotificationService,
    private _postService: PostService
  ) { }

  ngOnInit() {
    this.order = 'Uusimmat';
    this.postId = this._params.context.postId;
    this.postOwner = this._params.context.username;
    this.newComment.post_id = this.postId;
    this.getComments(0, true);
    this.profilePic = localStorage.getString('img');
  }


  // Converts date
  public convertDate(date: Date): string {
    return this._convertService.convertDate(date);
  }
  // Converts number
  public convertNumber(amount: number): any {
    return this._convertService.convertNumber(amount);
  }
  // Closes modal and show user's profile
  public closeModal(username?: string): void {
    this._params.closeCallback(username);
  }

  // Creates notification
  createNotification(username: string, type: number, commentId?: number) {
    this._notificationService.createNotification(username, type,
      this.postId, commentId).subscribe(() => (err: Error) => console.error(err));
  }
  // Deletes notification
  deleteNotification(type: number, username: string, commentId?: number): void {
    this._notificationService.deleteNotification(username, type, this.postId, commentId)
      .subscribe(() => (err: Error) => console.error(err));
  }
  // Changes post value
  changePostValue(value: number): void {
    this._postService.updatePostValue(this.postId, value)
      .subscribe(() => (err: Error) => console.error(err));
  }


  /**
   * CREATES NEW COMMENT TO POST
   * 
   * User creates comment and it will be linked to the post. It'll call
   * service's function with comment-object which contains necessary information.
   * 
   * If a new comment is successfully made, the service will return that new comment's ID which
   * will then be used to create a new notification of that event.
   * 
   * @param {TextField} commentTextField TextField which contains the value
   * of the comment. Showing keyboard of that textfield will be hidden if 
   * comment is successfully added.
   * 
   */
  public createComment(commentTextField: TextField): void {
    this.isBusy = true;
    this._commentService.createComment(this.newComment).subscribe(comment => {
      this.isBusy = false;
      commentTextField.dismissSoftInput();
      this.newComment.text = '';
      this.getComments(0, true);
      this.createNotification(this.postOwner, 2, comment.id);
      this.changePostValue(2);
    }), (err: Error) => {
      this.isBusy = false;
      TNSFancyAlert.showError('Virhe!', '\t\t\t\t Kommenttia ei voitu luoda!', 'Ok');
      console.log(err);
    }
  }


  /**
   * GET COMMENTS FOR COMMENT-PAGE
   *
   * Function which'll get comments for frontpage according to post ID which was brought from
   * another component. Function has various different parameterts (most of them being optional).
   * 
   * Function will either push new comments after the old ones or overwrite old ones with new ones.
   * Function can also be called by 2 events from template (pull-up-to-refresh & infinite-scrolling).
   *
   * @param {number} amount The amount of comments alredy being shown
   * @param {boolean} reset If new posts will overwrite older ones (optional)
   * @param {ListViewEventData} pullUpEvent Event if user pulls up to refresh (optional)
   * @param {LoadOnDemandListViewEventData} loadMoreEvent Event if user scrolls down for more posts (optional)
   *
   */
  public getComments(amount: number, reset?: boolean,
    pullUpEvent?: ListViewEventData, loadMoreEvent?: LoadOnDemandListViewEventData): void {
    if (reset) this.comments = [];
    this._commentService.getComments(this.postId, this.order, amount)
      .subscribe(comments => {
        // If method was called with 'Pull up to refresh' -method
        if (pullUpEvent) pullUpEvent.object.notifyPullToRefreshFinished();
        // If method was while scrolling down to fetch more posts
        if (loadMoreEvent) loadMoreEvent.object.notifyLoadOnDemandFinished();
        // Push every comment to an array of objects
        this.comments.push(...comments);
        // Comments search-queries won't always place image to same value. This will ensure
        // the comments are always placed in right value 
        this.comments.forEach(comment => {
          const img = comment.comment_owner && comment.comment_owner.img ? comment.comment_owner.img : null; 
          comment.img = comment.img ? comment.img : img;
        });
        if (comments.length > 0) this.getCommentLikes(comments.map(c => c.id));
      }, err => {
        TNSFancyAlert.showError('Virhe!', 'Kommentteja ei voitu hakea.', 'Ok');
      });
  }


  /**
   * GETS LIKES FOR A SET OF COMMENTS
   * 
   * Function which gets the like-amounts for a set of comments. After likes have
   * been fetched, they'll be placed to right comments and will then be showed in 
   * template. 
   * 
   * @param {number[]} commentIds ID's of the comments whose like-amounts
   * one wants to know.
   * 
   */
  public getCommentLikes(commentIds: number[]): void {
    this._likeService.getCommentLikes(commentIds).subscribe(commentLikes => {
      commentLikes.forEach(likes => {
        this.comments.forEach(comment => {
          if (comment.id === likes.comment_id) {
            comment.likes = likes.count;
          }
        });
      });
      if (commentLikes.length > 0) this.getCommentUserLikes(commentIds);
    });
  }


  /**
   * CHECKS IF USER HAS LIKED FROM ANY COMMENTS
   * 
   * This function will do a HTTP-GET request to backend, which'll check 
   * whether logged in user has liked from a set of comments. If there's 
   * row found from any of the comments, these will be returned to frontend.
   * 
   * If like is found and there's returned row, the returned comment's ID will
   * also be checked and it'll be used in a forEach() -loop. If there's match found
   * that comment's boolean value will be converted to true.
   * 
   * @param {number[]} commentIds Set of comments' IDs which'll 
   * be checked 
   * 
   */
  public getCommentUserLikes(commentIds: number[]): void {
    this._likeService.getUserCommentLikes(commentIds).subscribe(userLikes => {
      if (userLikes.length > 0) {
        userLikes.forEach(userLike => {
          this.comments.forEach(comment => {
            if (comment.id === userLike.comment_id) {
              comment.liked = true;
            };
          });
        });
      };
    });
  }


  /**
   * CREATES/DESTROYS LIKE FROM ONE COMMENT
   * 
   * Function which'll either remove or add a new like to a specific comment.
   * The like -thumb will be quickly animated for some feedback.
   * 
   * Whether user added or removed like, it'll be checked after response is 
   * given from backend.   
   * 
   * @param {number} id Whose comment's like will be toggled
   * @param {string} username Who's comment is targeted
   * @param {Label} thumb Thumb -label which'll be animated after every tap
   *  
   */
  public toggleLike(id: number, username: string, thumb: Label): void {
    // Gives thumb an animation whenever user presses it
    thumb.animate({
      scale: { x: 2, y: 2 },
      duration: 80
    });
    setTimeout(() => {
      thumb.animate({
        scale: { x: 1, y: 1 },
        duration: 80
      });
    }, 50);
    // Does the request to backend via service
    this._likeService.toggleUserCommentLike(id)
      .subscribe(value => {
        this.comments.forEach(comment => {
          if (comment.id === id) {
            // Visual color change whether user likes comment or not
            comment.liked = value.liked ? true : false;
            // Increment or decrement the likes -value
            if (value.liked) {
              if (!comment.likes) comment.likes = 0;
              comment.likes++;
              this.createNotification(username, 1, id);
            } else {
              comment.likes--;
              this.deleteNotification(1, username, id);            
            } 
          }
        });
    });
  }


  /**
   * OPENS A MODAL WHICH IS USED TO FILTER COMMENTS
   *
   * Function which opens a modal where one can determine the category for comments.
   * If the user chooses same category as before or closes modal without selecting
   * anything, nothing will happen.
   *
   */
  public changeCategory(): void {
    const options = {
      context: {
        showAllFilters: false,
        filter: 'Kaikki',
        order: this.order
      },
      fullscreen: false,
      viewContainerRef: this.vcRef
    };
    this.modal.showModal(ModalCategoryComponent, options).then(order => {
      if (order && order !== this.order) {
        this.order = order;
        this.getComments(0, true);
      }
    });
  }


  /**
   * CLOSES COMMENTS MODAL WINDOW
   *
   * Function which closes the modal window when user swipes to left or right.
   * Whenever user swipes the modal this function will check whether the
   * swipe-direction was valid one through event (which includes
   * direction of the swipe).
   *
   * The comment modal window will either move to left or right according to
   * swipe direction. The modal will close after 0.2s.
   *
   * @example SWIPE LEFT => swipeEvent.direction = 1
   * @example SWIPE RIGHT => swipeEvent.direction = 2
   *
   * @param {SwipeGestureEventData} swipeEvent Event which includes all the
   * information needed from swipe.
   * @param {StackLayout} modal The whole modal layout.
   *
   */
  public closeCommentModal(swipeEvent: SwipeGestureEventData, modal: StackLayout): void {
    if (swipeEvent.direction < 3) {
      modal.animate({
        // If swipe-direction left -> push page to left (x = 500), otherwise right (x = -500)
        translate: { x: swipeEvent.direction < 2 ? 500 : -500, y: 0 },
        duration: 200
      });
      setTimeout(() => this._params.closeCallback(), 200);
    }
  }


}
