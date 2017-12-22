// Richard Wen
// rrwen.dev@gmail.com

var express = require('express');
var mongoClient = require('mongodb').MongoClient;

/**
 * Express middleware for MongoDB REST APIs
 *
 * * {@link https://expressjs.com/ Express Web Framework Documentation}
 * * {@link https://docs.mongodb.com/ MongoDB Database Documentation}
 * * {@link https://tools.ietf.org/html/rfc3986#section-3.4 Query String}
 * * {@link https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style Representational State Transfer (REST)}
 * * {@link https://medium.freecodecamp.org/what-is-an-api-in-english-please-b880a3214a82 Application Programming Interface (API)}
 * * {@link https://restfulapi.net/http-methods/ RESTful HTTP Methods}
 *
 * @module api
 *
 * @param {Object} [options={}] options for this function.
 * @param {Object} [options.mongodb={}] default options for [MongoDB](https://www.mongodb.com/) database.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
 * @param {string} [options.mongodb.database=process.env.MONGODB_DATABASE || 'test'] database name.
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION|| 'express_mongodb_rest'] collection name
 * @param {string} [options.mongodb.method=process.env.MONGODB_METHOD || 'find'] {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} name
 * @param {Array|string} [options.mongodb.query=process.env.MONGODB_QUERY] base query when URL query string is not provided for {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 *
 * * By default, `options.mongodb.method` is not called when query strings are not provided
 * * A query string is not provided when a URL does not contain `?` such as `localhost:3000`
 *
 * @param {Array|string} [options.mongodb.keys=process.env.MONGODB_KEYS || ['q', 'options']] URL query string items to extract Array for passing into the {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 *
 * 1. **Given URL** `localhost:3000/api?q[field]=1&options[limit]=10`
 * 2. **Query string** is `q[field]=1&options[limit]=10`
 * 3. **Parsed query string** is `{q: {field: 1}, options: {limit: 10}}`
 * 4. If `options.mongodb.keys` are `['query', 'options']`
 * 5. **Arguments** are `[{field: 1}, {limit: 10}]`
 * 6. Arguments are passed to {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * 7. **Example**: `collection.find({field: 1}, {limit: 10})`
 *
 * @param {function|string} [options.mongodb.callback=process.env.MONGODB_CALLBACK || function(args, result){return(results);}] callback function before sending the response and after querying the MongoDB database 
 *
 * * Callback is in the form of `function(query, result) {return result}`
 * * Callback must return a resulting object from a {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection MongoDB collection} call
 * * `query` is an Array of arguments passed to the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * * `result` is the returned object from the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * * This callback is useful to add forced calls such as: `function(args, result){return result.limit(1000);}`
 *
 * @param {function|string} [options.mongodb.parse=process.env.MONGODB_PARSE || function(query) {return (query);}] parse function to modify query arguments before passing to {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 *
 * * Parse function is in the form of `function(query) {return query}`
 * * Parse function must return an Array of Objects in the form `[{ ... }, { ... }, ...]`
 * * `query` is an Array of arguments that can be passed to the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 * 1. **Recall** example from `options.mongodb.keys`
 * 2. **Given Arguments** `[{field: 1}, {limit: 10}]`
 * 3. If `options.mongodb.parse` is `function(query) {return [query[0]];}`
 * 4. **Arguments** are then `[{field: 1}]`
 * 5. **Example**: `collection.find({field: 1}, {limit: 10})` becomes `collection.find({field: 1})`
 *
 * @param {Object} [options.rest={}] options for REST API definitions
 *
 * * Each key in `options.rest` is the REST API method such as `GET`, `POST`, `PUT`, `DELETE`, etc
 * * `GET` is used as an example below, but can be changed to `POST`, `PUT`, `DELETE`, etc
 *
 * @param {Object} [options.rest.GET={}] example of REST API definition for `GET`
 * @param {string} [options.rest.GET.database=options.mongodb.database] database name for `GET` request
 * @param {string} [options.rest.GET.collection=options.mongodb.collection] collection name for `GET` request
 * @param {string} [options.rest.GET.method=options.mongodb.method] method name for `GET` request
 * @param {Array} [options.rest.GET.query=options.mongodb.query] base query when URL query is not provided for {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.rest.GET.method`
 * @param {Array|string} [options.rest.GET.keys=options.mongodb.keys] URL query string items to extract Array for passing into the {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.rest.GET.method`
 * @param {function} [options.rest.GET.callback=options.mongodb.callback] callback function for `GET` request as defined in `options.mongodb.callback`
 * @param {function} [options.rest.GET.parse=options.mongodb.parse] parse function to modify query arguments before passing to {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.rest.GET.method`
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
 * options.mongodb.connection = 'mongodb://localhost:27017'; // process.env.MONGODB_CONNECTION
 * options.mongodb.database = 'test'; // process.env.MONGODB_DATABASE
 * options.mongodb.collection = 'express_mongodb_rest'; // process.env.MONGODB_COLLECTION
 *
 * // (options_get) GET options
 * options.rest.GET = {};
 * options.rest.GET.method = 'find';
 * options.rest.GET.keys = ['q', 'options'];
 * options.rest.GET.query = [{}]; // return all if no query string provided
 * 
 * // (options_post) POST options
 * options.rest.POST = {};
 * options.rest.POST.method = 'insertMany';
 * options.rest.POST.keys = ['docs', 'options'];
 *
 * // (options_post) POST options
 * options.rest.PUT = {};
 * options.rest.PUT.method = 'updateMany';
 * options.rest.PUT.keys = ['q', 'update', 'options'];
 *
 * // (options_delete) DELETE options
 * options.rest.DELETE = {};
 * options.rest.DELETE.method = 'deleteMany';
 * options.rest.DELETE.keys = ['q'];
 *
 * // (options_get_limit) Force document limit returned by GET to 100
 * options.rest.GET.callback = function(query, result){return result.limit(100);};
 *
 * // (app) Create express app
 * var app = express();
 *
 * // (app_optional) Allow queries with numbers
 * // Install: npm install --save express-query-int
 * // app.use(require('express-query-int')());
 *
 * // (app_middleware) Add MongoDB REST API on localhost:3000/api
 * app.use('/api', api(options);
 *
 * // (app_start) Listen on localhost:3000
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
	options.mongodb.query = options.mongodb.query || process.env.MONGODB_QUERY;
	options.mongodb.keys = options.mongodb.keys || process.env.MONGODB_KEYS || ['q', 'options'];
	options.mongodb.callback = options.mongodb.callback || process.env.MONGODB_CALLBACK || function(query, result) {return(result);};
	options.mongodb.parse = options.mongodb.parse || process.env.MONGODB_PARSE || function(query){return(query);};
	
	// (options_mongodb_parse) Parse defaults if needed
	if (typeof options.mongodb.query == 'string') {
		options.mongodb.query = JSON.parse(options.mongodb.query);
	}
	if (typeof options.mongodb.keys == 'string') {
		options.mongodb.keys = JSON.parse(options.mongodb.keys);
	}
	if (typeof options.mongodb.callback == 'string') {
		options.mongodb.callback = eval(options.mongodb.callback);
	}
	if (typeof options.mongodb.parse == 'string') {
		options.mongodb.parse = eval(options.mongodb.parse);
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
		var keys = rest.keys || options.mongodb.keys;
		var parse = rest.parse || options.mongodb.parse;
		
		// (middleware_parse) Parse url request to mongodb query
		var query = rest.query || options.mongodb.query;
		if (req.query !== undefined) {
			if (Object.keys(req.query).length > 0) {
				query = [];
				for (var i = 0; i < keys.length; i ++) {
					query.push(req.query[keys[i]]);
				}
			}
		}
		query = parse(query);
		
		// (middleware_connect) Connect to mongodb database
		if (query !== undefined) {
			mongoClient.connect(connection, function(err, client) {
				if (err) next(err);
				
				// (middleware_connect_query) Query mongodb database
				var result = client.db(database).collection(collection)[method](...query);
				var resultCallback = callback(query, result);
				
				// (middleware_connect_response) Respond with data if available
				if (typeof resultCallback.toArray == 'function') {
					resultCallback.toArray(function(err, docs) {
						if (err) next(err);
						res.json(docs);
					});
				} else {
					res.end();
				}
			});
		} else {
			res.end();
		}
	};
	return(middleware);
};
