// Richard Wen
// rrwen.dev@gmail.com

var mongoClient = require('mongodb').MongoClient
var mongoQuerystring = require('mongo-querystring');

/**
 * Description.
 *
 * @module express-mongodb-rest
 *
 * @param {Object} req parameter description.
 * @param {Object} res parameter description.
 * @param {function} next parameter description.
 *
 * @returns {Object} return description.
 *
 * @example
 * var expressmongodbrest = require('express-mongodb-rest');
 */
module.exports = function(options) {
	var out = {};
	
	// (options) Default options
	options = options || {};
	options.url = options.url || 'mongodb://localhost:27017';
	options.database = options.database || 'test';
	options.collection = options.collection || 'express_mongodb_rest';
	
	// (middleware) Express middleware function 
	out.middleware = function(req, res, next) {
		
		// (middleware_parse) Parse url request to mongodb query
		var query = mongoQuerystring.parse(req.query);
		
		// (middleware_query) Query mongodb database
		mongoClient.connect(options.url, function(err, client) {
			var collection = client.db(options.database).collection(options.collection);
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
