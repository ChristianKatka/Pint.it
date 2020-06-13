const jwt = require('jsonwebtoken');


/**
 * VALIDATES TOKENS FROM HTTP-QUERIES
 * 
 * Function which validates the tokens received from http-queries. 
 * The tokens`s payloads are decrypted within the function in order to 
 * check whether or not the user is authorized.
 *
 * @param {string} req.headers.token Access-token from frontend
 * @param {string} req.headers.id User's ID
 * @param {string} req.headers.username User's username
 * 
 */
function ValidateToken(req, res, next) {

  const token = req.headers.token;

  // If token is empty
  if (!token) {
    return res.status(401).send({
      msg: 'User is not authorized'
    });
  }
  // Verifying the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    const id = decoded.id;
    const username = decoded.username;

    if (err) {
      console.log(err);
      return res.status(401).send(err);
    }
    if (id !== Number(req.headers.id) || username !== req.headers.username) {
      return res.status(401).send({
        msg: 'User is not authorized'
      });
    }
    next();
  });

}

module.exports = ValidateToken;