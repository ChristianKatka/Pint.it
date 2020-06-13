import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/directives/dialogs';
import { TNSFancyAlert } from 'nativescript-fancyalert';
import { Label } from 'tns-core-modules/ui/label/label';
import { backend } from '~/app/connection';
import { url } from '~/app/picture-url';

import { CommentService } from '../../services/comment.service';
import { PostService } from '../../services/post.service';
import { ConvertService } from '../../services/convert.service';
import { LikeService } from '../../services/like.service';

import { Post } from '../../dataclasses/post';
import { Comment } from '../../dataclasses/comment';


@Component({
  selector: 'ns-preview-notification',
  templateUrl: './preview-notification.component.html',
  styleUrls: [
    './preview-notification.component.css',
    '../../pages/frontpage/frontpage.component.css',
    '../modal-comment/modal-comment.component.css'
  ],
  moduleId: module.id,
})
export class PreviewNotificationComponent implements OnInit {

  // Root url for photos
  public url = url;

  public post: Post;
  public postLikes: number;
  public postCommentAmount: number;

  public comment: Comment;
  public commentLikes: number;

  constructor(
    private _params: ModalDialogParams,
    private _commentService: CommentService,
    private _postService: PostService,
    private _convertService: ConvertService,
    private _likeService: LikeService
  ) { }

  ngOnInit() {
    this.getPreviewValues();
    TNSFancyAlert.shouldDismissOnTapOutside = true;
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
  // Get likes for post
  public getLikesForPost(id: number[]): void {
    this._likeService.getPostsLikes(id).subscribe(likes => {
      if (likes.length > 0) this.postLikes = likes[0].count;
    });
  }
  // Get comment-amount for post
  public getCommentAmount(id: number[]): void {
    this._commentService.getCommentAmountForPosts(id).subscribe(amount => {
      if (amount.length > 0) this.postCommentAmount = amount[0].count;
    });
  }
  // Get likes for comment
  public getLikesForComment(id: number[]): void {
    this._likeService.getCommentLikes(id).subscribe(likes => {
      if (likes.length > 0) this.commentLikes = likes[0].count;
    })
  }
  // Close modal
  public goBack(): void {
    this._params.closeCallback();
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


  /**
   * GETS POST AND/OR COMMENT ID VALUES FROM CALLING COMPONENT
   * 
   * Function which'll be executed when user arrives to this modal.
   * It'll check whether postId and commentId -values arrived. If one of 
   * the values arrived, a function will be executed which searches that
   * specific post/comment from database through service.
   * 
   */
  public getPreviewValues(): void {
    if (this._params.context.postId) {
      this.getPost(this._params.context.postId);
    }
    if (this._params.context.commentId) {
      this.getComment(this._params.context.commentId);
    }
  }


  /**
   * GET 1 POST ACCORDING TO POST'S ID
   * 
   * Function which'll use post's ID to search 1 post from
   * database through service. If post is found, 2 other
   * functions will be executed which'll find the amount of likes
   * and comments that specific post has.
   * 
   * @param {number} id ID of the post 
   * 
   */
  public getPost(id: number): void {
    this._postService.getPostById(id).subscribe(post => {
      this.post = post;
      this.getLikesForPost([post.id]);
      this.getCommentAmount([post.id]);
    }, err => {
      console.error(err);
      this._convertService.convertPrompt('Postausta ei voitu hakea', null, null, 5);
    });
  }


  /**
   * GET 1 COMMENT ACCORDING TO COMMENTS'S ID
   *
   * Function which'll use comments's ID to search for 1 comment from
   * database through service. If comment is found, another
   * function will be executed which'll find the amount of likes
   * that specific comment has.
   *
   * @param {number} id ID of the comment
   *
   */
  public getComment(id: number): void {
    this._commentService.getCommentById(id).subscribe(comment => {
      this.comment = comment;
      this.getLikesForComment([comment.id]);
    }, err => {
      console.error(err);
      this._convertService.convertPrompt('Kommenttia ei voitu hakea', null, null, 5);
    });
  }

}
