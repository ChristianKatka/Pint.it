const jwt = require('jsonwebtoken');

/**
 * CREATES TOKEN
 * 
 * Function which'll create an unique token to user. User's information
 * (id and username) will be used along with secret key to create one.
 * 
 * Token will expire after 3 months.
 * 
 * @param {object} user Contains all information about fetched user.
 *  
 */
function createToken(user) {

  const payload = {
    id: user.id,
    username: user.username
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: 7776000
  });
  return token;
}

module.exports = createToken;