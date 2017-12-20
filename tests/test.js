// Richard Wen
// rrwen.dev@gmail.com


require('dotenv').config();

// (packages) Package dependencies
var express = require('express');
var fs = require('fs');
var moment = require('moment');
var api = require('../index.js');
var request = require('supertest');
var test = require('tape');

const Client = require('mongodb').MongoClient;

// (test_info) Get package metadata
var json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var testedPackages = [];
for (var k in json.dependencies) {
	testedPackages.push(k + ' (' + json.dependencies[k] + ')');
}
var devPackages = [];
for (var k in json.devDependencies) {
	devPackages.push(k + ' (' + json.devDependencies[k] + ')');
}

// (test_log) Pipe tests to file and output
if (!fs.existsSync('./tests/log')){
	fs.mkdirSync('./tests/log');
}
var testFile = './tests/log/test_' + json.version.split('.').join('_') + '.txt';
test.createStream().pipe(fs.createWriteStream(testFile));
test.createStream().pipe(process.stdout);

// (test) Run tests
test('Tests for ' + json.name + ' (' + json.version + ')', t => {
	t.comment('Node.js (' + process.version + ')');
	t.comment('Description: ' + json.description);
	t.comment('Date: ' + moment().format('YYYY-MM-DD hh:mm:ss'));
	t.comment('Dependencies: ' + testedPackages.join(', '));
	t.comment('Developer: ' + devPackages.join(', '));
	process.env.MONGODB_DATABASE = process.env.MONGODB_TESTDATABASE;
	
	// (test_db) Create database
	Client.connect(process.env.MONGODB_CONNECTION, function(err, client) {
		var db = client.db(process.env.MONGODB_DATABASE);
		var collection = db.collection(process.env.MONGODB_COLLECTION);
		
		// (test_db_fail) Error for database connect
		if (err) {
			t.fail('(MAIN) MongoDB connect: ' + err.message);
			process.exit(1);
		}
		
		// (test_db_pass) Database created
		t.pass('(MAIN) MongoDB connect');
		
		// (test_insert) Create collection data
		collection.insertMany([{a:1}, {b:2}, {c:3}])
			.then(() => {
				
				// (test_insert_pass) Inserted data
				t.pass('(MAIN) insertMany');
				
				// (test_app) Create app
				var app = express();
				app.use('/api', api());
				
				// (test_200) Test for success status 200
				request(app).get('/api')
					.expect(200, err => {
						t.comment('(A) tests on /api status code');
						
						// (test_200_fail) Fail request 200
						if (err) {
							t.fail('(A) 200 success status code: ' + err.message);
							process.exit(1);
						};
						
						// (test_200_pass) Pass request 200
						t.pass('(A) 200 success status code');
					})
				
				// (test_response) Test for find response
				request(app).get('/api')
					.expect(200, (err, response) => { // (test_response) Test for find response
						t.comment('(B) tests on /api response');
						
						// (test_response_fail) Fail find response
						if (err) {
							t.fail('(B) MongoDB 200 response status: ' + err.message)
							process.exit(1);
						};
						
						// (test_response_pass) Pass find response
						t.pass('(B) MongoDB 200 response status');
						
						// (test_find) Test find query
						collection.find({}).toArray()
							.then(docs => {
								
								// (test_find_pass) Pass find query response
								var actual = docs;
								for (var i = 0; i < docs.length; i++) {
									actual[i]._id = actual[i]._id.toString();
								}
								var expected = response.body;
								t.deepEquals(actual, expected, '(B) MongoDB find query');
							})
							.catch(err => {
								
								// (test_find_fail) Fail find query response
								t.fail('(B) MongoDB find query: ' + err.message);
								process.exit(1);
							})
							.then(() => {
								
								// (test_drop) Drop database
								db.dropDatabase((err, result) => {
									
									// (test_drop_fail) Fail to drop database
									if (err) {
										t.fail('(MAIN) Drop MongoDB database: ' + err.message);
										process.exit(1);
									}
									
									// (test_drop_pass) Dropped database
									t.pass('(MAIN) Drop MongoDB database');
									process.exit(0);
								});
							});
					});
			})
			.catch(err => {
				
				// (test_insert_fail) Failed to insert data
				t.fail('(MAIN) insertMany: ' + err.message);
				process.exit(1);
			})
	});

	t.end();
});


