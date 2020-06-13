
const Models = require('../seq/models/index');
const crypto = require('crypto');
const base64Img = require('base64-img');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const PostController = {


  /**
   * FINDS ALL POSTS (LIMITING 5 AT A TIME)
   * 
   * Function which'll find all posts (without filtering). It'll find 5 posts
   * at a time. Parameter defines where the starting point is.
   * 
   * @param {number} req.params.position Amount of posts already been fetched
   * @param {string} req.params.order In which order posts fill be fetched (createdAt/value)
   * 
   */
  findPostsByAll: (req, res) => {
    Models.Post.findAll({
      offset: Number(req.params.position),
      limit: 5,
      order: [[req.params.order, 'DESC']],
      include: [{
        attributes: ['img'],
        model: Models.User,
        required: true
      }]
    }).then(posts => {
      return res.send(posts);
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  },



  /**
   * FIND USERS POSTS IN WHICH USER HAS SUBSCRIBED TO
   * 
   * Function which'll find posts from users in which user has been subscribed to.
   * Database-query will do 2 INNER JOINS to check follows-column from Relations-table.
   * It'll find 5 posts at a time. Parameter defines where the starting point is.
   * 
   * @param {number} req.params.userId User who is doing the request
   * @param {number} req.params.position Amount of posts already been fetched
   * @param {string} req.params.order In which order posts fill be fetched (createdAt/value)
   *
   */
  findPostsByFollowed: (req, res) => {
    Models.Post.findAll({
      offset: Number(req.params.position),
      subQuery: false,
      limit: 5,
      order: [[req.params.order, 'DESC']],
      where: { '$User->followed.user_id$': req.params.userId },
      include: [{
        attributes: ['img'],
        model: Models.User,
        required: true,
        include: [{
          attributes: [],
          model: Models.Relation,
          as: 'followed',
          required: true,
        }]
      }]
    }).then(posts => {
      return res.send(posts);
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
  },


  /**
   * FIND OUT HOW MANY POSTS HAVE SPECIFIC USER MADE
   * 
   * Function which counts how many posts a specific user has made. If there's 
   * none, 404-status will be sent and user will see zero as a number instead. 
   * 
   * @param {string} req.params.username User who is doing the request
   *
   */
  findUserPostAmount: (req, res) => {
    Models.Post.count({
      where: { username: req.params.username }
    }).then(posts => {
      if (!posts) {
        return res.status(404).send({ 
          msg: 'No posts were found',
          count: 0
        });
      }
      return res.send({ count: posts });
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });

  },


  /**
   * FINDS FIVE POSTS AT A TIME A SINGLE USER HAS MADE
   * 
   * Function that will search for posts a certain user has made.
   * The function will also note if this query has been executed before and will look 
   * for additional posts accordingly if executed again.
   * 
   * @param {number} req.params.username User who is doing the request
   * @param {number} req.params.position Amount of posts that have already been fetched
   * @param {string} req.params.order In which order posts fill be fetched (createdAt/value)'
   *
   */
  findUserPosts: (req, res) => {
    console.log(req.params.order);
    Models.Post.findAll({
      offset: Number(req.params.position),
      limit: 5,
      order: [[req.params.order, 'DESC']],
      where: { username: req.params.username },
      include: [{
        attributes: ['img'],
        model: Models.User,
        required: true,
      }]
    }).then(posts => {
      return res.send(posts);
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  },

  
  /**
   * CREATES A NEW POST 
   * 
   * Function which'll create a new post according to given values. It'll first insert
   * all values from HTTP-body to a new post (only text and username being necessary). 
   * If there's image coming within the body it'll be given a random name. 
   * 
   * After the post has been successfully created the function will check whether there 
   * were image or not. In case there were, the coming Base64String-image will be converted 
   * to an actual image and then'll be placed inside public folder in backend. 
   * 
   * @param req.body.post Contains all the relevant information about a new post
   * @param req.body.image Contains image in Base64String-mode (optional)
   * 
   */
  createPost: (req, res) => {

    Models.Post.create({
      username: req.params.username,
      text: req.body.post.text,
      drink_name: req.body.post.drink_name,
      drink_type: req.body.post.drink_type,
      rating: req.body.post.rating,
      // If image comes with the post, place it in database, otherwise leave it empty
      img: req.body.image ? crypto.pseudoRandomBytes(8).toString('hex') : ''
    })
      .then(post => {
        if (req.body.image) {
          // Convert image from base64string format to a normal image
          filepath = base64Img.imgSync(`data:image/jpg;base64,
            ${req.body.image}`, '', post.img);
          // Pick the image and push it to Cloudinary (image-hosting service)
          cloudinary.v2.uploader.upload(filepath,
            { public_id: post.img }, (error, result) => {
              if (error) {
                console.error(error);
                return res.status(500).send(error);
              }
              console.log(result);
          });
        }
        return res.send(post);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send({
          message: 'Error retrieving ' + err
        });
      });
  },

  
  /**
   * FINDS POST BY ID
   * 
   * Function which'll try to find 1 post by it's primary key (ID).
   * If one is found, that post will be returned.
   * 
   * @param {number} req.params.id ID of the post we're searching
   *  
   */
  getPostById: (req, res) => {
    Models.Post.findOne({
      where: { id: req.params.id },
      include: [{
        attributes: ['img'],
        model: Models.User,
        required: true
      }]
    })
      .then(post => {
        if (!post) {
          return res.status(404).send({
            msg: 'Could not find post with id: ' + req.params.id
          });
        }
        return res.send(post);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).send(err);
      });
  },


  /**
   * CHANGES POST'S HIDDEN VALUE
   * 
   * Function which'll either decrease or increase one post's hidden value. 
   * This value will be brought through HTTP's body. Firstly we'll search one
   * specific post by it's ID. If one is found it's initial hidden value -attribute
   * will be updated. 
   * 
   * @param {number} req.body.id ID of the post which'll be updated
   * @param {number} req.body.amount How much the post's value will be decreased
   * or increased
   * 
   */
  changePostValue: (req, res) => {
    Models.Post.findOne({
      where: { id: req.body.id },
      attributes: ['id', 'value']
    }).then(post => {
      if (!post) {
        return res.status(404).send({
          msg: 'Could not find post with ID ' + req.body.id
        });
      }
      post.update({
        value: post.value + req.body.amount
      }).then(value => {
        if (!value) {
          return res.status(404).send({
            msg: 'Could not update post\'s value with ID ' + req.body.id
          });
        }
        return res.send({ updated: true });
      })
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  }

}



module.exports = PostController;