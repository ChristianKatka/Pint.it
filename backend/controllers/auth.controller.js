const createToken = require('../auth/createtoken');
const bcrypt = require('bcryptjs');
const Models = require('../seq/models/index');

const validateGoogleLogin = require('../auth/validate-google-token');
const validateFbLogin = require('../auth/validate-fb-token');

// Temporary place for social ID from Google and Facebook
let socialID = '';

const AuthController = {


  /**
   * REGISTERS AN USER INTO DATABASE
   * 
   * Function which`ll will register an user. User can input username and password,
   * or they can use social login. If a password is given, it will be crypted.
   * 
   * @param req.body.username Username of the new user
   * @param req.body.password (optional) Password of the user
   * @param req.body.socialId (optional) SocialID of the user (through social login)
   * 
   */
  register: (req, res) => {
    // If password is given, hash it
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 8);
    }
    Models.User.create({
      username: req.body.username,
      password: req.body.password, 
      social_id: req.body.socialId
    }, { exclude: { attributes: 'password'} })
    .then(user => {
      if (!user) {
        return res.status(400).send({ error: 'Rekisteröinti epäonnistui' });
      }  
      return res.send({ user: user, token: createToken(user) });
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
      }); 
  },
  
  
  /**
   * LOGIN AN EXISTING USER
   * 
   * Function which'll first look for existing user from database
   * by username. If one is found, passwords from request and database
   * will be compared. If there's a match, user-information and token
   * will be returned back.
   * 
   * @param {string} req.body.username Username of the user
   * @param {string} req.body.password Password of the user
   * 
   */
  login: (req, res) => {
    Models.User.findOne({
      where: { username: req.body.username },
      exclude: { attributes: 'password'}
    }).then(user => {
      // If no user were found
      if (!user) {
        return res.status(404).send({ error: 'Käyttäjää ei löytynyt' })
      }
      // If given password and database's password arent same
      if (!bcrypt.compareSync(req.body.password, user.password ? user.password : '')) {
        return res.status(403).send({ error: 'Väärä salasana' })
      }
      return res.send({ token: createToken(user), user: user })
    }).catch(err => {
      console.error(err);
      return res.status(500).send({ error: err })
    });
  },


  /**
   * VALIDATES TOKEN GOTTEN FROM GOOGLE'S SOCIAL LOGIN
   * 
   * Function which'll first validate access-token gotten from request via external
   * function (validateGoogleLogin). If access-token is valid, unique ID-token should be
   * returned. This ID-token will be temporarily placed inside global variable.
   * 
   * Lastly function will call next function. 
   * 
   * @param {string} req.body.idToken Token gotten from Google's social-login
   * 
   */
  googleLogin: (req, res, next) => {
    // Validate Google's ID token
    validateGoogleLogin(req.body.idToken).then(id => {
      console.log('Google\'s USER id: ' + id);
      socialID = id;
      next();
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  },


  /**
   * VALIDATES ACCESS-TOKEN GOTTEN FROM FACEBOOK'S SOCIAL LOGIN
   * 
   * Function which will call Facebook's token validation-function. If 
   * validation is successful, received ID will be temporarily placed 
   * inside global variable. This ID will be used in next() -function.
   * 
   * @param {string} req.body.accessToken Token gotten from Facebook's social-login
   * 
   */
  fbLogin: (req, res, next) => {
    validateFbLogin(req.body.accessToken, (creds, err) => {
      if (err) {
        console.error(err);
        return res.status(403).send(err);
      }
      socialID = creds.id;
      next();
    })
  },


  /**
   * SEARCHES FOR EXISTING SOCIAL-USER FROM DATABASE
   * 
   * After every successful social-login, this function will be
   * called to check whether social-registration has already been made.
   * 
   * If user is found from database by social-id, user information and
   * token will be returned. If the social-user is new, only social-id
   * will be returned for social-registration -process.
   * 
   */
  searchSocialUser: (req, res) => {
    Models.User.findOne({
      attributes: {
        include:  ['id', 'username', 'img'], 
        exclude: ['password']
      },
      where: { 'social_id': socialID },
    }).then(user => {
      // If no user were found
      if (!user) {
        return res.send({ redirect: false, socialId: socialID });
      }
      return res.send({ redirect: true, user: user, token: createToken(user) });
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    })
  },


  /**
   * CHANGES THE USER'S PASSWORD
   * 
   * Finds the user by ID and checks if the old password is correct.
   * If correct(returns:true), gets the new password and hashes it
   * then it will update the hashed password for the user
   * 
   * 
   * @param {number} req.params.id ID of the user
   * @param {string} req.body.oldPwd User`s old password
   * @param {string} req.body.newPwd User`s new password
   * 
   */
  changePassword: (req,res) => {
    Models.User.findOne({
      where: { id: req.params.id } 
    }).then(user => {
      // If no user were found
      if (!user) {
        return res.status(404).send({ error: 'Käyttäjää ei löytynyt' })
      }
      // If user is registered/logged in via social platform
      if (!user.password) {
        return res.status(409).send({ redirect: false })
      }
      // If given password and database's password aren't same
      if (!bcrypt.compareSync(req.body.oldPwd, user.password)) {
        return res.status(403).send({ redirect: false });
      }
      req.body.newPwd = bcrypt.hashSync(req.body.newPwd, 8);
      Models.User.update(
        { password: req.body.newPwd },
        { where: { id: req.params.id }}
      ).then(() => {
        return res.send({ success: true });
    });
  }).catch(err => {
    console.error(err);
    return res.status(500).send(err);
  });
  }

}

module.exports = AuthController
