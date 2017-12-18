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
 * * {@link https://expressjs.com/ Express Web Framework Documentation}
 * * {@link https://docs.mongodb.com/ MongoDB Database Documentation}
 *
 * @param {Object} [options={}] options for this function.
 * @param {Object} [options.mongodb={}] options for [MongoDB](https://www.mongodb.com/) database.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] Default MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
 * @param {string} [options.mongodb.database=process.env.MONGODB_DATABASE || 'test'] Default database name.
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION|| 'express_mongodb_rest'] Default collection name
 * @param {string} [options.mongodb.method=process.env.MONGODB_METHOD || 'find'] Default {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} name
 *
 * @returns {function} Express {@link http://expressjs.com/en/guide/using-middleware.html middleware} compatible with `{@link http://expressjs.com/en/api.html#app.use app.use}`.
 *
 * @example
 * var express = require('express');
 * var mongoREST = require('express-mongodb-rest');
 *
 * // (options) Initialize options object
 * var options = {mongodb: {}, rest: {}};
 *
 * // (connection_mongodb) Setup mongodb connection
 * // Format: 'mongodb://<user>:<password>@<host>:<port>'
 * options.mongodb.connection = 'mongodb://localhost:27017';
 *
 * // (options_get) Setup REST options for GET
 * options.rest.GET = {};
 * options.rest.GET.database = 'test';
 * options.rest.GET.collection = 'express_mongodb_rest';
 * options.rest.GET.method = 'find';
 * options.rest.GET.query = {};
 *
 * // (app) Create express app with middleware
 * var app = express();
 * var REST = mongoREST(options);
 * app.use('/express_mongodb_rest', REST);
 * app.listen(3000);
 * 
 *
 */
module.exports = function(options) {
	options = options || {};
	
	// (options_mongodb) Default mongodb options
	options.mongodb = options.mongodb || {};
	options.mongodb.connection = options.mongodb.connection || process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017';
	options.mongodb.database = options.mongodb.database || process.env.MONGODB_DATABASE || 'test';
	options.mongodb.collection = options.mongodb.collection || process.env.MONGODB_COLLECTION || 'express_mongodb_rest';
	options.mongodb.method = options.mongodb.method || process.env.MONGODB_METHOD || 'find';
	options.mongodb.callback = options.mongodb.callback || process.env.MONGODB_CALLBACK || ;
	if (typeof options.mongodb.callback == 'string') {
		options.mongodb.callback = eval(options.mongodb.callback);
	}
	
	// (options_rest) Default REST options
	options.rest = options.rest || {'GET': {}};
	
	// (middleware) Express middleware function 
	var middleware = function(req, res, next) {
		
		// (middleware_options) Setup REST options
		var rest = options.rest[req.method];
		var connection = rest.connection || options.mongodb.connection;
		var database = rest.database || options.mongodb.database;
		var collection = rest.collection || options.mongodb.collection;
		var method = rest.method || options.mongodb.method;
		var callback = rest.callback || options.mongodb.callback;
		
		// (middleware_parse) Parse url request to mongodb query
		var query = mongoQuerystring.parse(req.query) || {};
		
		// (middleware_args) Add query to rest.position in args for mongodb method
		var args = rest.args || [];
		args.splice(rest.position || 0, 0, query);
		
		// (middleware_connect) Connect to mongodb database
		mongoClient.connect(connection, function(err, client) {
			if (err) next(err);
			
			// (middleware_connect_query) Query mongodb database
			var collection = client.db(database).collection(collection);
			var result = collection[method](...args);
			callback(result, args).toArray(function(err, docs) {
				if (err) next(err);
				res.json(docs);
			});
		});
	};
	
	return(middleware);
};
