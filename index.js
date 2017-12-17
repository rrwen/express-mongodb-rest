// Richard Wen
// rrwen.dev@gmail.com

var express = require('express');
var mongoClient = require('mongodb').MongoClient
var mongoQuerystring = require('mongo-querystring');

/**
 * Description.
 *
 * @module express-mongodb-rest
 *
 * @param {Object} [options={}] options for this function.
 * @param {Object} [options.mongodb={}] options for [MongoDB](https://www.mongodb.com/) database.
 * @param {string} [options.mongodb.url='mongodb://localhost:27017'] MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
 * @param {string} [options.mongodb.database='test'] database name.
 * @param {string} [options.mongodb.collection='express_mongodb_rest'] collection name
 *
 * @returns {Object} return description.
 *
 * @example
 * var express = require('express');
 * var mongodbREST = require('express-mongodb-rest')({});
 *
 * // (middleware) Create app with express and add as middleware
 * var app = express();
 * app.use(mongodbREST.middleware);
 * app.listen(3000);
 *
 * // (app) Return app with mongodbREST middleware
 * var mongoApp = mongodbREST.app;
 * mongoApp.listen(3001);
 */
module.exports = function(options) {
	var out = {};
	options = options || {};
	
	// (options_mongodb) Default mongodb options
	options.mongodb = options.mongodb || {};
	options.mongodb.url = options.mongodb.url || 'mongodb://localhost:27017';
	options.mongodb.database = options.mongodb.database || 'test';
	options.mongodb.collection = options.mongodb.collection || 'express_mongodb_rest';
	
	// (options_rest) Default REST options
	options.rest = options.rest || {};
	
	// (middleware) Express middleware function 
	out.middleware = function(req, res, next) {
		
		// (middleware_parse) Parse url request to mongodb query
		var method = options.rest[req.method].method;
		var query = mongoQuerystring.parse(req.query) || {};
		var position = options.rest[req.method].position || 0;
		var args = options.rest[req.method].args || [];
		args.splice(position, 0, query);
		
		// (middleware_connect) Connect to mongodb database
		mongoClient.connect(options.mongodb.url, function(err, client) {
			var collection = client.db(options.mongodb.database).collection(options.mongodb.collection);
			if (err) next(err);
			
			// (middleware_connect_query) Query mongodb database
			collection[method](...args).toArray(function(err, docs) {
				if (err) next(err);
				res.json(docs);
			});
		});
	};
	
	// (app) Express built in app
	out.app = express();
	out.app.use(out.middleware);
	return(out);
};
