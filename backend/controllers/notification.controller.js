
const Models = require('../seq/models/index');

const NotificationController = {

  
  /**
   * GET DATA FROM NOTIFICATION AND USER TABLE
   *
   * Finds one user's all notifications from database.
   * Peer user's username and profile-logo that associates with user will be fetched too.
   *
   * @param {number} req.params.user_id User's ID whose notifications we'll fetch
   * @example "John Liked your post" => 2
   *
   */
  getNotifications: (req, res) => {
    Models.Notification.findAll({
      where: { user_id: req.params.user_id },
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [
        {
          attributes: ['img'],
          model: Models.User,
          as: 'sender',
          required: true
        }
      ]
    })
      .then(notifications => {
        return res.send(notifications);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send(err);
      });
  },


  /**
   * CREATES NEW NOTIFICATION
   *
   * Create notification based on action on application
   * In route we called function name to id what stored userID in local variable and we insert
   * it to the user_id so we
   * can create new notification to the user it affects to what is = user_id. This function creates
   * notification to the database.
   *
   * @param {number} res.locals.id Middleware function which changes username to ID
   * @param {string} peer_user is the one who has liked commented etc etc.
   * @param {number} type: what type of notification it is. eg.type 2 = some one commented your post
   * @param {number} post_id ID of the post which can be included in the notification (OPTIONAL)
   * @param {number} comment_id ID of the comment which can be included in the notification (OPTIONAL)
   *
   */
  createNotification: (req, res) => {
    Models.Notification.create({
      user_id: res.locals.id,
      peer_user: req.body.peer_user,
      type: req.body.type,
      post_id: req.body.post_id,
      comment_id: req.body.comment_id
    })
      .then(notification => {
        return res.send(notification);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send(err);
      });
  },


  /**
   * DELETES NOTIFICATION ACCORDING TO 3 GIVEN VALUES
   *
   * Function which'll delete a notification from database based
   * on three values. We could just search for the ID of notification and
   * delete that row according to it's value but with these 3 values we
   * can identify that one row (if there's accidental duplicates this'll
   * delete them too.).
   *
   * If deletion is successful, true -boolean value will be returned.
   *
   * @param {number} req.locals.id Owner of that notification
   * @param {string} req.params.peer_user From whom the notification came
   * @param {number} req.params.type What type of notification it is
   * @param {number} req.params.postId If there were post involved in notification
   * @param {number} req.params.commentId If there were comment involved in notification
   *
   */
  deleteNotification: (req, res) => {

    // Create an object which'll store identifical information about that specific notification
    const creds = {
      user_id: res.locals.id,
      peer_user: req.params.peer_user,
      type: req.params.type
    };

    // If there's post ID with that specific notification
    if (req.params.postId !== 'undefined') creds.post_id = req.params.postId;
    // If there's comment ID with that specific notification
    if (req.params.commentId !== 'undefined') creds.comment_id = req.params.commentId;
    
    Models.Notification.destroy({
      where: creds
    }).then(result => {
      if (result === 0) return res.status(404).send({ success: false });
      return res.send({ success: true });
    })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  }
};

module.exports = NotificationController;