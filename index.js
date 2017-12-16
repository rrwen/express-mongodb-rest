// Richard Wen
// rrwen.dev@gmail.com

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
 * var expressmongodbrest = require('express-mongodb-rest');
 */
module.exports = function(options) {
	var out = {};
	options = options || {};
	
	// (options_mongodb) Default mongodb options
	options.mongodb = options.mongodb || {};
	options.mongodb.url = options.mongodb.url || 'mongodb://localhost:27017';
	options.mongodb.database = options.mongodb.database || 'test';
	options.mongodb.collection = options.mongodb.collection || 'express_mongodb_rest';
	
	// (middleware) Express middleware function 
	out.middleware = function(req, res, next) {
		
		// (middleware_parse) Parse url request to mongodb query
		var query = mongoQuerystring.parse(req.query);
		
		// (middleware_query) Query mongodb database
		mongoClient.connect(options.mongodb.url, function(err, client) {
			var collection = client.db(options.mongodb.database).collection(options.mongodb.collection);
			if (err) next(err); // connect error
			collection.find(query).toArray(function(err, docs) {
				if (err) next(err); // query error
				res.json(docs);
			});
		});
	};
	
	// (app) Express built in app
	out.app = {};
	return(out);
};
