'use strict';
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

// Test settings
let globalUsername = 'OlutPoika25';
let globalFakeUsername = 'AaAaAa';
let globalUserId = 1;
let globalFakeUserId = 0;

/**
 * Needs to be tested:
 * Route: app.put('/user/updateimage/', User.updateProfileImage);
*/


describe('test-controllers-user.js | getUser() : Should return username without password', () => {

    it('Returns Correct userdata', () => {
        return chai.request(app)
            .get('/user/' + globalUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.statusCode).to.be.equal(200);
                expect(res.body.username).to.be.equal(globalUsername);
            })
            .catch(function (err) {
                throw err;
            });
    });
    it("Doesn't return password", () => {
        return chai.request(app)
            .get('/user/' + globalUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.statusCode).to.be.equal(200);
                expect(res.body.password, "password should be undefined").to.be.undefined;
            })
            .catch(function (err) {
                throw err;
            });
    });
});

describe("test-controllers-user.js | getUser() : Shouldn't return data with fake name", () => {

    it("Doesn't return username", () => {
        return chai.request(app)
            .get('/user/' + globalFakeUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.body.username, "username should return undefined").to.be.undefined;
                expect(res.statusCode, "status should be 404").to.be.equal(404);
            })
            .catch(function (err) {
                throw err;
            });
    });
    it("Returns error message", () => {
        return chai.request(app)
            .get('/user/' + globalFakeUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.body.message, "error message missing").to.be.equal('User not found: ' + globalFakeUsername);
                expect(res.statusCode, "status should be 404").to.be.equal(404);
            })
            .catch(function (err) {
                throw err;
            });
    });
});

describe("test-controllers-user.js | checkUsername()", () => {

    it("Should return taken = TRUE", () => {
        return chai.request(app)
            .get('/user/checkusername/' + globalUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.body.taken, "should return true").to.be.true;
                expect(res.statusCode).to.be.equal(200);
            })
            .catch(function (err) {
                throw err;
            });
    });
    it("Should return taken = FALSE", () => {
        return chai.request(app)
            .get('/user/checkusername/' + globalFakeUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.body.taken, "should return false").to.be.false;
                expect(res.statusCode).to.be.equal(200);
            })
            .catch(function (err) {
                throw err;
            });;
    });
});

describe('test-controllers-user.js | updateBio() : Updates users bio', () => {

    let test_bioUpdateUserBio = 'Pilke silmäkulmassa pidentää ikääni vuosittain ainakin kahdella';
    const test_bioUpdateUsername = 'OlutPoika25';
    const test_bioUpdateUserId = 1;

    function analyser(callback) {
        return chai.request(app)
            .put('/user/updatebio/')
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .send({
                'bio': test_bioUpdateUserBio,
                'id': test_bioUpdateUserId
            })
            .then(function (res) {
                callback(res, null)
            })
            .catch(function (err) {
                callback(null, err)
            });
    }
    it('Bio updated to userID: ' + test_bioUpdateUserId, () => {
        return analyser((res, err) => {
            if (err) throw err;
            else {
                expect(res.body.updated).to.be.true;
            }
        })
    });
    it('Check if bio is updated ( using getUser() ) to userID: ' + test_bioUpdateUserId, () => {
        return chai.request(app)
            .get('/user/' + test_bioUpdateUsername)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(function (res) {
                expect(res.statusCode).to.be.equal(200);
                expect(res.body.username).to.be.equal(test_bioUpdateUsername);
                expect(res.body.bio).to.be.equal(test_bioUpdateUserBio);
            })
            .catch(function (err) {
                throw err;
            });
    });
});
