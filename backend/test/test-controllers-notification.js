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

describe.skip('test-controllers-notification.js | deleteNotification() : Deletes a notification according to the specified ID', () => {

    const test_deleteNotificationId = '1';
    const test_deleteNotificationPeerUsername = 'HyvinHYVINPitkaPoikaHyvinPitka';
    const test_deleteNotificationType = '10';
    let test_deleteNotificationResult;

    it('Deletes a notification by user ID: ' + test_deleteNotificationId, () => {
        return chai.request(app)
            .delete('/notification/deletenotification/' + test_deleteNotificationId + '/' + test_deleteNotificationPeerUsername + '/' + test_deleteNotificationType)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                return test_deleteNotificationResult = res;
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Should return a true boolean value if the deletion is succesful.', () => {
        expect(test_deleteNotificationResult.body.success).to.be.true;
        expect(test_deleteNotificationResult.statusCode).to.be.equal(200);
    });
    it('Should return false when given parameters are incorrect / nonexistent in the database', () => {
        return chai.request(app)
            .delete('/notification/deletenotification/0/0/0')
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.statusCode).to.be.equal(404);
                expect(res.body.success).to.be.false;
            }).catch(function (err) {
                throw err;
            });
    });
})