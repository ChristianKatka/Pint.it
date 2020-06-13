const Auth = require('../controllers/auth.controller');
const ValidateToken = require('../auth/validatetoken');


module.exports = app => {

  // Authenticates Google's token and searches user by id-token
  app.post('/auth/googlelogin/', Auth.googleLogin, Auth.searchSocialUser);

  // Authenticates Facebook's token and searches user by id-token
  app.post('/auth/fblogin/', Auth.fbLogin, Auth.searchSocialUser);

  // Normal login
  app.post('/auth/login/', Auth.login);

  // Registration of new user (normal & social)
  app.post('/auth/register/', Auth.register);

  // Changes the users password 
  app.post('/auth/changepassword/:id',ValidateToken, Auth.changePassword);

}