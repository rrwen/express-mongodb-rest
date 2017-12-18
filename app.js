var express = require('express');
var mongoREST = require('./index.js');

// (options) Initialize options object
var options = {mongodb: {}, rest: {}};

// (connection_mongodb) Setup mongodb connection
// Format: 'mongodb://<user>:<password>@<host>:<port>'
options.mongodb.connection = 'mongodb://localhost:27017';

// (options_get) Setup REST options for GET
options.rest.GET = {};
options.rest.GET.database = 'test';
options.rest.GET.collection = 'twitter_data';
options.rest.GET.method = 'find';

// (options_get_limit) Limit documents returned by GET to 100
// Note: args[0] is the parsed query JSON object from the url request
options.rest.GET.callback = function(result, args){return result.limit(2);};

// (options_get) Setup REST options for GET
var options2 = {mongodb: {}, rest: {}};
options2.mongodb.connection = 'mongodb://localhost:27017';
options2.rest.GET = {};
options2.rest.GET.database = 'test';
options2.rest.GET.collection = 'twitter_data';
options2.rest.GET.method = 'find';
options2.rest.GET.callback = function(result, args){return result.limit(10);};


// (app) Create express app with middleware
var app = express();
var REST = mongoREST(options);
var REST2 = mongoREST(options2);
app.use('/api', REST);
app.use('/api2', REST2);
app.listen(3000);