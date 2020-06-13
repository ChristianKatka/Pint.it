
const Models = require('../seq/models/index');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const CommentController = {


  /**
   * GETS AN AMOUNT OF COMMENTS FOR A SET OF POSTS
   * 
   * Function which'll get the number of comments on a set
   * of posts. 
   * 
   * @param {string} req.params.post ID's for the posts whose
   * comment-amounts request wants to know. Post ID's come in string 
   * and they'll get separated into an array of number.
   * @example "1-3-4-50-29" => [1, 3, 4, 50, 29] 
   * 
   */
  getCommentAmount: (req, res) => {
    Models.Comment.count({
      attributes: ['post_id'],
      where: {
        'post_id': {
          [Op.in]: req.params.posts.split('-').map(Number)
        }
      },
      group: 'post_id'
    }).then(commentAmounts => {
      res.send(commentAmounts)
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
  },


  /**
   * GETS 2 LATEST POSTS (FRONTPAGE)
   * 
   * Function which'll fetch 2 latest comments for 1 post. These comments
   * will be shown under the post.
   * 
   * @param {number} req.params.postId Contains a post whose 2
   * latest comments one wants to know.
   * 
   */
  getCommentsForFrontpage: (req, res) => {
    Models.Comment.findAll({
      where: { post_id: req.params.postId },
      limit: 2,
      include: [{
        model: Models.User,
        as: 'comment_owner',
        attributes: ['img'],
        required: true
      }],
      order: [['createdAt', 'DESC']]
    }).then(comments => {
      res.send(comments);
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
  },


  /**
   * GETS All COMMENTS WHEN SEARCHED WITH A CERTAIN POST ID
   * 
   * Function which'll get all the comments from a specific post. These 
   * comments will be displayed 10 at a time.
   * 
   * @param {number} req.params.postId Contains a post that we want to see
   * all comments of.
   * @param {number} req.params.position The position from where the search
   * begins.
   * 
   */
  getLatestComments: (req, res) => {
    Models.Comment.findAll({
      where: { post_id: req.params.postId },
      limit: 10,
      offset: Number(req.params.position),
      include: [{
        model: Models.User,
        as: 'comment_owner',
        attributes: ['img'],
        required: true
      }],
      order: [['createdAt', 'DESC']]
    }).then(comments => {
      res.send(comments);
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
  },


  /**
   * GETS MOST LIKED COMMENTS
   * 
   * Function finds the most liked comments and sorts them so that the comment with most likes is first.
   * 
   * @param {number} req.params.postId Contains a post that we want to see
   * all comments of.
   * @param {number} req.params.position The position in the array from where the search
   * begins.
   * 
   */
  getMostLikedComments: (req, res) => {
    Models.Comment.sequelize.query(`SELECT Comments.*, comment_owner.img FROM Comments
      INNER JOIN Users AS comment_owner ON comment_owner.username = Comments.username 
      LEFT OUTER JOIN CommentLikes ON Comments.id = CommentLikes.comment_id
      WHERE Comments.post_id = ?
      GROUP BY Comments.id
      ORDER BY COUNT(CommentLikes.comment_id) DESC
      LIMIT 10 OFFSET ?;`,
      { replacements: [Number(req.params.postId), Number(req.params.position)], type: Sequelize.QueryTypes.SELECT })
      .then(comments => {
        return res.send(comments);
      }).catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },


  /**
   * CREATES COMMENT TO POST
   * 
   * Creates the comment to the database and. If comment is 
   * successfully created, we'll get that comment's ID by additional
   * query, after new comment's ID has been fetched, it'll be returned
   * to frontend.
   * 
   * @param {string} req.body.text Comment's text
   * @param {number} req.body.post_id What post was commented
   * @param {string} req.body.username Who made the comment
   * 
   */
  createComment: (req, res) => {
    Models.Comment.create({
      text: req.body.text,
      post_id: req.body.post_id,
      username: req.body.username,
    })
      .then(() => {
        Models.Comment.findOne({
          where: {
            username: req.body.username,
            text: req.body.text
          },
          order: [['createdAt', 'DESC']],
          attributes: ['id']
        }).then(comment => {
          return res.send({ id: comment.id });
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send(err);
      })
  },


  /**
   * FINDS COMMENT BY ID
   * 
   * Function which'll try to find 1 comment by it's primary key (ID).
   * If one is found, that comment will be returned.
   * 
   * @param {number} req.params.id ID of the comment we're searching
   *  
   */
  getCommentById: (req, res) => {
    Models.Comment.findOne({
      where: { id: req.params.id },
      include: [{
        model: Models.User,
        as: 'comment_owner',
        attributes: ['img'],
        required: true
      }],
    })
      .then(comment => {
        if (!comment) {
          return res.status(404).send({
            msg: 'Could not find comment with id: ' + req.params.id
          });
        }
        return res.send(comment);
      }).catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  }


}
module.exports = CommentController
