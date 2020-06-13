// Libraries
import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
import { Label } from 'tns-core-modules/ui/label';
import { ListViewEventData, LoadOnDemandListViewEventData } from 'nativescript-ui-listview';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import { SelectedIndexChangedEventData } from 'tns-core-modules/ui/tab-view';
import { backend } from '../../connection';
import * as localStorage from 'tns-core-modules/application-settings';
import { AnimationCurve } from "tns-core-modules/ui/enums";
import { url } from '~/app/picture-url';

// Modal components and services
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ModalCommentComponent } from '~/app/modals/modal-comment/modal-comment.component';
import { ModalCategoryComponent } from '~/app/modals/modal-category/modal-category.component';
import { RouterExtensions } from 'nativescript-angular/router';

// Services
import { UserService } from '~/app/services/user.service';
import { RelationService } from '~/app/services/relation.service'
import { PostService } from '~/app/services/post.service'
import { NotificationService } from '../../services/notification.service';
import { LikeService } from '~/app/services/like.service';
import { ConvertService } from '~/app/services/convert.service';
import { CommentService } from '~/app/services/comment.service';

// Dataclasses
import { User } from '../../dataclasses/user';
import { Content } from '../../dataclasses/content';


@Component({
  selector: 'ns-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../frontpage/frontpage.component.css'],
  moduleId: module.id
})
export class ProfileComponent implements OnInit {

  // Visual button telling if you're following one
  @ViewChild('button') public button: ElementRef;

  // Root url for photos
  public url = url;
  public index: number;
  // Subsciption to the username which comes when one arrives to profile-page
  public usernameSubs: Subscription;

  // Hold posts, likes, comment-amounts and 2 latest comments
  public contents: Content[];
  // Order of the posts (Suosituimmat/viimeisimmät)
  public postOrder = 'Uusimmat';
  // Boolean value telling if profile-page is user's own or another one's
  public myProfile: boolean;

  // Contains all user's information
  public user = new User();
  // Number values determing information about user's relations and amount of posts
  public following: number;
  public followers: number;
  public postsAmount: number;

  // whether or not you are following user
  public booleanFollow = true;


  constructor(
    public modal: ModalDialogService,
    public vcRef: ViewContainerRef,
    public router: RouterExtensions,
    private _route: ActivatedRoute,
    private _likeService: LikeService,
    private _userService: UserService,
    private _relationService: RelationService,
    private _postService: PostService,
    private _convertService: ConvertService,
    private _commentService: CommentService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.handleSubscription();
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

  // People who follow's one user
  public getFollowers(): void {
    this._relationService.getFollowers(this.user.id)
      .subscribe(amount => this.followers = amount.count);
  }
  // People, whose user follows
  public getFollowing(): void {
    this._relationService.getFollowing(this.user.id)
      .subscribe(amount => this.following = amount.count);
  }
  // Amount of posts of one user
  public getPostsAmount(username: string): void {
    this._postService.getUserPostsAmount(username)
      .subscribe(amount => this.postsAmount = amount.count);
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

  // Shows error to user
  public showError(msg: string): void {
    TNSFancyAlert.showError('Virhe!', msg, 'OK');
  }

  // Goes back to previous page 
  public goBack(): void {
    this.router.back();
  }


  /**
   * WHEN USER DOUBLE-TAPS POST-IMAGE: LIKE ANIMATION WILL BE RENDERED
   * 
   * By double tapping post-image. This animation function will be called.
   * Set timeout function will hide animation icon after its played
   * 
   * @param {Label} thumb Icon what'll be animated in the image after user has doubletapped it
   * 
   */
  public animateLike(thumb: Label) {
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
  public getPostUserLikes(postIds: number[]) {
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
    })
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
    // this.liked = !this.liked;
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
   * FOLLOWS / UNFOLLOWS
   * 
   * Function that toggles relation to the databse between two users follows/unfollow
   * and changes button accordingly
   * 
   * @param {number} id Who's profile you are in
   * 
   */
  public toggleFollow(): void {
    this._relationService.toggleFollower(this.user.id).subscribe(() => {
      this.booleanFollow = !this.booleanFollow;
      this.toggleButton(this.booleanFollow);
      if (!this.following) this.following = 0; 
      // If you're starting to follow someone, create notification to that user
      if (this.booleanFollow) {
        this._notificationService.createNotification(this.user.username, 0).subscribe(() => err => {
          console.error(err);
        });
        this.following++;
        // If you stop following someone, delete notification which told you followed someone
      } else {
        this._notificationService.deleteNotification(this.user.username, 0).subscribe(() => err => {
          console.error(err);
        });
        this.following--;
      }
    }, err => {
      console.error(err);
      this._convertService.convertPrompt('Käyttäjän seuraaminen epäonnistui', null, null, 1);
    });
  }


  /**
   * CHECKS IF YOU ARE FOLLOWING SPECIFIC USER
   * 
   * When you enter someone's profile this function checks if you are following 
   * that user.
   * 
   * @param {number} follows Users id whose profile you are in 
   * 
   */
  public checkFollowStatus(follows: number) {
    this._relationService.getFollowStatus(follows).subscribe(res => {
      if (res.follows) {
        this.booleanFollow = true;
      } else {
        this.booleanFollow = false;
      }
      this.toggleButton(res.follows);
    })
  }


  /**
   * TOGGLES THE BUTTON USER CAN USE TO FOLLOW/UNFOLLOW ANOTHER PERSON
   * 
   * Function which'll visually change the button user sees in another's profile
   * page. The boolean value from parameter will determine what user will see
   * on another's profile-page.
   * 
   * @param {true} following Boolean value determining what user will see in button
   * (true) => "Stop following" -- (false) => "Start following"
   *  
   */
  public toggleButton(following: boolean): void {
    this.button.nativeElement.class = following ? 'following-button' : 'unfollowing-button';
    this.button.nativeElement.text = following ? 'Lopeta seuraaminen' : 'Seuraa';
  }


  /**
   * SHOWS OR HIDES CATEGORY
   * 
   * Function which shows category in header if user goes to user profile's posts. User's
   * post will be fetched only when user goes to 'Postaukset' -tab.
   * 
   * @param {SelectedIndexChangedEventData} event Event when user changes tab
   * @param {Label} label Label which contains category-button
   * 
   */
  public tabChanged(event: SelectedIndexChangedEventData, label: Label): void {
    if (event.newIndex === 1) {
      label.visibility = 'visible';
      label.animate({
        translate: { x: 0, y: 0 },
        duration: 100
      });
      this.getPosts(0, true);
    } else {
      label.animate({
        translate: { x: 0, y: -50 },
        duration: 100
      });
    }
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
          setTimeout(() => {
          this.index = 0;
          this.router.navigate(['/profile', username]);
        }, 100);
      } else {
        this.getComments([postId], true);
        this.getCommentAmounts([postId], true);
      }
    });
    
  }


  /**
   * HANDLES USERNAME-SUBSCRIPTION WHICH COMES AS URL-PARAMETER
   * 
   * Function which listens to active usernames coming to this page via
   * url-parameter. This for example allows you to go to your own profile-page
   * while you're in someone's else profile-page.
   * 
   */
  public handleSubscription(): void {
    this.usernameSubs = this._route.params.subscribe(
      (params: Params) => {
        this.following = 0;
        this.followers = 0;
        this.postsAmount = 0;
        // If this is your own profile
        if (params.username === localStorage.getString('username')) {
          this.user.username = params.username;
          this.myProfile = true;
          this.user.id = localStorage.getNumber('id');
          this.user.img = localStorage.getString('img');
          this.user.bio = localStorage.getString('bio');
          this.getFollowers();
          this.getFollowing();
          this.getPostsAmount(params.username);
        }
        // If this isn't your own profile, get profile information
        else {
          this.myProfile = false;
          this.getProfile(params.username);
        }
      });
  }



  /**
   * GET USER INFORMATION
   * 
   * Calls backend function via Http-request. The backend function gets data from database
   * and then sends it to frontend where requested data will be rendered in template.
   * 
   * This funcion won't be called if user is navigating in his/her own profile-page.
   * 
   * @param {string} username Username of the user whose information we'll be searching
   * 
   */
  public getProfile(username: string): void {
    this._userService.getProfile(username).subscribe(user => {
      this.user = user;
      this.getFollowers();
      this.getFollowing();
      this.getPostsAmount(username);
      this.checkFollowStatus(this.user.id);
    }, err => {
      console.error(err);
    });
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
    this._postService.getUsersPosts(this.user.username, amount, this.postOrder)
      .subscribe(posts => {
        // If method was called with 'Pull up to refresh' -method
        if (pullUpEvent) pullUpEvent.object.notifyPullToRefreshFinished();
        // If method was while scrolling down to fetch more posts
        if (loadMoreEvent) loadMoreEvent.object.notifyLoadOnDemandFinished();

        // If new posts will overwrite older posts
        if (reset) this.contents = [];

        if (posts.length > 0) {
          // Push every post received to an array of objects
          posts.forEach(post => this.contents.push({ post: post }));

          // Takes ID's from every post fetched
          const postIds = posts.map(post => post.id);

          this.getLikesForPosts(postIds);
          this.getCommentAmounts(postIds);
          this.getComments(postIds)
          this.getCommentUserLikes(postIds);
          this.getPostUserLikes(postIds);
        }
      }, err => {
        console.error(err);
        // If method was called with 'Pull up to refresh' -method
        if (pullUpEvent) pullUpEvent.object.notifyPullToRefreshFinished();
        // If method was while scrolling down to fetch more posts
        if (loadMoreEvent) loadMoreEvent.object.notifyLoadOnDemandFinished();
        this._convertService.convertPrompt('Postauksia ei voitu hakea');
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
        commentLikes.forEach(likes => {
          this.contents[position].comments.forEach(comment => {
            if (comment.id === likes.comment_id) {
              comment.likes = likes.count;
            }
          });
        });
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
   * @param {number} id Whose comment's like will be toggled
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
    }, 50);
    // Does the request to backend via service
    this._likeService.toggleUserCommentLike(commentId)
      .subscribe(value => {
        this.contents.forEach(content => {
          content.comments.forEach(comment => {
            if (comment.id === commentId) {
              comment.liked = value.liked ? true : false;
              if (value.liked) {
                if (!comment.likes) comment.likes = 0;
                comment.likes++;
                this.createNotification(1, username, postId, commentId);
              } else {
                comment.likes--;
                this.deleteNotification(1, username);
              }
            }
          });
        });
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
        showFilters: false,
        filter: 'Kaikki',
        order: this.postOrder
      },
      fullscreen: false,
      viewContainerRef: this.vcRef
    };
    this.modal.showModal(ModalCategoryComponent, options).then(order => {
      // Get new values from modal (if there's any)
      this.postOrder = order ? order : this.postOrder;
      this.getPosts(0, true);
    });
  }


  /**
   * CHANGES BETWEEN LONG AND SHORT BIO IN USER
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
