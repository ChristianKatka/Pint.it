const Op = require('sequelize').Op;

const Models = require('../seq/models/index');

const RelationController = {


  /**
   * SEE IF YOU ARE FOLLOWING THIS USER
   * 
   * Checks if logged in user is following that person when entering in their profile
   * If logged in user is following that person who's profile they entered this query returns
   * true and if not it returns false. And according to this information we can change the button in frontend
   * 
   * @param {number} user_id Logged in user
   * @param {number} follows User that the logged in user ether follows or doesn't follow
   * 
   */
  checkFollower: (req, res) => {
    Models.Relation.findOne({
      where: { user_id: req.params.id, follows: req.params.follows }
    }).then(follow => {
      if (!follow) {
        return res.send({ follows: false });
      }
      return res.send({ follows: true });
    }).catch(err => {
      console.error(err);
      return res.status(500).send({
        message: 'Error retrieving userid ' + req.params.id
      })
    });
  },


  /**
   * FOLLOW OR UNFOLLOW ONE PERSON
   * 
   * This function creates relation between users (follows)
   * or destroys relation (unfollows).
   * In frontend theres toggle button in profile page what can be pressed to 
   * follow / unfollow.
   * 
   * @param {number} req.body.user_id User who is logged in
   * @param {number} req.body.follows Who user follows
   * 
   */
  toggleFollower: (req, res) => {
    Models.Relation.findOne({
      where: { 
        user_id: req.body.id, 
        follows: req.body.follows 
      }
    }).then(toggle => {
      // User did not follow another user
      if (!toggle) {
        Models.Relation.create({
          user_id: req.body.id,
          follows: req.body.follows
        }).then(() => res.send({ msg: 'Relation created', toggle }));
      }
      // User did follow another user
      else {
        Models.Relation.destroy({
          where: {
            user_id: req.body.id,
            follows: req.body.follows
          }
        }).then(() => res.send( { msg: 'Relation deleted' ,toggle }));
      }
    }).catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  },


  /** 
   * HOW MANY PEOPLE FOLLOWS A SPECIFIC USER
   * 
   * Find out the amount of followers a user has.
   * If the user has any followers, it will return their amount.
   * 
   * @param {number} reg.params.id The id of the user whose followers 
   * will be searched.
   * 
   */
  getAmountFollowers: (req, res) => {
    Models.Relation.count({
      where: { user_id: req.params.id }
    }).then(user => {
      if (!user) {
        return res.status(404).send({
          message: 'User not found with id: ' + req.params.id
        });
        // Need to be sent as JSON
      } res.send({ count: user });
    }).catch(err => {
      console.error(err);
      return res.status(500).send({
        message: 'Error retrieving user ' + req.params.id
      })
    });
  },


  /** 
   * HOW MANY PEOPLE A USER IS FOLLOWING
   * 
   * Find out the amount of people a specific user is following.
   * If the user is following one or more users, it will return their amount.
   * 
   * @param {number} reg.params.id The id of the user whose followers
   * will be searched.
   * 
   */
  getAmountFollowed: (req, res) => {
    Models.Relation.count({
      where: { follows: req.params.id }
    }).then(user => {
      if (!user) {
        return res.status(404).send({
          message: 'User not found with id: ' + req.params.id
        });
        // Need to be sent as JSON
      } res.send({ count: user });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({
        message: 'Error retrieving user ' + req.params.id
      })
    });
  }

}

module.exports = RelationController;