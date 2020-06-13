const Drink = require('../controllers/drink.controller');
const ValidateToken = require('../auth/validatetoken');

module.exports = app => {

  // Gets the name of the drink and type according to search-word the user is writing
  app.get('/drink/searchdrinks/:name', ValidateToken, Drink.searchDrinks);

}