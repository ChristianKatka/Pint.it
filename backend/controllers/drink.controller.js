// Loads index.js which can be used to make queries to database
const Models = require('../seq/models/index');
// SQL operators (IN, LIKE, OR, BETWEEN ETC.)
const Op = require('sequelize').Op;

const DrinkController = {


  /**
   * GETS DRINK NAMES AND TYPES WHEN SEARCHED BY STRING
   * 
   * Function which`ll search for drink names according to string
   * the user is inserting into the text field. If any is found 
   * it returns the drink name and type.
   * 
   * @param {string} req.params.name Contains the drink the user
   * is searching for
   * 
   */
    searchDrinks: (req, res) => {
      Models.Drink.findAll({
        where: { name: {
          [Op.like]: `%${req.params.name.split('-').join(' ')}%`
        }},
        limit: 15
      }).then(drinks => {
        if (drinks.length < 1) {
          return res.status(404).send({ message: 'Oluita ei löytynyt' });
        } 
        return res.send(drinks);
      }).catch(err => {
        return res.status(500).send(err); 
      });
    }
}

module.exports = DrinkController;