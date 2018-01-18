// Richard Wen
// rrwen.dev@gmail.com

var express = require('express');
var mongoClient = require('mongodb').MongoClient;

// (deny) Function for denying access to databases, collections, and methods
var deny = function(target, denied, code, res) {
	if (denied.indexOf(target) > -1) {
		res.status(code);
	}
};

// (allow) Function for allowing access to databases, collections, and methods
var allow = function(target, allowed, code, res) {
	if (!(allowed.indexOf(target) > -1) && allowed.length > 0) {
		res.status(code);
	}
};

// (default_parse) Default function for parsing express query string keys to JSON
var defaultParse = function(query) {
	for (var k in query) {
		if (typeof query[k] == 'string') {
			query[k] = JSON.parse(query[k]);
		}
	}
	return query;
};

// (default_handler) Default function for handling responses for a collection method
var defaultHandler = function(req, res, next, data) {
	
	// (default_handler_variables) Setup required variables
	var collection = data.mongodb.collection;
	var method = data.rest.method;
	var query = data.rest.query;
	
	// (default_handler_call) Handle common MongoDB functions
	var keys;
	if (method == 'find' || method == 'findOne') {
		
		// (default_handler_call_find) MongoDB Find
		collection[method](query.q, query.options, function(err, cursor) {
			if (err) next(err);
			cursor.toArray(function(err, docs) {
				if (err) next(err);
				res.json(docs);
			});
		});
	} else if (method == 'insertMany' || method == 'insertOne') {
		
		// (default_handler_call_insert) MongoDB insert
		collection[method](query.docs, query.options, function(err) {
			if (err) next(err);
			res.json({status: 'success', code: 200});
		});
	} else if (method == 'updateMany' || method == 'updateOne') {
		
		// (default_handler_call_update) MongoDB update
		collection[method](query.q, query.update, function(err) {
			if (err) next(err);
			res.json({status: 'success', code: 200});
		});
	} else if (method == 'deleteMany' || method == 'deleteOne') {
		
		// (default_handler_call_delete) MongoDB delete
		collection[method](query.q, function(err) {
			if (err) next(err);
			if (err) next(err);
			res.json({status: 'success', code: 200});
		});
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
 * @param {string} [options.express.database='database'] {@link https://expressjs.com/en/guide/routing.html route parameter} name in path (e.g. `/:database`) for MongoDB database
 *
 * * `options.express.database` takes priority over  `options.rest.<METHOD>.database` and `options.mongodb.database`
 *
 * @param {string} [options.express.collection='collection'] {@link https://expressjs.com/en/guide/routing.html route parameter} name in path (e.g. `/:collection`) for MongoDB collection
 *
 * * `options.express.collection` takes priority over  `options.rest.<METHOD>.collection` and `options.mongodb.collection`
 *
 * @param {string} [options.express.method='method'] {@link https://expressjs.com/en/guide/routing.html route parameter} name in path (e.g. `/:method`) for MongoDB method
 *
 * * `options.express.method` takes priority over `options.rest.<METHOD>.method` and `options.mongodb.method`
 *
 * @param {function} options.express.parse function for parsing the {@link http://expressjs.com/en/api.html#req.query query string} into an appropriate format to be passed to each `options.mongodb.handler` or `options.rest.<METHOD>.handler`
 *
 * * `options.express.parse` is the form of `function(query){return(query);};
 * * `query` is the {@link http://expressjs.com/en/api.html#req.query query string object} from a request
 * * By default, the first level key in the query string object is converted into a JSON object
 *
 * @param {function} options.express.handler function for handling responses after connecting to MongoDB
 *
 * * `options.express.handler` is in the form of `function(req, res, next, data){}`
 * * `req` is the {@link http://expressjs.com/en/api.html#req request Object}
 * * `res` is the {@link http://expressjs.com/en/api.html#res response Object}
 * * `next` is a function that can be called to skip the remaining lines ahead and move to the next router
 * * `data` is an object containing REST and MongoDB data
 * * `data.rest` contains the REST related data
 * * `data.rest.database` is database name of the request
 * * `data.rest.collection` is the collection name of the request
 * * `data.rest.method` is the  {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} name
 * * `data.rest.query` is a {@link http://expressjs.com/en/api.html#req.query query string} object after parsing with `options.express.parse`
 * * `data.mongodb` contains the MongoDB related data
 * * `data.mongodb.client` is the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient client} object
 * * `data.mongodb.database` is the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Db database} object
 * * `data.mongodb.collection` is the MongoDB {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection} object
 * * By default, `options.express.handler` will handle `find`, `findOne`, `updateMany`, `updateOne`, `insertMany`, `insertOne`, `deleteMany`, and `deleteOne`
 *
 *
 * @param {Object} [options.express.allow={}] options for allowing access to databases and collections
 * @param {Array} [options.express.allow.database=[]] names of MongoDB databases to allow API access to
 *
 * * By default, the API is allowed access to all databases
 *
 * @param {Array} [options.express.allow.collection=[]] names of MongoDB collections to allow API access to
 *
 * * By default, the API is allowed access to all collections
 *
 * @param {Array} [options.express.allow.method=[]] names of MongoDB methods to allow API access to
 *
 * * By default, the API is allowed access to all defined methods in `options.mongodb.handler` or `options.rest.<METHOD>.handler`
 *
 * @param {number} [options.express.allow.code=400] response {@link https://developer.mozilla.org/docs/Web/HTTP/Status status code} when a request is not allowed
 *
 * @param {Object} [options.express.deny={}] options for denying access to databases and collections
 *
 * * `options.express.deny` takes priority over `options.express.allow`
 *
 * @param {Array} [options.express.deny.database=['admin']] names of MongoDB databases to deny API access to
 *
 * * By default, the API is denied access to the admin database only
 *
 * @param {Array} [options.express.deny.collection=[]] names of MongoDB collections to deny API access to
 *
 * * By default, the API is not denied access to any collections
 *
 * @param {Array} [options.express.deny.method=[]] names of MongoDB methods to deny API access to
 *
 * * By default, the API is not denied access to any defined methods in `options.mongodb.handler` or `options.rest.<METHOD>.handler`
 *
 * @param {number} [options.express.deny.code=400] response {@link https://developer.mozilla.org/docs/Web/HTTP/Status status code} when a request is denied
 *
 * @param {Object} [options.mongodb={}] default options for {@link https://www.mongodb.com/ MongoDB} database.
 * @param {string} [options.mongodb.connection=process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017'] MongoDB {@link https://docs.mongodb.com/manual/reference/connection-string/ connection string}.
 * @param {Object|string} [options.mongodb.options=process.env.MONGODB_OPTIONS] Mongodb {@link https://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient#.connect connect options}.
 * @param {string} [options.mongodb.database=process.env.MONGODB_DATABASE || 'test'] database name.
 *
 * * By default, `options.mongodb.database` is used only if `options.express.database` and `options.rest.database` are not available
 *
 * @param {string} [options.mongodb.collection=process.env.MONGODB_COLLECTION|| 'express_mongodb_rest'] collection name
 *
 * * By default, `options.mongodb.collection` is used only if `options.express.collection` and `options.rest.<METHOD>.collection` are not available
 *
 * @param {Object} [options.rest={}] options for REST API definitions
 *
 * * options.rest is in the form of `options.rest.<METHOD>.<OPTION>`
 * * Each key in `options.rest` is the REST API method such as `GET`, `POST`, `PUT`, `DELETE`, etc
 * * `options.rest` values take priority over `options.mongodb` and `options.express` values
 * * `GET` is used as an example below, but can be changed to `POST`, `PUT`, `DELETE`, etc
 *
 * @param {Object} [options.rest.GET={}] example of REST API definition for `GET`
 * @param {string} [options.rest.GET.database=options.mongodb.database] default database name for `GET` request
 * @param {string} [options.rest.GET.collection=options.mongodb.collection] default collection name for `GET` request
 * @param {string} [options.rest.GET.method='find'] default {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} name for `GET` request
 * @param {Array} options.rest.GET.query base query when URL query is not provided for {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} defined by `options.rest.GET.method`
 *
 * * By default, `options.rest.GET.method` is not called when query strings are not provided
 * * A query string is not provided when a URL does not contain `?` such as `localhost:3000`
 *
 * @param {Object} [options.rest.GET.handler={}] object containing handler functions as defined in `options.express.handler`
 *
 * * The default handler for `options.rest.GET.method` is `options.express.handler`
 * * Each key in `options.rest.GET.handler` defines a handler function for a {@link https://mongodb.github.io/node-mongodb-native/3.0/api/Collection collection method} for route `/:method`
 *
 * @param {function} [options.rest.GET.handler.find=options.express.handler] function to handle responses for a method after connecting to mongodb as defined in `options.express.handler`
 *
 * * In this case, the method is `find`, and the function defined will handle all `GET` requests with method `find`
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
 * options.rest.GET.query = {q: {}}; // return all if no query string provided
 * 
 * // (options_get_limit) Limit number of documents for GET to 100
 * options.rest.GET.handler = {};
 * options.rest.GET.handler.find = function(req, res, next, data) {
 *   var collection = data.mongodb.collection;
 *   var query = data.rest.query;
 *   collection.find(query.q, query.options, function(err, result) {
 *     if (err) next(err);
 *     result.limit(100).toArray(function(err, docs) {
 *       if (err) next(err);
 *       res.json(docs);
 *     });
 *   });
 * };
 *
 * // (options_get_count) Handle count collection method
 * options.rest.GET.handler = {};
 * options.rest.GET.handler.count = function(req, res, next, data) {
 *   var collection = data.mongodb.collection;
 *   var query = data.rest.query;
 *   collection.count(query.q, query.options, function(err, result) {
 *     if (err) next(err);
 *     res.json({count: result};
 *   });
 * };
 * 
 * // (options_post) POST options
 * options.rest.POST = {};
 * options.rest.POST.method = 'insertMany';
 *
 * // (options_post) POST options
 * options.rest.PUT = {};
 * options.rest.PUT.method = 'updateMany';
 *
 * // (options_delete) DELETE options
 * options.rest.DELETE = {};
 * options.rest.DELETE.method = 'deleteMany';
 *
 * // (app) Create express app
 * var app = express();
 *
 * // (app_middleware) Add MongoDB REST API on localhost:3000/api
 * app.use('/api', api(options);
 * app.use('/api/:collection', api(options)); // enable other collections
 * app.use('/api/:database/:collection', api(options)); // enable other databases and collections
 * app.use('/api/:database/:collection/:method', api(options)); // enable other databases, collections, and methods
 *
 * // (app_start) Listen on localhost:3000
 * app.listen(3000);
 *
 */
module.exports = function(options) {
	options = options || {};
	
	// (options_express) Default express options
	options.express = options.express || {};
	options.express.database = options.express.database || 'database';
	options.express.collection = options.express.collection || 'collection';
	options.express.method = options.express.method || 'method';
	options.express.parse = options.express.parse || defaultParse;
	options.express.handler = options.express.handler || defaultHandler;
	options.express.deny = options.express.deny || {};
	options.express.deny.database = options.express.deny.database || ['admin'];
	options.express.deny.collection = options.express.deny.collection || [];
	options.express.deny.method = options.express.deny.method || [];
	options.express.deny.code = options.express.deny.code || 400;
	options.express.allow = options.express.allow || {};
	options.express.allow.database = options.express.allow.database || [];
	options.express.allow.collection = options.express.allow.collection || [];
	options.express.allow.method = options.express.allow.method || [];
	options.express.allow.code = options.express.allow.code || 400;
	
	// (options_mongodb) Default mongodb options
	options.mongodb = options.mongodb || {};
	options.mongodb.connection = options.mongodb.connection || process.env.MONGODB_CONNECTION || 'mongodb://localhost:27017';
	options.mongodb.options = options.mongodb.options || process.env.MONGODB_OPTIONS;
	options.mongodb.database = options.mongodb.database || process.env.MONGODB_DATABASE || 'test';
	options.mongodb.collection = options.mongodb.collection || process.env.MONGODB_COLLECTION || 'express_mongodb_rest';
	
	// (options_mongodb_parse) Parse defaults if needed
	if (typeof options.mongodb.options == 'string') {
		options.mongodb.options = JSON.parse(options.mongodb.options);
	}
	
	// (options_rest) Default REST options
	options.rest = options.rest || {'GET': {}};
	for (var METHOD in options.rest) {
		
		// (options_rest_defaults) Set default REST options
		options.rest[METHOD].database = options.rest[METHOD].database || options.mongodb.database;
		options.rest[METHOD].collection = options.rest[METHOD].collection || options.mongodb.collection;
		options.rest[METHOD].method = options.rest[METHOD].method || 'find';
		options.rest[METHOD].handler = options.rest[METHOD].handler || {};
		options.rest[METHOD].handler[options.rest[METHOD].method] = options.rest[METHOD].handler[options.rest[METHOD].method] || options.express.handler;
	}
	
	// (mongodb) Connect to mongodb using connection pooling
	var Client;
	mongoClient.connect(options.mongodb.connection, options.mongodb.options, function(err, client) {
		Client = client;
	});
	
	// (middleware) Express middleware function 
	var middleware = function(req, res, next) {
		
		// (middleware_options) Setup REST 
		var rest = options.rest[req.method];
		rest.database = req.params[options.express.database] || rest.database;
		rest.collection = req.params[options.express.collection]|| rest.collection;
		rest.method = req.params[options.express.method] || rest.method;
		if (Object.keys(req.query).length > 0) {
			rest.query = req.query;
		};
		rest.query = options.express.parse(rest.query);
		
		// (middleware_deny) Check for denied databases, collections, and methods
		deny(rest.database, options.express.deny.database,  options.express.deny.code, res); // deny databases
		deny(rest.collection, options.express.deny.collection,  options.express.deny.code, res); // deny collections
		deny(rest.method, options.express.deny.method,  options.express.deny.code, res); // deny methods
		
		// (middleware_allow) Check for allowed databases, collections, and methods
		allow(rest.database, options.express.allow.database,  options.express.allow.code, res); // not allowed databases
		allow(rest.collection, options.express.allow.collection,  options.express.allow.code, res); // not allowed collections
		allow(rest.method, options.express.allow.method,  options.express.allow.code, res); // not allowed methods
		
		// (middleware_call) Call methods handler
		if (rest.query !== undefined && Object.keys(rest.query).length > 0) {
			var data = {};
			data.rest = rest;
			data.mongodb = {};
			data.mongodb.client = Client;
			data.mongodb.database = data.mongodb.client.db(rest.database);
			data.mongodb.collection = data.mongodb.database.collection(rest.collection);
			rest.handler[rest.method](req, res, next, data);
		} else {
			res.end();
		}
	};
	return(middleware);
};
