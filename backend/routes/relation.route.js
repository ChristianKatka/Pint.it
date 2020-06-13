const Relation = require('../controllers/relation.controller');
const ValidateToken = require('../auth/validatetoken');

module.exports = app => {

  // How many people follows a specific user
  app.get('/relation/followers/:id', ValidateToken, Relation.getAmountFollowers);

  // How many people does a specific user follow
  app.get('/relation/followed/:id', ValidateToken, Relation.getAmountFollowed);
  
  // Check if you are following some specific user
  app.get('/relation/checkfollowing/:id/:follows', ValidateToken, Relation.checkFollower);

  // Follow / Unfollow user
  app.post('/relation/togglefollower', ValidateToken, Relation.toggleFollower);

}
