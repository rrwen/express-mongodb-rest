// Richard Wen
// rrwen.dev@gmail.com

var express = require('express');
var mongoClient = require('mongodb').MongoClient;

// (default_before) Default function for handling query object before mongodb call
var defaultBefore = function(query) {
	for (var i in query) {
		if (typeof query[i] == 'string') {
			query[i] = JSON.parse(query[i]);
		}
	}
	return query;
};

// (default_after) Default function for handling returned values after mongodb call
var defaultAfter = function(query, result, req, res, next) {
	if (typeof result.toArray == 'function') {
		result.toArray(function(err, docs) {
			if (err) next(err);
			res.json(docs);
		});
	} else {
		res.end();
	}
};

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
 *
 * @param {Object} [options.express={}] options for {@link http://expressjs.com/en/4x/api.html express} JavaScript package
 *
 * @param {string} [options.express.collection='collection'] {@link https://expressjs.com/en/guide/routing.html route parameter} name in path (e.g. `/:collection`) for MongoDB collection
 *
 * * By default, `options.express.collection` is used only if `options.rest.<METHOD>.collection` is not available
 * * `options.express.collection` takes priority over `options.mongodb.collection`
 *
 * @param {string} [options.express.method='method'] {@link https://expressjs.com/en/guide/routing.html route parameter} name in path (e.g. `/:method`) for MongoDB method
 *
 * * By default, `options.express.method` is used only if `options.rest.<METHOD>.method` is not available
 * * `options.express.method` takes priority over `options.mongodb.method`
 *
 * @param {Object} [options.express.allow={}] options for allowing access to databases and collections
 * @param {Array} [options.express.allow.collection=[]] names of MongoDB collections to allow API access to
 *
 * * By default, the API is allowed access to all collections
 *
 * @param {number} [options.express.allow.code=400] response {@link https://developer.mozilla.org/docs/Web/HTTP/Status status code} when a request is not allowed
 *
 * @param {Object} [options.express.deny={}] options for denying access to databases and collections
 *
 * * `options.express.deny` takes priority over `options.express.allow`
 *
 * @param {Array} [options.express.deny.collection=[]] names of MongoDB collections to deny API access to
 *
 * * By default, the API is not denied access to any collections
 *
 * @param {number} [options.express.deny.code=400] response {@link https://developer.mozilla.org/docs/Web/HTTP/Status status code} when a request is denied
 *
 * @param {Object} [options.mongodb={}] default options for [MongoDB](https://www.mongodb.com/) database.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/).
 * @param {Object|string} [options.mongodb.options=process.env.MONGODB_OPTIONS] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient#.connect connect options}.
 * @param {string} [options.mongodb.database=process.env.MONGODB_DATABASE || 'test'] database name.
 *
 * * By default, `options.mongodb.database` is used only if `options.express.database` and `options.rest.database` are not available
 *
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION|| 'express_mongodb_rest'] collection name
 *
 * * By default, `options.mongodb.collection` is used only if `options.express.collection` and `options.rest.collection` are not available
 *
 * @param {Array|string} [options.mongodb.query=process.env.MONGODB_QUERY] base query when URL query string is not provided for {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.method`
 *
 * * By default, `options.mongodb.method` is not called when query strings are not provided
 * * A query string is not provided when a URL does not contain `?` such as `localhost:3000`
 *
 * @param {Array|string} [options.mongodb.keys=process.env.MONGODB_KEYS || ['q', 'options']] URL query string items to extract Array for passing into the {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.methods`
 *
 * 1. **Given URL** `localhost:3000/api?q[field]=1&options[limit]=10`
 * 2. **Query string** is `q[field]=1&options[limit]=10`
 * 3. **Parsed query string** is `{q: {field: 1}, options: {limit: 10}}`
 * 4. If `options.mongodb.keys` are `['query', 'options']`
 * 5. **Arguments** are `[{field: 1}, {limit: 10}]`
 * 6. Arguments are passed to {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.mongodb.methods`
 * 7. **Example**: `collection.find({field: 1}, {limit: 10})`
 *
 * @param {string} [options.mongodb.method='find'] Default {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} to use when a method is not specified
 * @param {Object} [options.mongodb.methods={}] options for defining functions before and after the {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} call provided by `/:method`
 *
 * * options.mongodb.methods is in the form of `options.mongodb.methods.<COLLECTION_METHOD>.<OPTION>`
 * * Each key in `options.mongodb.methods` is the {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} such as {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find find} , {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#insertMany insertMany}, {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#updateMany updateMany}, or {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#deleteMany deleteMany}
 * * Requested methods from route parameter `/:method` are not allowed if they are undefined in `options.mongodb.methods`
 * * `find` is used as an example below, but can be changed to other collection methods such as `insertMany`, `updateMany`, `deleteMany`, etc
 *
 * @param {Object} [options.mongodb.methods.find={}] example of before and after functions for the {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find find} method
 * @param {function} options.mongodb.methods.find.before parse function to modify query arguments before passing to {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find find} 
 *
 * * Before function is in the form of `function(query) {return query}`
 * * Before function must return an Array of Objects in the form `[{ ... }, { ... }, ...]`
 * * `query` is an Array of arguments that can be passed to the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by the key (in this case `find`)
 * * By default, `options.mongodb.methods.<COLLECTION_METHOD>.before` takes the `query` Array and parses any strings into JSON objects
 *
 * 1. **Recall** example from `options.mongodb.keys`
 * 2. **Given Arguments** `[{field: 1}, {limit: 10}]`
 * 3. If `options.mongodb.parse` is `function(query) {return [query[0]];}`
 * 4. **Arguments** are then `[{field: 1}]`
 * 5. **Example**: `collection.find({field: 1}, {limit: 10})` becomes `collection.find({field: 1})`
 *
 * @param {function} options.mongodb.methods.find.after callback function after a call to {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find find} 
 *
 * * After function is in the form of `function(query, result, req, res, next) {res.end();}`
 * * `query` is an Array of arguments passed to the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} (after calling `options.mongodb.methods.find.before`) defined by the key (in this case `find`)
 * * `result` is the returned object from the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by the key (in this case `find`)
 * * `req` is the {@link http://expressjs.com/en/api.html#req request Object}
 * * `res` is the {@link http://expressjs.com/en/api.html#res response Object}
 * * `next` is a function that can be called to skip the remaining lines ahead and move to the next router
 * * After function should send JSON data in the end using `res` such as {@link http://expressjs.com/en/api.html#res.jsonp res.json()}
 * * The default assumes that all methods produce a `result` that can be called with {@link https://mongodb.github.io/node-mongodb-native/3.0/api/AggregationCursor#toArray toArray()} to send a JSON response with {@link http://expressjs.com/en/api.html#res.jsonp res.json()}
 *
 * @param {Object} [options.rest={}] options for REST API definitions
 *
 * * options.rest is in the form of `options.rest.<METHOD>.<OPTION>`
 * * Each key in `options.rest` is the REST API method such as `GET`, `POST`, `PUT`, `DELETE`, etc
 * * `options.rest` values take priority over `options.mongodb` and `options.express` values
 * * `GET` is used as an example below, but can be changed to `POST`, `PUT`, `DELETE`, etc
 *
 * @param {Object} [options.rest.GET={}] example of REST API definition for `GET`
 * @param {string} [options.rest.GET.database=options.mongodb.database] database name for `GET` request
 * @param {string} [options.rest.GET.collection=options.mongodb.collection] collection name for `GET` request
 * @param {string} [options.rest.GET.method=options.mongodb.methods] method functions for `GET` request as defined in `options.mongodb.methods`
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
 * options.mongodb.options = {poolSize: 10};
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
 * options.rest.DELETE.methods = 'deleteMany';
 * options.rest.DELETE.keys = ['q'];
 *
 * // (app) Create express app
 * var app = express();
 *
 * // (app_middleware) Add MongoDB REST API on localhost:3000/api
 * app.use('/api', api(options);
 * app.use('/api/:collection', api(options)); // enable other collections
 * app.use('/api/:collection/:method', api(options)); // enable other collections and methods
 *
 * // (app_start) Listen on localhost:3000
 * app.listen(3000);
 *
 */
module.exports = function(options) {
	options = options || {};
	
	// (options_express) Default express options
	options.express = options.express || {};
	options.express.collection = options.express.collection || 'collection';
	options.express.method = options.express.method || 'method';
	options.express.methods = options.express.methods || {};
	options.express.deny = options.express.deny || {};
	options.express.deny.collection = options.express.deny.collection || [];
	options.express.deny.code = options.express.deny.code || 400;
	options.express.allow = options.express.allow || {};
	options.express.allow.collection = options.express.allow.collection || [];
	options.express.allow.code = options.express.allow.code || 400;
	
	// (options_mongodb) Default mongodb options
	options.mongodb = options.mongodb || {};
	options.mongodb.connection = options.mongodb.connection || process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017';
	options.mongodb.options = options.mongodb.options || process.env.MONGODB_OPTIONS;
	options.mongodb.database = options.mongodb.database || process.env.MONGODB_DATABASE || 'test';
	options.mongodb.collection = options.mongodb.collection || process.env.MONGODB_COLLECTION || 'express_mongodb_rest';
	options.mongodb.method = options.mongodb.method || process.env.MONGODB_METHOD || 'find';
	options.mongodb.query = options.mongodb.query || process.env.MONGODB_QUERY;
	options.mongodb.keys = options.mongodb.keys || process.env.MONGODB_KEYS || ['q', 'options'];
	options.mongodb.callback = options.mongodb.callback || process.env.MONGODB_CALLBACK || function(query, result) {return(result);};
	options.mongodb.parse = options.mongodb.parse || process.env.MONGODB_PARSE;
	
	// (options_mongodb_parse) Parse defaults if needed
	if (typeof options.mongodb.options == 'string') {
		options.mongodb.options = JSON.parse(options.mongodb.options);
	}
	if (typeof options.mongodb.query == 'string') {
		options.mongodb.query = JSON.parse(options.mongodb.query);
	}
	if (typeof options.mongodb.keys == 'string') {
		options.mongodb.keys = JSON.parse(options.mongodb.keys);
	}
	if (typeof options.mongodb.callback == 'string') {
		eval('options.mongodb.callback = ' + options.mongodb.callback);
	}
	if (typeof options.mongodb.parse == 'string') {
		eval('options.mongodb.parse = ' + options.mongodb.parse);
	}
	
	// (options_rest) Default REST options
	options.rest = options.rest || {'GET': {}};
	
	// (mongodb) Connect to mongodb
	var db;
	mongoClient.connect(options.mongodb.connection, options.mongodb.options, function(err, client) {
		db = client.db(options.mongodb.database);
	});
	
	// (middleware) Express middleware function 
	var middleware = function(req, res, next) {
		
		// (middleware_defaults) Default rest options
		var rest = options.rest[req.method];
		rest.methods = rest.methods || {};
		
		// (middleware_options) Setup REST options
		var collection = rest.collection || req.params[options.express.collection] || options.mongodb.collection;
		var method = rest.method || options.mongodb.method;
		var callback = rest.callback || options.mongodb.callback;
		var keys = rest.keys || options.mongodb.keys;
		var before = rest.method.before || options.mongodb.before;
		
		// (middleware_deny) Check for denied collections
		if (options.express.deny.collection.indexOf(collection) > -1) {
			res.status(options.express.deny.code);
		}
		
		// (middleware_allow) Check for allowed collections
		if (!(options.express.allow.collection.indexOf(collection) > -1) && options.express.allow.collection.length > 1) {
			res.status(options.express.allow.code);
		}
		
		// (middleware_before) Parse url request to mongodb query
		var query = rest.query || options.mongodb.query;
		if (req.query !== undefined) {
			if (Object.keys(req.query).length > 0) {
				query = [];
				for (var i = 0; i < keys.length; i ++) {
					query.push(req.query[keys[i]]);
				}
			}
		}
		if (query !== undefined) {
			query = before(query);
		}
		
		// (middleware_connect) Connect to mongodb database
		if (query !== undefined) {
				
			// (middleware_connect_query) Query mongodb database
			var result = db.collection(collection)[method](...query);
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
		} else {
			res.end();
		}
	};
	return(middleware);
};
