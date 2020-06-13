// User chai assertion library and make it use chai-http for requests
let chai = require('chai');
let assert = chai.assert;
let expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Url for backend
const app = 'http://localhost:3000'

// Get tester credentials
const globalCreds = require('./authenticate-tests');

describe('test-controllers-auth.js | changePassword() : Changes password for user', () => {

    const test_changePasswordUserID = 32;
    const test_changePasswordOldPassword = 'testi2';
    const test_changePasswordNewPassword = 'testi1';

    //Remember to find correct userID and find correct initial password
  
    it('Change password succesfully to userID: ' + test_changePasswordUserID, () => {
      return chai.request(app)
        .post('/auth/changepassword/' + test_changePasswordUserID)
        .send({
          'oldPwd': test_changePasswordOldPassword,
          'newPwd': test_changePasswordNewPassword
          })
        .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
        .then(function (res) {
            expect(res.body.success).to.be.true;
            expect(res.statusCode).to.be.equal(200);
        })
        .catch(function (err) {
          throw err;
        });
    });
    it('with wrong values, it shouldnt change the password', () => {
        return chai.request(app)
          .post('/auth/changepassword/2')
          .send({
            'oldPwd': 'oldPwd',
            'newPwd': 'uusisalasana'
            })
          .then(function (res) {
              expect(res.body.redirect).to.be.false;
              expect(res.statusCode).to.be.equal(401);
          })
          .catch(function (err) {
            throw err;
          });
      });
  });
  