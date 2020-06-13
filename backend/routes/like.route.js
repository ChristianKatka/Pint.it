const Like = require('../controllers/like.controller');
const ValidateToken = require('../auth/validatetoken');

module.exports = app => {
  
  // Fetch likes for a set of posts (Postlikes-table)
  app.get('/like/postslikes/:ids',ValidateToken, Like.getPostsLikes);

  // Fetch likes for a set of comments (CommentLikes-table)
  app.get('/like/commentlikes/:ids', ValidateToken, Like.getCommentsLikes);

  // Like someones or your own post
  app.put('/like/toggleuserpostlike', ValidateToken, Like.toggleUserPostLike);

  // Check if logged in user has liked some posts
  app.get('/like/getuserpostlikes/:user_id/:post_ids', ValidateToken, Like.getUserPostLikes);

  // Checks if user has liked from a set of comments
  app.get('/like/usercommentlikes/:user_id/:comment_ids', ValidateToken, Like.getUserCommentLikes);

  // Toggle's logged in user's like from one comment
  app.put('/like/toggleusercommentlike', ValidateToken, Like.toggleUserCommentLike);
}