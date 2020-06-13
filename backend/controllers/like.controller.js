// Loads index.js which can be used to make queries to database
const Models = require('../seq/models/index');
// SQL operators (IN, BETWEEN ETC.)
const Op = require('sequelize').Op;

const LikeController = {

  
  /**
   * GET DATA ABOUT POSTS WHICH USER HAS AREADY LIKED
   *
   * Post IDs will come here as string and we will take all these - marks away and
   * convert the string to int value that database can use. 
   *
   * When user navigates through posts the like button will be colored
   * if user has liked that post in some point of his life. Get parameter values needed like user id
   * and post's IDs. If user hasn't like some post the value wont exists. Otherwise theres connection so user has liked
   * some post.
   * Post ids will come here as string so it will be converted to number so we can make sql query to database.
   *
   * @param {number} req.params.user_id User who's likes are being searched
   * @param {string} req.params.post_ids Values will come as string which are
   * converted to array of numbers
   * @example "1-3-4-50-29" => [1, 3, 4, 50, 29]
   *
   */
  getUserPostLikes: (req, res) => {
    Models.PostLikes.findAll({
      where: {
        user_id: req.params.user_id,
        post_id: {
          [Op.in]: req.params.post_ids.split('-').map(Number)
        }
      }
    })
      .then(postLikes => {
        return res.send(postLikes);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },

  /**
   * TOGGLE LIKE TO POST
   *
   * First the function checks if there's already a value in database (user liked specific post).
   * If there isn't any, it creates one. Return { liked: true/false } depending on if user liked 
   * or deleted their like.
   *
   * By tapping like button user can like own or some one elses post.
   * By tapping the like button again user can delete like connected to that post.
   *
   * @param {number} req.body.postId Which post was liked
   * @param {number} req.body.userId Who liked the post
   *
   */
  toggleUserPostLike: (req, res) => {
    Models.PostLikes.findOne({
      where: { post_id: req.body.postId, user_id: req.body.userId }
    })
      .then(toggle => {
        if (!toggle) {
          Models.PostLikes.create({
            post_id: req.body.postId,
            user_id: req.body.userId
          }).then(() => res.send({ liked: true }));
        } else {
          Models.PostLikes.destroy({
            where: {
              post_id: req.body.postId,
              user_id: req.body.userId
            }
          }).then(() => res.send({ liked: false }));
        }
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },


  /**
   * GETS AMOUNT OF LIKES FOR POSTS
   *
   * Function which'll count all the rows for posts according
   * to the PostLikes -table. Post ID's will
   * be returned alongside like-counts.
   *
   * @param {string} req.params.ids ID's for the posts whose
   * likes request want to know. Post ID's come in string and
   * they'll get separated into an array of numbers.
   * @example "1-3-4-50-29" => [1, 3, 4, 50, 29]
   *
   */
  getPostsLikes: (req, res) => {
    Models.PostLikes.count({
      attributes: ['post_id'],
      where: { post_id: {
        [Op.in]: req.params.ids.split('-').map(Number)
      }},
      group: 'post_id'
    })
      .then(likeAmounts => {
        if (likeAmounts.length < 1) {
          return res.status(404).send({ 'msg': 'Could not find any likes with: ' + req.params.ids });
        }
        return res.send(likeAmounts);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },


  /**
   * GETS THE AMOUNT FOR LIKES FOR A SET OF COMMENTS
   *
   * Function which'll count all the rows for comments according
   * to the CommentLikes -table. Comment ID's will
   * be returned alongside like-counts.
   *
   * @param {string} req.params.ids ID's for the posts whose
   * likes request want to know. Post ID's come in string and
   * they'll get separated into an array of numbers.
   * @example "1-3-4-50-29" => [1, 3, 4, 50, 29]
   *
   */
  getCommentsLikes: (req, res) => {
    Models.CommentLikes.count({
      attributes: ['comment_id'],
      where: {
        comment_id: {
          [Op.in]: req.params.ids.split('-').map(Number)
        }
      },
      group: 'comment_id'
    })
      .then(likeAmounts => {
        return res.send(likeAmounts);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },

  /**
   * FINDS EVERY COMMENT USER HAS LIKED FROM A SET OF COMMENTS
   *
   * Function which'll check if user has liked any of the comments coming
   * from parameter. These comments ID's will be converted into array when
   * comparing.If function founds any from database, these rows will be returned
   * individually to the frontend.
   *
   * @param {number[]} req.params.comment_ids Set of comments ID's which
   * will be checked
   * @param {number} req.params.user_id Whose likes will be searched from a
   * set of comments
   *
   */
  getUserCommentLikes: (req, res) => {
    Models.CommentLikes.count({
      attributes: ['comment_id'],
      where: {
        comment_id: {
          [Op.in]: req.params.comment_ids.split('-').map(Number)
        },
        user_id: req.params.user_id
      },
      group: 'comment_id'
    })
      .then(userLikes => {
        return res.send(userLikes);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },

  /**
   * CREATES/DESTROYS LIKE FOR ONE COMMENT
   *
   * Function which'll firstly check whether there is
   * a row with given comment's and user's ID in database
   * (if user has liked that one specific comment).
   *
   * If the row is found or isn't found, this function will do
   * an additional request which'll destroy or create that row.
   *
   * Lastly it'll return a boolean value =>
   *  User liked comment = true | User disliked comment = false
   *
   * @param {number} req.body.commentId Comment's ID which will be searched
   * @param {number} req.body.userId User's ID which will be searched
   *
   */
  toggleUserCommentLike: (req, res) => {
    Models.CommentLikes.findOne({
      where: {
        comment_id: req.body.commentId,
        user_id: req.body.userId
      }
    })
      .then(userLike => {
        // If user has liked specific comment
        if (userLike) {
          Models.CommentLikes.destroy({
            where: {
              comment_id: req.body.commentId,
              user_id: req.body.userId
            }
          }).then(() => res.send({ liked: false }));
        }
        // If user hasn't liked specific comment
        else {
          Models.CommentLikes.create({
            comment_id: req.body.commentId,
            user_id: req.body.userId
          }).then(() => res.send({ liked: true }));
        }
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  }
};

module.exports = LikeController;