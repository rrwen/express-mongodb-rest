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

// (test_function_mongoget) MongoDB find test function
var mongoGET = function(app, collection, query, t, expected, msg) {
	collection.find(query).toArray()
		.then(docs => {
			var actual = docs;
			for (var i = 0; i < docs.length; i++) {
				actual[i]._id = actual[i]._id.toString();
			}
			t.deepEquals(actual, expected, msg);
		});
};

// (test_function_mongoend) MongoDB clean up function
var mongoEnd = function(db, client, t) {
	
	// (test_drop) Drop database
	db.dropDatabase(res => {
		
		// (test_drop_pass) Dropped database
		t.pass('(MAIN) Drop MongoDB database');
		
		// (test_drop_client) Drop client connection
		return client.close(res => {
			
			// (test_drop_client_pass) Dropped connection
			t.pass('(MAIN) MongoDB disconnect');
			process.exit();
		})
		.catch(err => {
			
			// (test_drop_client_fail) Fail to drop connection
			t.fail('(MAIN) MongoDB disconnect: ' + err.message);
			process.exit();
		});
	})
	.catch(err => {
		
		// (test_drop_fail) Fail to drop database
		t.fail('(MAIN) Drop MongoDB database: ' + err.message);
		process.exit();
	});
};

// (test) Run tests
test('Tests for ' + json.name + ' (' + json.version + ')', t => {
	t.comment('Node.js (' + process.version + ')');
	t.comment('Description: ' + json.description);
	t.comment('Date: ' + moment().format('YYYY-MM-DD hh:mm:ss'));
	t.comment('Dependencies: ' + testedPackages.join(', '));
	t.comment('Developer: ' + devPackages.join(', '));
	process.env.MONGODB_DATABASE = process.env.MONGODB_TESTDATABASE;
	
	// (test_connect) Connect to mongodb
	Client.connect(process.env.MONGODB_CONNECTION, function(err, client) {
		var db = client.db(process.env.MONGODB_DATABASE);
		var collection = db.collection(process.env.MONGODB_COLLECTION);
		
		// (test_connect_fail) Fail to connect
		if (err) {
			t.fail('(MAIN) MongoDB connect: ' + err.message);
			mongoEnd(db, client);
		}
		
		// (test_insert) Insert test data
		return collection.insertMany([{a:1}, {b:2}, {c:3}])
			.then(res => {
				
				// (test_insert_pass) Inserted data
				t.pass('(MAIN) insertMany');
				
				// (test_app) Create base app
				var baseApp = express();
				baseApp.use('/api', api());
				
				// (test_app2) Create REST app
				var restApp = express();
				options = {mongodb: {}, rest: {}};
				options.rest.GET = {};
				options.rest.POST = {};
				options.rest.PUT = {};
				options.rest.DELETE = {};
				restApp.use('/rest', api(options));
				
				// (test_app_return) Pass apps to thenables
				return {base: baseApp, rest: restApp};
			})
			.then(app => {
				t.comment('(A) tests on app response');
				
				// (test_base_get_200) Test base GET response 200
				return request(app.base)
					.get('/api')
					.expect(200)
					.then(res => {
						
						// (test_base_get_200_pass) Pass base GET response 200
						t.pass('(A) base app GET 200 success response');
					})
					.catch(err => {
						
						// (test_base_get_200_fail) Fail base GET response 200
						t.fail('(A) base app GET 200 success response: ' + err.message);
						mongoEnd(db, client);
					})
					.then(() => {
						return app;
					});
			})
			.then(app => {
				
				// (test_rest_get_200) Test rest GET response 200
				return request(app.rest)
					.get('/rest')
					.expect(200)
					.then(res => {
						
						// (test_rest_get_200_pass) Pass rest GET response 200
						t.pass('(A) REST GET 200 success response');
					})
					.catch(err => {
						
						// (test_rest_get_200_fail) Fail rest GET response 200
						t.fail('(A) REST GET 200 success response: ' + err.message);
						mongoEnd(db, client);
					})
					.then(() => {
						return app;
					});
			})
			.then(app => {
				
				// (test_rest_post_200) Test rest POST response 200
				return request(app.rest)
					.post('/rest')
					.expect(200)
					.then(res => {
						
						// (test_rest_post_200_pass) Pass rest POST response 200
						t.pass('(A) REST POST 200 success response');
					})
					.catch(err => {
						
						// (test_rest_post_200_fail) Fail rest POST response 200
						t.fail('(A) REST POST 200 success response: ' + err.message);
						mongoEnd(db, client);
					})
					.then(() => {
						return app;
					});
			})
			.then(app => {
				
				// (test_rest_put_200) Test rest PUT response 200
				return request(app.rest)
					.put('/rest')
					.expect(200)
					.then(res => {
						
						// (test_rest_put_200_pass) Pass rest PUT response 200
						t.pass('(A) REST PUT 200 success response');
					})
					.catch(err => {
						
						// (test_rest_put_200_fail) Fail rest PUT response 200
						t.fail('(A) REST PUT 200 success response: ' + err.message);
						mongoEnd(db, client);
					})
					.then(() => {
						return app;
					});
			})
			.then(app => {
				
				// (test_rest_delete_200) Test rest DELETE response 200
				return request(app.rest)
					.delete('/rest')
					.expect(200)
					.then(res => {
						
						// (test_rest_delete_200_pass) Pass rest DELETE response 200
						t.pass('(A) REST DELETE 200 success response');
					})
					.catch(err => {
						
						// (test_rest_delete_200_fail) Fail rest DELETE response 200
						t.fail('(A) REST DELETE 200 success response: ' + err.message);
						mongoEnd(db, client);
					})
					.then(() => {
						return app;
					});
			})
			.then(app => {
				t.comment('(B) tests on base app')
				
				// (test_base_get_find) Test base GET find request
				return request(app.base)
					.get('/api')
					.then(res => {
						
						// (test_base_get_find_pass) Pass base GET find request
						var query = {};
						var expected = res.body;
						var msg = '(B) base /api response consistent with collection';
						return mongoGET(app, collection, query, t, expected, msg);
					})
					.catch(err => {
						
						// (test_base_get_find_fail) Fail base GET find request
						t.fail('(B) base /api response consistent with collection: ' + err.message);
						mongoEnd(db, client);
					})
					.then(() => {
						return app;
					});
			})
			.catch(err => {
				
				// (test_insert_fail) Fail to insert data
				t.fail('(MAIN) insertMany: ' + err.message);
				mongoEnd(db, client);
			})
			.then(() => {
				return mongoEnd(db, client, t);
			});
	});
	t.end();
});


