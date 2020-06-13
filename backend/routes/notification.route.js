// Controller
const Notification = require('../controllers/notification.controller');
const User = require('../controllers/user.controller');
const ValidateToken = require('../auth/validatetoken');

// Includes all routes
module.exports = app => {

  // Get user's notifications and picture of those who has liked your post or started following you etc.
  app.get('/notification/getnotifications/:user_id', ValidateToken, Notification.getNotifications);

  // Converts gotten username to ID and then creates a new notification
  app.post('/notification/createnotification', ValidateToken, User.getIdByUsername, Notification.createNotification);

  // Find notification with user_id, peer_user and type, then delete it
  app.delete('/notification/deletenotification/:username/:peer_user/:type/:postId?/:commentId?', 
    ValidateToken, User.getIdByUsername, Notification.deleteNotification);
}
