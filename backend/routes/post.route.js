// Controller
const Post = require('../controllers/post.controller');
const ValidateToken = require('../auth/validatetoken');

// Includes all routes
module.exports = app => {

  // Find posts from all users (usually 5 at a time)
  app.get('/post/postsall/:order/:position/:id', ValidateToken, Post.findPostsByAll);

  // Find posts from users in which a specific user has subscribed to (Relation-table) 
  app.get('/post/postsfollowed/:order/:position/:userId', ValidateToken, Post.findPostsByFollowed);

  // Find how many posts specific user has made
  app.get('/post/userpostsamount/:username', ValidateToken, Post.findUserPostAmount);

  // Gets posts from a specific user (according to username)
  app.get('/post/userposts/:username/:position/:order', ValidateToken, Post.findUserPosts);

  // Creates a new post (with or without image)
  app.post('/post/createpost/:username', ValidateToken, Post.createPost);

  // Get post by ID
  app.get('/post/postbyid/:id', ValidateToken, Post.getPostById);

  // Changes post's hidden value (increases / descreases)
  app.put('/post/value', ValidateToken, Post.changePostValue);

}