
const Models = require('../seq/models/index');
const Op = require('sequelize').Op;
const base64Img = require('base64-img');
const crypto = require('crypto');
const cloudinary = require('cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const UserController = {

  
  /**
   * CONVERT USERNAME TO USER'S ID
   * 
   * Bring username in body or with parameters. That user's ID will be 
   * stored in local variable. This variable is only alive while 
   * HTTP-call is active.
   * 
   * You don't call this function by itself.
   * 
   * @param {string} req.username Username which'll be converted
   * 
   */
  getIdByUsername: (req, res, next) => {
    const username = req.body.username ? req.body.username : req.params.username;
    Models.User.findOne({
      where: { username: username },
      attributes: ['id']
    }).then(user => {
      res.locals.id = user.id;
      next();
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send({
        message: 'Error retrieving user: ' + req.params.username
      })
    })
  },


  /** 
   * GET USER INFORMATION EXCLUDING PASSWORD
   * 
   * Find user information from database by username.
   * If it finds one, it will return all information (excluding password).
   * 
   * @param {string} req.params.username Contains the name the user of 
   * the user which will be searched.
   * 
   */
  getUser: (req, res) => {
    Models.User.findOne({
      where: { username: req.params.username },
      attributes: { exclude: ['password'] }
    })
      .then(user => {
        if (!user) {
          return res.status(404).send({
            message: 'User not found: ' + req.params.username
          });
        } return res.send(user);
      }).catch(err => {
        console.log(err);
        return res.status(500).send({
          message: 'Error retrieving user: ' + req.params.username
        });
      });
  },


  /**
   * FIND USERS BY SEARCH-WORD (USERNAME)
   * 
   * Function which'll find users by search-word. This search-word will be 
   * used to search users by their usernames. If any users are found with 
   * the search-word, those user's usernames and image-names will be returned
   * back to user. 
   * 
   * @param {string} req.params.name Search-word we'll use to search users
   * 
   */
  findUsers: (req, res) => {
    Models.User.findAll({
      where: { username: {
        [Op.like]: `%${req.params.name}%` },
      },
      attributes: ['username', 'img'],
      limit: 20
    }).then(users => {
      if (users.length < 1) {
        return res.status(404).send({
          msg: 'Käyttäjiä ei löytynyt'
        });
      }
      return res.send(users);
    }).catch(err => {
      return res.status(500).send(err);
    });
  },


  /**
   * CHECKS IF USERNAME HAS ALREADY BEEN TAKEN
   * 
   * Function which checks whether one username is already been taken 
   * by another user. Boolean value will be returned telling if it's being
   * taken.
   * 
   * (This function is usually called from register-function.)
   * 
   * @param {string} req.params.username Username which'll be checked
   * 
   */
  checkUsername: (req, res) => {
    Models.User.findOne({
      where: { username: req.params.username }
    })
      .then(user => {
        if (!user) return res.send({ taken: false });
        return res.send({ taken: true });
      }).catch(err => {
        return res.status(500).send(err)
      });
  },


  /**
   * UPDATES USER'S PROFILE-IMAGE
   * 
   * Function which'll update user's profile-image. Firstly it'll make a new, 
   * randomly generated word which'll be given as a name to that new image.
   * 
   * User's previous image will be checked if there's one (through database string "img"). 
   * If it's has one, it'll be deleted from a static "public" -folder. User will be then
   * updated with the new name. After the name-updation is succesfull, the base64string 
   * based image will be converted to an actual image and will be placed inside public 
   * folder. 
   * 
   * New image's name will be returned so frontend can use it.
   * 
   * @param {number} req.body.id ID of the user whose profile-image will be updated
   * @param {string} req.body.base64image New profile-image in base64string -format 
   * 
   */
  updateProfileImage: (req, res) => {
    
    const imgHex = crypto.pseudoRandomBytes(8).toString('hex');

    // Finds one user by ID
    Models.User.findOne({
      where: { id: req.body.id },
      attributes: ['img']
    }).then(user => {
      if (user) {
        // If user already has a profile-image
        if (user.img) {
          cloudinary.v2.uploader.destroy(user.img, (error, result) => {
            if (error) {
              console.error(error);
              console.error('>> Could not delete user\'s old picture.' + (user.img));
            }
          });
        }

        // Update user with a new profile-image's name
        Models.User.update(
          { img: imgHex },
          { where: { id: req.body.id }}
        ).then(() => {
          filepath = base64Img.imgSync(`data:image/jpg;base64,${req.body.base64image}`,
            '', imgHex);
          cloudinary.v2.uploader.upload(filepath,
            { public_id: imgHex }, (error, result) => {
              if (error) {
                console.error(error);
                return res.status(500).send(error);
              }
              console.log(result);
              return res.send({ img: imgHex });
          });
        });

      } else {
        return res.status(404).send({ message: 'Could not find user with ID: ' + req.body.id });
      }
    }).catch(err => {
      console.log(err);
      return res.status(500).send(err);
    })
  },


  /**
   * UPDATES USER'S BIO
   * 
   * Function which'll update user's bio. New bio will arrive inside body which will put inside 
   * user's old bio. If updation is successful, new bio and will be returned. Function also returns boolean, true, if update goes through.
   * 
   * @param {string} req.body.bio User's new bio 
   * @param {number} req.body.id ID of the user whose bio will be updated
   * 
   */
  updateBio: (req, res) => {
    Models.User.update(
      { bio: req.body.bio },
      { where: { id: req.body.id }}
    ).then( () => {
      return res.send({ bio: req.body.bio, updated: true });
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    })
  }

}

module.exports = UserController;