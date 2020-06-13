const rp = require('request-promise');

/**
 * Function which'll do a request to Facebook's GRAPH API to search the user
 * by access-token gotten from social-login. We only need ID from request.
 * If request is successful, function will call callback-function
 * which returns token.
 * 
 * @param {string} token Access-token gotten from frontend
 * @param {function} cb Callback-function which'll be called after the request
 *  
 */
function validateFbToken(token, cb) {
  // Do a GET-request to Facebook's GRAPH API
  rp(`https://graph.facebook.com/me?fields=id,email&access_token=${token}`, {
    json: true
  })
    .then(creds => {
      // User ID successfully fetched
      return cb(creds, null);
    })
    .catch(err => {
      // Error while fetching user ID
      console.log(err);
      return cb(null, err);
    });
}

module.exports = validateFbToken;
