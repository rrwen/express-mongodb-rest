// Richard Wen
// rrwen.dev@gmail.com

var express = require('express');
var mongoClient = require('mongodb').MongoClient
var querystring = require('querystring');

/**
 * Express middleware for MongoDB REST APIs
 *
 * * {@link https://expressjs.com/ Express Web Framework Documentation}
 * * {@link https://docs.mongodb.com/ MongoDB Database Documentation}
 * * {@link https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style Representational State Transfer (REST)}
 * * {@link https://medium.freecodecamp.org/what-is-an-api-in-english-please-b880a3214a82 Application Programming Interface (API)}
 *
 * @module api
 *
 * @param {Object} [options={}] options for this function.
 * @param {Object} [options.mongodb={}] default options for [MongoDB](https://www.mongodb.com/) database.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
 * @param {string} [options.mongodb.database=process.env.MONGODB_DATABASE || 'test'] database name.
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION|| 'express_mongodb_rest'] collection name
 * @param {string} [options.mongodb.method=process.env.MONGODB_METHOD || 'find'] MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} name
 * @param {Object|string} [options.mongodb.query=process.env.MONGODB_QUERY || {}] base query (when URL query string is not provided such as `localhost:3000/api`) for {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * @param {function|string} [options.mongodb.callback=process.env.MONGODB_CALLBACK || function(){}] callback function after querying the MongoDB database and before sending the response
 *
 * * Callback is in the form of `function(result, args) {}`
  * * Callback must return a resulting object from a {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection MongoDB collection} call
 * * `result` is the returned object from the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * * `args` is an Array of arguments passed to the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * * `args[0]` is the parsed JSON from the URL request
 * * This callback is useful to add forced calls such as: `function(result, args){return result.limit(1000);}`
 *
 * @param {Array|string} [options.mongodb.args=process.env.MONGODB_ARGS || []] Array of arguments to pass to the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * @param {number|string} [options.mongodb.position=process.env.MONGODB_POSITION || 0] position of parsed query JSON from URL request in `options.args`
 * @param {Object} [options.rest={}] options for REST API definitions
 *
 * * Each key in `options.rest` is the REST API method such as `GET`, `POST`, `PUT`, `DELETE`, etc
 * * `GET` is used as an example below, but can be changed to `POST`, `PUT`, `DELETE`, etc
 *
 * @param {Object} [options.rest.GET={}] example of REST API definition for `GET`
 * @param {string} [options.rest.GET.database=options.mongodb.database] database name for `GET` request
 * @param {string} [options.rest.GET.collection=options.mongodb.collection] collection name for `GET` request
 * @param {string} [options.rest.GET.method=options.mongodb.method] method name for `GET` request
 * @param {Object} [options.rest.GET.query=options.mongodb.query] base query when URL query is not provided for {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.rest.GET.method`
 * @param {function} [options.rest.GET.callback=options.mongodb.callback] callback function for `GET` request as defined in `options.mongodb.callback`
 * @param {Array} [options.rest.GET.args=options.mongodb.args] Array of arguments to pass to MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.rest.GET.method`
 * @param {number} [options.rest.GET.position=options.mongodb.position] position of parsed JSON from URL request for `options.rest.GET.args`
 *
 * @returns {function} Express {@link http://expressjs.com/en/guide/using-middleware.html middleware} compatible with {@link http://expressjs.com/en/api.html#app.use app.use}.
 *
 * @example
 * var express = require('express');
 * var api = require('express-mongodb-rest');
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
 *
 * // (options_get_limit) Limit documents returned by GET to 100
 * // Note: args[0] is the parsed query JSON object from the url request
 * options.rest.GET.callback = function(result, args){return result.limit(100);};
 *
 * // (app) Create express app with middleware
 * // Available at: localhost:3000/api
 * var app = express();
 * app.use('/api', api(options);
 * app.listen(3000);
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
	options.mongodb.query = options.mongodb.query || process.env.MONGODB_QUERY || {};
	if (typeof options.mongodb.query == 'string') {
		options.mongodb.query = JSON.parse(options.mongodb.query);
	}
	options.mongodb.callback = options.mongodb.callback || process.env.MONGODB_CALLBACK || function(result, args) {return result;};
	if (typeof options.mongodb.callback == 'string') {
		options.mongodb.callback = eval(options.mongodb.callback);
	}
	options.mongodb.position = options.mongodb.position || process.env.MONGODB_POSITION || 0;
	if (typeof options.mongodb.position != 'number') {
		options.mongodb.position = parseInt(options.mongodb.position);
	}
	options.mongodb.args = options.mongodb.args || process.env.MONGODB_ARGS || [];
	if (typeof options.mongodb.args == 'string') {
		options.mongodb.args = JSON.parse(options.mongodb.args);
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
		var position = rest.position || options.mongodb.position;
		
		// (middleware_parse) Parse url request to mongodb query
		var query = querystring.parse(req.query) || options.mongodb.query;
		
		// (middleware_args) Add query to rest.position in args for mongodb method
		var args = rest.args || [];
		args.splice(position, 0, query);
		
		// (middleware_connect) Connect to mongodb database
		mongoClient.connect(connection, function(err, client) {
			if (err) next(err);
			
			// (middleware_connect_query) Query mongodb database
			var result = client.db(database).collection(collection)[method](...args);
			callback(result, args).toArray(function(err, docs) {
				if (err) next(err);
				res.json(docs);
			});
		});
	};
	
	return(middleware);
};
