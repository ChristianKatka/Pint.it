const User = require('../controllers/user.controller');
const ValidateToken = require('../auth/validatetoken');


module.exports = app => {

    // Get user information via username to profile-page
    app.get('/user/:username', ValidateToken, User.getUser);

    app.get('/user/searchusers/:name', ValidateToken, User.findUsers);

    // Check whether chosen username is taken
    app.get('/user/checkusername/:username', User.checkUsername);

    // Updates user's profile-image
    app.put('/user/updateimage/', ValidateToken, User.updateProfileImage);

    // Updates user's bio
    app.put('/user/updatebio/', ValidateToken, User.updateBio);

}