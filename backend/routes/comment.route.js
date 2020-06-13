const Comment = require('../controllers/comment.controller');
const ValidateToken = require('../auth/validatetoken');

module.exports = app => {

  // Gets an amount of comments commented on a post
  app.get('/comment/commentamount/:posts', ValidateToken, Comment.getCommentAmount);

  // Gets 2 latest comments for each post in frontpage
  app.get('/comment/commentsfrontpage/:postId', ValidateToken, Comment.getCommentsForFrontpage);

  // Gets newest comments when searched with a certain post ID
  app.get('/comment/latestcomments/:postId/:position', ValidateToken, Comment.getLatestComments);

  // Gets the most liked comments for a certain post ID
  app.get('/comment/mostlikedcomments/:postId/:position', ValidateToken, Comment.getMostLikedComments);

  // Create new comment
  app.post('/comment/createcomment', ValidateToken, Comment.createComment);

  // Get comment by ID
  app.get('/comment/commentbyid/:id', ValidateToken, Comment.getCommentById);

}
