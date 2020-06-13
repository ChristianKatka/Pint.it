/**
 * GET TOKEN BEFORE USING TESTS
 * 
 * You need to get token using Postman, and save it here as globally.
 * 
 * ROUTE: http://localhost:3000/auth/login/
 * 
 * 
  {
	  "username": "mocha-test",
	  "password": "AGJKPafijoaetgaA12fadbDFHEWeqoitrbmncuhi"
  }
 * 
 * */

const testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsInVzZXJuYW1lIjoibW9jaGEtdGVzdCIsImlhdCI6MTU1NTQ4NjcxNSwiZXhwIjoxNTYzMjYyNzE1fQ.F3UFK2Di4b0fFdonG2XXBtOoxQhGFhi1ZmNcOSVpSRQ';
const testUserName = 'mocha-test';
const testUserId = 33;
module.exports = { testUserToken, testUserName, testUserId};
