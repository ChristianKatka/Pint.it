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
let globalFakeUserId = 0;
let globalFakePostId = 0;
let globalFakeUsername = 'AA'
let globalPostId = 1;
let globalPostPosition = 0;
let globalUserId = 1;
let globalUsername = 'OlutPoika25';
let globalCommentId = 1;
let globalFakeCommentId = 0;

/** NEEDS TO BE TESTED
 * 
 * Gets an amount of comments commented on a post
 * app.get('/comment/commentamount/:posts', Comment.getCommentAmount);
 * 
 * Gets 2 latest comments for each post in frontpage
 * app.get('/comment/commentsfrontpage/:postId', Comment.getCommentsForFrontpage);
 * 
 * Gets newest comments when searched with a certain post ID
 * app.get('/comment/latestcomments/:postId/:position', Comment.getLatestComments);
 * 
 */

describe('test-controllers-comment.js | getLatestComments() : Gets comments for a certain post and sorts them by date', () => {

	const test_getLatestCommentsPostId = 2;
	const test_getLatestCommentsPosition = 0;
	let test_getLatestCommentsQuery;

	it('Gets the most liked comments', () => {
		return chai.request(app)
			.get('/comment/latestcomments/' + test_getLatestCommentsPostId + '/' + test_getLatestCommentsPosition)
			.set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
			.then(function (res) {
				console.log(res.body);
			}).catch(function (err) {
				throw err;
			});
	});

});

describe('test-controllers-comment.js | getMostLikedComments() : Gets the most liked comments for a certain post', () => {

	const test_getMostLikedCommentsPostId = 2;
	const test_getMostLikedCommentsPosition = 0;
	let test_getMostLikedCommentsQuery;

	it('Gets the most liked comments', () => {
		return chai.request(app)
			.get('/comment/mostlikedcomments/' + test_getMostLikedCommentsPostId + '/' + test_getMostLikedCommentsPosition)
			.set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
			.then(function (res) {
				const comments = res.body;
				const commentIds = res.body.map(comment => comment.id);

				return chai.request(app)
					.get('/like/commentlikes/' + commentIds.join('-'))
					.then(function (res) {
						res.body.forEach(commentLikes => {
							comments.forEach(comment => {
								if (comment.id === commentLikes.comment_id) {
									comment.likeAmount = commentLikes.count;
								}
								
							})
						})
						comments.forEach(comment => {
							if(!comment.likeAmount) comment.likeAmount = 0;
						})
						return test_getMostLikedCommentsQuery = comments;
					}).catch(function (err) {
						throw err;
					});

			}).catch(function (err) {
				throw err;
			});
	});
	it('Comments are ordered buy likes', () => {
		let bool;
		for (let index = 0; index < test_getMostLikedCommentsQuery.length - 1; index++) {
			if(test_getMostLikedCommentsQuery[index].likeAmount >= test_getMostLikedCommentsQuery[index + 1].likeAmount){
				bool = true;
			}
			else { bool = false; break; }
		}
	});

});

describe('test-controllers-comment.js | createComment() : Create a new comment', () => {

	const test_createCommentText = 'Testaaminen on upeaa';
	const test_createCommentPostId = 3;
	const test_createCommentUsername = 'OlutPoika25';
	let test_creteCommentQueryResult;

	it('Create a comment and get ID of the created comment', () => {
		return chai.request(app)
			.post('/comment/createcomment/')
			.set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
			.send({
				'text': test_createCommentText,
				'post_id': test_createCommentPostId,
				'username': test_createCommentUsername
			})
			.then(function (res) {
				expect(res.statusCode).to.be.equal(200);
				assert.isDefined(res.body.id, 'should return comment ID');
				return test_creteCommentQueryResult = res.body;
			}).catch(function (err) {
				throw err;
			});
	});
	it('Test that comment exists with getCommentById', () => {
		return chai.request(app)
			.get('/comment/commentbyid/' + test_creteCommentQueryResult.id)
			.set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
			.then(function (res) {
				expect(res.body.id).to.be.equal(test_creteCommentQueryResult.id);
				expect(res.statusCode).to.be.equal(200);
			})
			.catch(function (err) {
				throw err;
			});
	});

});

describe('test-controllers-comment.js | getCommentById() : Returns comment by id  ', () => {

	function analyser(callback) {
		return chai.request(app)
			.get('/comment/commentbyid/' + globalCommentId)
			.set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
			.then(function (res) {
				callback(res, null)
			})
			.catch(function (err) {
				callback(null, err)
			});
	}

	it('Returns object', () => {
		return analyser((res, err) => {
			if (err) throw err;
			else {
				expect(res.body.text.length).to.be.greaterThan(0);
			}
		})
	});
	it("Object's id is same with parameter id", () => {
		return analyser((res, err) => {
			if (err) throw err;
			else {
				expect(res.body.id).to.be.equal(globalCommentId);
			}
		})
	});
	it("Returns status 200", () => {
		return analyser((res, err) => {
			if (err) throw err;
			else {
				expect(res.statusCode).to.be.equal(200);
			}
		})
	});
});

describe('test-controllers-comment.js | getCommentById() : Returns 404 with fake id  ', () => {

	function analyser(callback) {
		return chai.request(app)
			.get('/comment/commentbyid/' + globalFakeCommentId)
			.set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
			.then(function (res) {
				callback(res, null)
			})
			.catch(function (err) {
				callback(null, err)
			});
	}

	it("Doesn't return object", () => {
		return analyser((res, err) => {
			if (err) throw err;
			else {
				expect(res.body.text).to.be.undefined;
			}
		})
	});
	it("Returns error message & status 404", () => {
		return analyser((res, err) => {
			if (err) throw err;
			else {
				expect(res.body.msg).to.exist;
				expect(res.statusCode).to.be.equal(404);
			}
		})
	});
});
