
// Google's library to validate user token-id
const { OAuth2Client } = require('google-auth-library');
// Developer's client id
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);


/**
 * VALIDATE GOOGLE'S TOKEN
 * 
 * Function which uses OAuth2Client -library to validate token received 
 * from Google's social login. Only social user's ID will be returned to
 * the caller.
 * 
 * @param {string} token ID-token which can be used to validate user and 
 * get social information about the user 
 * 
 */
async function validateGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return userid;
}

module.exports = validateGoogleToken;