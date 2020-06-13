// Angular + Nativescript -libraries
import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Label } from 'tns-core-modules/ui/label';
import { ListViewEventData, LoadOnDemandListViewEventData } from 'nativescript-ui-listview';
import { RouterExtensions } from 'nativescript-angular/router';
import { RadListViewComponent } from 'nativescript-ui-listview/angular/listview-directives';
import { url } from '~/app/picture-url';

// Double tap like
import { AnimationCurve } from "tns-core-modules/ui/enums";

// Modal-services & libraries
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ModalCommentComponent } from '~/app/modals/modal-comment/modal-comment.component';
import { ModalCategoryComponent } from '~/app/modals/modal-category/modal-category.component';
import { ModalSearchComponent } from '../../modals/modal-search/modal-search.component';

// Services
import { PostService } from '~/app/services/post.service';
import { LikeService } from '~/app/services/like.service';
import { CommentService } from '~/app/services/comment.service';
import { ConvertService } from '../../services/convert.service';
import { NotificationService } from '../../services/notification.service';

// Dataclasses
import { Content } from '~/app/dataclasses/content';


@Component({
  selector: 'ns-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.css'],
  moduleId: module.id,
})
export class FrontpageComponent implements OnInit {

  // Listview which'll contain all posts and comments inside
  @ViewChild('contentList') public contentList: RadListViewComponent;

  // Root url for photos
  public url = url;

  // Hold posts, likes, comment-amounts and 2 latest comments
  public contents: Content[];

  // Boolean value represents if first posts are still being fetched
  public isBusy = true;

  // Search-categories for post filtering and order. These values will load
  // everytime user comes to frontpage. Can be changed via category-modal.
  public postOrder = 'Uusimmat';
  public postFilter = 'Kaikki';


  constructor(
    public modal: ModalDialogService,
    public vcRef: ViewContainerRef,
    public router: RouterExtensions,
    private _postService: PostService,
    private _likeService: LikeService,
    private _commentService: CommentService,
    private _convertService: ConvertService,
    private _notificationService: NotificationService
  ) { }


  ngOnInit() {
    this.getPosts(0, true);
  }


  // Converts date
  public convertDate(date: Date): string {
    return this._convertService.convertDate(date);
  }
  // Converts number
  public convertNumber(amount: number): any {
    return this._convertService.convertNumber(amount);
  }
  // Converts rating
  public convertRating(amount: number): any {
    return this._convertService.convertRating(amount);
  }

  // Creates notification
  createNotification(type: number, username: string, postId?: number, commentId?: number): void {
    this._notificationService.createNotification(username, type, postId, commentId).
      subscribe(() => (err: Error) => console.error(err));
  }
  // Deletes notification
  deleteNotification(type: number, username: string, postId?: number, commentId?: number): void {
    this._notificationService.deleteNotification(username, type, postId, commentId)
      .subscribe(() => (err: Error) => console.error(err));
  }
  // Changes post value
  changePostValue(id: number, value: number): void {
    this._postService.updatePostValue(id, value)
      .subscribe(() => (err: Error) => console.error(err));
  }

  // Scrolls user back to top
  scrollToTop() {
    this.contentList.nativeElement.scrollToIndex(0, false);
    this.contents = [];
    this.getPosts(0, true);
  }

  
  /**
   * GETS POSTS FROM BACKEND (5 at a time)
   * 
   * Function which calls PostService's GET-request to get posts
   * according to filters and orders. Application will only load 5 posts at 
   * a time to save loading-time.
   * 
   * After posts have been successfully fetched, various functions will be
   * called to get more information about posts.
   * 
   * @param {number} amount Amount of posts already being shown
   * @param {boolean} reset If (true), previous posts will be overwritten by new posts (optional)
   * @param {ListViewEventData} pullUpEvent Event if user pulls up to refresh (optional)
   * @param {LoadOnDemandListViewEventData} loadMoreEvent Event if user scrolls down for more posts (optional)
   * 
   */
  public getPosts(amount: number, reset?: boolean,
    pullUpEvent?: ListViewEventData, loadMoreEvent?: LoadOnDemandListViewEventData): void {
    this._postService.getPosts(this.postOrder, this.postFilter, amount).subscribe(posts => {
      // If method was called with 'Pull up to refresh' -method
      if (pullUpEvent) pullUpEvent.object.notifyPullToRefreshFinished();
      // If method was while scrolling down to fetch more posts
      if (loadMoreEvent) loadMoreEvent.object.notifyLoadOnDemandFinished();

      // If new posts will overwrite older posts
      if (reset) this.contents = [];
      // Tell activity indicator that first posts has been fetched
      this.isBusy = false;

      if (posts.length > 0) {
        // Push every post received to an array of objects
        posts.forEach(post => this.contents.push({ post: post }));
        // Takes ID's from every post fetched
        const postIds = posts.map(post => post.id);
          
        this.getLikesForPosts(postIds);
        this.getPostUserLikes(postIds);
        this.getCommentAmounts(postIds);
        this.getComments(postIds);
      }
    }, err => {
      console.error(err);
      // If method was called with 'Pull up to refresh' -method
      if (pullUpEvent) pullUpEvent.object.notifyPullToRefreshFinished();
      // If method was while scrolling down to fetch more posts
      if (loadMoreEvent) loadMoreEvent.object.notifyLoadOnDemandFinished();
      this.isBusy = false;
      this._convertService.convertPrompt('Postauksia ei voitu hakea', null, null, 5);
    });
  }


  /**
   * GETS LIKES FOR POSTS
   * 
   * Function which calls LikeService's GET-request to get likes for set of posts.
   * It'll receive latest posts ID's fetched from database and search like-amounts for
   * them.
   * 
   * @param {number[]} postIds ID's for posts whose like-amounts will be fetched
   * 
   */
  public getLikesForPosts(postIds: number[]): void {
    this._likeService.getPostsLikes(postIds).subscribe(likes => {
      for (const content of this.contents) {
        if (content.likes) continue;
        for (const like of likes) {
          if (content.post.id === like.post_id) {
            content.likes = like.count;
            break;
          }
        }
      }
    });
  }


  /**
   * GETS AMOUNT OF COMMENTS FOR POSTS
   * 
   * Function which calls CommentService's GET-request to get amount of comment for a set 
   * of posts. It'll receive comment-amounts in number and a ID of the posts in which those 
   * numbers belong to.
   * 
   * @param {number[]} postIds ID's for posts whose comment-amounts will be fetched.
   * @param {boolean} override If new values will overwrite old values (optional)
   *  
   */
  public getCommentAmounts(postIds: number[], override?: boolean): void {
    this._commentService.getCommentAmountForPosts(postIds)
      .subscribe(commentAmounts => {
        for (const content of this.contents) {
          if (content.commentAmount && !override) continue;
          for (const amount of commentAmounts) {
            if (content.post.id === amount.post_id) {
              content.commentAmount = amount.count;
              break;
            }
          }
        }
      });
  }


  /**
   * GETS 2 LATEST COMMENTS FOR ONE POST
   * 
   * Function which calls CommentService's GET-request to get 2 latest comments for one 
   * post. It'll loop through each of the ID's and makes a separate HTTP-request for 
   * each one of them. 
   * 
   * After 0-2 latest comments (if there's any) has been fetched 
   * they will placed to their corresponding location in the Content-variable (array
   * of objects). Right placement will be checked through already included post's ID.
   * 
   * @param {number[]} postIds ID's for posts whose 2 latest comments will be fetched.
   * @param {boolean} override If new values will overwrite old values (optional)
   * 
   */
  public getComments(postIds: number[], override?: boolean): void {
    postIds.forEach(id => {
      this._commentService.getCommentsFrontpage(id)
        .subscribe(comments => {
          if (comments.length > 0) {
            for (let i = 0; i < this.contents.length; i++) {
              if (this.contents[i].comments && !override) continue;
              if (this.contents[i].post.id === comments[0].post_id) {
                this.contents[i].comments = comments;
                const commentIds = comments.map(comment => comment.id);
                this.getLikesForComments(commentIds, i);
                this.getCommentUserLikes(commentIds);
                break;
              }
            }
          }
        });
    });
  }



  /**
   * WHEN USER DOUBLE-TAPS POST-IMAGE: LIKE ANIMATION WILL BE RENDERED
   * 
   * By double tapping post-image. This animation function will be called.
   * Set timeout function will hide animation icon after its played
   * 
   * This function is connected to toggle like button so double tap once you will like the post
   * double tapping second time will remove your like from the post
   * 
   * @param {Label} thumb Icon what'll be animated on top of the post image after user has double tapped it
   * 
   */
  public animateLike(thumb: Label): void {
    thumb.animate({
      scale: { x: 3, y: 3 },
      duration: 300,
      curve: AnimationCurve.easeIn,
      opacity: 1
    });
    setTimeout(() => {
      thumb.animate({
        scale: { x: 0, y: 0 },
      });
    }, 300);
  }



  /**
   * CHECKS IF USER HAS LIKED POSTS
   * 
   * If user has liked some posts the like button will be colored.
   * 
   * This function will be called everytime new posts will be fetched.
   * When getting posts the posts will go through this function and it will 
   * see if user has liked any of posts rendered to frontpage.
   * 
   * If we found matching value then that means that specific post 
   * is liked by that user.
   * 
   * @param {number[]} postIds Check all id`s (mostly only five at the time)
   * 
   */
  public getPostUserLikes(postIds: number[]): void {
    this._likeService.getUserPostLikes(postIds).subscribe(userLikes => {
      if (userLikes.length > 0) {
        userLikes.forEach(userLike => {
          this.contents.forEach(content => {
            if (content.post.id === userLike.post_id) {
              content.post.liked = true;
            }
          });
        });
      }
    });
  }

  

  /**
   * THIS FUNCTION ALLOWS LIKING POSTS
   * 
   * This function handles liking -functionality in application.
   * By double-clicking post's image or single-clicking the like button this function adds value to database 
   * which creates a like. If you tap either one again your like will be deleted (toggle functionality).
   * 
   * Boolean-value { liked: true / false } will be returned. If post is liked add one number to 
   * liked -button and create notification to the post's owner.
   * If user deleted their like, minus one value from liked -button and delete notification about that event. 
   * 
   * @param {number} postId Which post was liked
   * @param {string} username Who liked the post
   * @param {Label} likeButton Button which'll be animated (optional)
   * 
   */
  public toggleLikePost(postId: number, username: string, likeButton?: Label): void {
    this._likeService.toggleUserLikePost(postId)
      .subscribe(value => {
        this.contents.forEach(content => {
          if (content.post.id === postId) {
            content.post.liked = value.liked ? true : false;
            if (value.liked) {
              if (!content.likes) content.likes = 0;
              content.likes++;
              this.createNotification(3, username, postId);
              this.changePostValue(postId, 1);
            } else {
              content.likes--;
              this.deleteNotification(3, username, postId);
              this.changePostValue(postId, -1);
            }
          }
        });
      });
    if (likeButton) {
      likeButton.animate({
        translate: { x: 0, y: -7 }, duration: 80
      });
      setTimeout(() => {
        likeButton.animate({
          translate: { x: 0, y: 0 }, duration: 80
        });
      }, 80);
    }
  }



  /**
   * GETS THE AMOUNT OF LIKES FOR COMMENTS
   * 
   * Function which calls LikeService's GET-request to get likes for a set of 
   * comments. It'll loop through every comment's ID to get the amount of likes.
   * 
   * @param {number[]} commentIds ID's for comments whose like-amounts one wants 
   * to know.
   * @param {number} position The position in contents -array where we'll place 
   * those like-amounts (with this we won't have to loop through the whole array).
   * 
   */
  public getLikesForComments(commentIds: number[], position: number): void {
    this._likeService.getCommentLikes(commentIds)
      .subscribe(commentLikes => {
        if (commentLikes.length > 0) {
          commentLikes.forEach(likes => {
            this.contents[position].comments.forEach(comment => {
              if (comment.id === likes.comment_id) {
                comment.likes = likes.count;
              }
            });
          });
        }
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
          this.contents.forEach(content => {
            if (content.comments) {
              content.comments.forEach(comment => {
                if (comment.id === userLike.comment_id) {
                  comment.liked = true;
                }
              });
            }
          });
        });
      }
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
   * @param {number} commentId Whose comment's like will be toggled
   * @param {string} username Owner of the comment (used for notifications)
   * @param {number} postId ID of the post in which the comments exists (used for notifications)
   * @param {Label} thumb Thumb -label which'll be animated after every tap
   *  
   */
  public toggleLikeComment(commentId: number, username: string, postId: number, thumb: Label): void {
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
    }, 80);
    // Does the request to backend via service
    this._likeService.toggleUserCommentLike(commentId)
      .subscribe(value => {
        this.contents.forEach(content => {
          if (content.comments) {
            content.comments.forEach(comment => {
              if (comment.id === commentId) {
                comment.liked = value.liked ? true : false;
                if (value.liked) {
                  if (!comment.likes) comment.likes = 0;
                  comment.likes++;
                  this.createNotification(1, username, postId, commentId);
                } else {
                  comment.likes--;
                  this.deleteNotification(1, username, postId, commentId);
                }
              }
            });
          }
        });
      });
  }


  /**
   * CHANGES THE VALUE OF SEARCHBAR
   *
   * Function which toggles the value of the searchbar.
   * Toggles boolean value of searchbar-variable from true/false.
   *
   */
  public openSearchbar(): void {
    const options = {
      fullscreen: true,
      viewContainerRef: this.vcRef
    };
    this.modal.showModal(ModalSearchComponent, options).then(username => {
      if (username) {
        setTimeout(() => {
          this.router.navigate(['/profile/', username])
        }, 50);
      }
    });
  }


  /**
   * SHOW ALL COMMENTS OF ONE POST IN MODAL
   *
   * Function which shows all the comments of one specific post. Comments will be
   * shown according to given post ID.
   * 
   * @param {number} postId Post ID (identifier) of the post whose comments will be shown.
   * 
   */
  public showAllComments(postId: number, username: string): void {
    const options = {
      context: { postId, username },
      fullscreen: true,
      viewContainerRef: this.vcRef
    };
    this.modal.showModal(ModalCommentComponent, options).then(username => {
      if (username) {
        setTimeout(() => this.router.navigate(['/profile', username]), 100);
      } else {
        this.getComments([postId], true);
        this.getCommentAmounts([postId], true);
      }
    });
  }


  /**
   * CHANGES CATEGORY AND/OR ORDER FOR POSTS
   * 
   * Function which'll call modal-component for different filtering 
   * and order of the posts. Current filter and order options will be 
   * sent to modal.
   * 
   * If user chooses new filters/orders, function will call another 
   * function which'll make new post GET-request according to new values.
   * Old posts will be overwritten by new posts according to filters & orders.
   * 
   */
  public changeCategory(): void {
    const options = {
      context: {
        showFilters: true,
        order: this.postOrder,
        filter: this.postFilter
      },
      fullscreen: false,
      viewContainerRef: this.vcRef
    };
    this.modal.showModal(ModalCategoryComponent, options).then(category => {
      // Get new values from modal (if there's any)
      this.postOrder = category && category.order ? category.order : this.postOrder;
      this.postFilter = category && category.filter ? category.filter : this.postFilter;
      this.getPosts(0, true);
    });
  }


  /**
   * CHANGES BETWEEN LONG AND SHORT DESCRIPTION IN POSTS
   *
   * Function which toggles between short and long
   * description (if there's enough characters).
   *
   * @param {Label} shortLabel Label which contains minified description.
   * @param {Label} longLabel Label which contains whole description.
   *
   */
  public toggleDesc(shortLabel: Label, longLabel: Label): void {
    if (shortLabel && longLabel) {
      if (shortLabel.visibility === 'visible') {
        shortLabel.visibility = 'collapse';
        longLabel.visibility = 'visible';
      } else {
        shortLabel.visibility = 'visible';
        longLabel.visibility = 'collapse';
      }
    }
  }

}
