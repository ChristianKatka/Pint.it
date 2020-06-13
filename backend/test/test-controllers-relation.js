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


describe("test-controllers-relation.js | getAmountFollowers()", () => {

    it("Return amount of followers", () => {
        let userid = 1;

        return chai.request(app)
            .get('/relation/followers/' + userid)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(res => {
                expect(res.body.count, "should return number").to.be.greaterThan(-1);
                expect(res.statusCode, "status should be 200").to.be.equal(200);
            })
            .catch(err => {
                throw err;
            });
    });
    it("Should return undefined", () => {
        let userid = 0;

        return chai.request(app)
            .get('/relation/followers/' + userid)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(res => {
                expect(res.body.count, "should return undefined").to.be.undefined;
                expect(res.statusCode, "status should be 404").to.be.equal(404);
            })
            .catch(err => {
                throw err;
            });
    });
});

describe("test-controllers-relation.js | getAmountFollowed()", () => {

    it("Return amount of followed", () => {
        let userid = 1;

        return chai.request(app)
            .get('/relation/followed/' + userid)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(res => {
                expect(res.body.count, "should return number").to.be.greaterThan(-1);
                expect(res.statusCode, "status should be 200").to.be.equal(200);
            })
            .catch(err => {
                throw err;
            });
    });
    it("Should return undefined", () => {
        let userid = 0;

        return chai.request(app)
            .get('/relation/followed/' + userid)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(res => {
                expect(res.body.count, "should return undefined").to.be.undefined;
                expect(res.statusCode, "status should be 404").to.be.equal(404);
            })
            .catch(err => {
                throw err;
            });
    });
});

describe('test-controllers-relation.js | checkFollower()', () => {

    it('Checks if the specified user is following the given user', () => {
        let userid = 1;
        let followId = 2;

        return chai.request(app)
            .get('/relation/checkfollowing/' + userid + '/' + followId)
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .then(res => {
                expect(res.body.follows, "should return boolean true").to.be.true;
                expect(res.statusCode, "status should be 200").to.be.equal(200);
            })
            .catch(err => {
                throw err;
            });
    });

    it('Follows or unfollows an user', () => {
        let userId = 12;
        let follows = 1;

        return chai.request(app)
            .post('/relation/togglefollower/')
            .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
            .send({
                'id': userId,
                'follows': follows
            })
            .then(res => {
                if (res.body.msg === 'relation created') {
                    return chai.request(app)
                        .get('/relation/checkfollowing/' + userId + '/' + follows)
                        .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
                        .then(res => {
                            expect(res.body.follows, "should return boolean true").to.be.true;
                            expect(res.statusCode, "status should be 200").to.be.equal(200);
                        })
                        .catch(err => {
                            throw err;
                        });
                } else {
                    expect(res.body.msg).to.be.equal('relation deleted');
                }
            })
            .catch(err => {
                throw err;
            });
    })
});
