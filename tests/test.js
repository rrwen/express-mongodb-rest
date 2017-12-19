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
		}
		
		// (test_db_pass) Database created
		t.pass('(MAIN) MongoDB connect');
		
		// (test_data) Create collection data
		collection.insertMany([{a: 1, b: 2}, {c: [1,2,3]}])
			.then(res => {
				
				// (test_data_pass) Inserted data
				t.pass('(MAIN) insertMany');
				
				// (test_app) Create app
				var app = express();
				app.use('/api', api());
				
				// (test_request) Test the api requests
				request(app)
					.get('/api')
					.expect(200, err => {
						t.comment('(A) tests on requests');
						
						// (test_200) Test for success code 200
						if (err) t.fail('(A) 200 success code: ' + err.message);
						t.pass('(A) 200 success code');
					})
					.expect((err, response) => {
						
						// (test_find) Test for find query
						if (err) t.fail('(A) MongoDB find request: ' + err.message);
						t.pass('(A) MongoDB find request');
						collection.find({}).toArray()
							.then(res => {
								console.log(res);
								t.deepEquals(res, response.body, '(A) MongoDB find query');
							})
							.catch(err => {
								t.fail('(A) MongoDB find query: ' + err.message);
							});
					});
			})
			.catch(err => {
				
				// (test_data_fail) Failed to insert data
				t.fail('(MAIN) insertMany' + err.message);
			});
	});

	t.end();
});
