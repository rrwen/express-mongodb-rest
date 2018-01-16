# express-mongodb-rest

Richard Wen  
rrwen.dev@gmail.com  

* [Documentation](https://rrwen.github.io/express-mongodb-rest)
* [Changes](#changes)

Express middleware for MongoDB REST APIs

[![npm version](https://badge.fury.io/js/express-mongodb-rest.svg)](https://badge.fury.io/js/express-mongodb-rest)
[![Build Status](https://travis-ci.org/rrwen/express-mongodb-rest.svg?branch=master)](https://travis-ci.org/rrwen/express-mongodb-rest)
[![Coverage Status](https://coveralls.io/repos/github/rrwen/express-mongodb-rest/badge.svg?branch=master)](https://coveralls.io/github/rrwen/express-mongodb-rest?branch=master)
[![npm](https://img.shields.io/npm/dt/express-mongodb-rest.svg)](https://www.npmjs.com/package/express-mongodb-rest)
[![GitHub license](https://img.shields.io/github/license/rrwen/express-mongodb-rest.svg)](https://github.com/rrwen/express-mongodb-rest/blob/master/LICENSE)
[![Donarbox Donate](https://img.shields.io/badge/donate-Donarbox-yellow.svg)](https://donorbox.org/rrwen)
[![PayPal Donate](https://img.shields.io/badge/donate-PayPal-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=NQNSAHK5X46D2)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/rrwen/express-mongodb-rest.svg?style=social)](https://twitter.com/intent/tweet?text=Express%20middleware%20for%20MongoDB%20REST%20APIs:%20https%3A%2F%2Fgithub.com%2Frrwen%2Fexpress-mongodb-rest%20%23nodejs%20%23npm)

## Install

1. Install [MongoDB](https://www.mongodb.com/)
2. Install [Node.js](https://nodejs.org/en/)
3. Install [express](https://www.npmjs.com/package/express) and [express-mongodb-rest](https://www.npmjs.com/package/express-mongodb-rest) via `npm`
4. **Recommended:** Install [dotenv](https://www.npmjs.com/package/dotenv) to load environmental variables

```
npm install --save express express-mongodb-rest
npm install --save dotenv
```

For the latest developer version, see [Developer Install](#developer-install).

## Usage

This package provides a flexible, customizable, and low-dependency Representational State Transfer (REST) Application Programming Interface (API) for [mongodb](https://www.npmjs.com/package/mongodb) using [express](https://www.npmjs.com/package/express).  
  
It is recommended to use a `.env` file at the root of your project directory with the following contents:

* `MONGODB_CONNECTION`: MongoDB [connection string](https://docs.mongodb.com/manual/reference/connection-string/)
* `MONGODB_DATABASE`: MongoDB database name

```
MONGODB_CONNECTION=mongodb://localhost:27017
MONGODB_DATABASE=test
```

The `.env` file above can be loaded using [dotenv](https://www.npmjs.com/package/dotenv):

```javascript
require('dotenv').config();
```

See [Documentation](https://rrwen.github.io/express-mongodb-rest) for more details.

### GET (Default)

Method | Route | Function | Query | Description
--- | --- | --- | --- | ---
GET | /api/:collection?q={"field":"value"} | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {field: "value"} | Find all documents with `field=value`
GET | /api/:collection?q={"field":{"$exists":"value"}} | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {field: {$exists: "value"}} | Find all documents where `field` exists
GET | /api/:collection?q={"$or":[{"field1":"value1"},{"field2":"value2"}]} | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {$or: [{field1: value1}, {field2: value2}]} | Find all documents with `field1=value1` or `field2=value2`

A simple `GET` API can be created with the following file named `app.js`:

```javascript
require('dotenv').config();

// (packages) Load required packages
var express = require('express');
var api = require('express-mongodb-rest')();

// (app) Create express app
var app = express();
app.use('/api/:collection', api); // add MongoDB REST API
app.listen(3000);
```

Run the file `app.js` defined above:

```
node app.js
```

Go to `localhost:3000/api/collection?q={"field":"value"}` with a web browser to use the API, where:

* `collection` is the name of the collection in your MongoDB database
* `field` is a field or key name in the `<collection>`
* `value` is the value in `field` to query for

### REST (Custom)

Method | Route | Function | Query | Description
--- | --- | --- | --- | ---
GET | /api/:collection | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {} | Find all documents in collection
POST | /api/:collection?docs=[{"field":"value"}]| [insertMany](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#insertMany)| [{field: "value"}]| Insert `[{field: "value"}]` into `:collection`
PUT | /api/:collection?q={"field":{"$exists":1}}&update={"$set":{"field":"newvalue"}} | [updateMany](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#updateMany) | {$set: {field: "newvalue"}} | Update `[{field: value}]` with `[{field: newvalue}]`
DELETE | /api/:collection?q={"field":{"$exists":1}} | [deleteMany](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#deleteMany) | {field: {$exists: 1}} | Delete all documents where `field` exists

A custom RESTful API can be created with the following file named `app.js`:

```javascript
require('dotenv').config();

// (packages) Load required packages
var express = require('express');
var api = require('express-mongodb-rest');

// (options) Initialize options object
var options = {rest: {}, mongodb: {}};

// (options_get) GET options
options.rest.GET = {};
options.rest.GET.method = 'find';
options.rest.GET.keys = ['q', 'options'];
options.rest.GET.query = [{}]; // return all if no query string provided

// (options_post) POST options
options.rest.POST = {};
options.rest.POST.method = 'insertMany';
options.rest.POST.keys = ['docs', 'options'];

// (options_put) PUT options
options.rest.PUT = {};
options.rest.PUT.method = 'updateMany';
options.rest.PUT.keys = ['q', 'update', 'options'];

// (options_delete) DELETE options
options.rest.DELETE = {};
options.rest.DELETE.method = 'deleteMany';
options.rest.DELETE.keys = ['q'];

// (app) Create express app
var app = express();
app.use('/api/:collection', api(options)); // add MongoDB REST API
app.listen(3000);
```

Run the file `app.js` defined above:

```
node app.js
```

Go to `localhost:3000/api/collection` with a web browser to use the API, where:

* `collection` is the name of the collection in your MongoDB database

### GET (Query String Format)

Method | Route | Function | Query | Description
--- | --- | --- | --- | ---
GET | /api/:collection?q[field]=value | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {field: "value"} | Find all documents with `field=value`
GET | /api/:collection?q[field][$exists]=value | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {field: {$exists: "value"}} | Find all documents where `field` exists
GET | /api/:collection?q[$or][0][field1]=value1&q[$or][1][field2]=value2 | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {$or: [{field1: value1}, {field2: value2}]} | Find all documents with `field1=value1` or `field2=value2`

A simple `GET` API with the [Express query string format](http://expressjs.com/en/api.html#req.query) can be created with the following file named `app.js`:

* **Recommended:** Install [express-query-int](https://www.npmjs.com/package/express-query-int) for numeric support `npm install --save express-query-int`

```javascript
require('dotenv').config();

// (packages) Load required packages
var express = require('express');
var api = require('express-mongodb-rest');
var queryInt = require('express-query-int');

// (options_mongodb) Use the base Express query string format
options = {mongodb: {}};
options.mongodb.parse = function(query) {return query;};

// (app) Create express app
var app = express();
app.use(queryInt()); // allow queries with numbers (optional)
app.use('/api/:collection', api(options)); // add MongoDB REST API
app.listen(3000);
```

Run the file `app.js` defined above:

```
node app.js
```

Go to `localhost:3000/api/collection?q[field]=value` with a web browser to use the API, where:

* `collection` is the name of the collection in your MongoDB database
* `field` is a field or key name in the `<collection>`
* `value` is the value in `field` to query for

### REST (Query String Format)

Method | Route | Function | Query | Description
--- | --- | --- | --- | ---
GET | /api/:collection | [find](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#find) | {} | Find all documents in collection
POST | /api/:collection?docs[0][field]=value| [insertMany](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#insertMany)| [{field: "value"}]| Insert `[{field: "value"}]` into `:collection`
PUT | /api/:collection?q[field][$exists]=1&update[$set][field]=newvalue | [updateMany](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#updateMany) | {$set: {field: "newvalue"}} | Update `[{field: value}]` with `[{field: newvalue}]`
DELETE | /api/:collection?q[field][$exists]=1 | [deleteMany](https://mongodb.github.io/node-mongodb-native/3.0/api/Collection#deleteMany) | {field: {$exists: 1}} | Delete all documents where `field` exists

A custom RESTful API with the [Express query string format](http://expressjs.com/en/api.html#req.query) can be created with the following file named `app.js`:

* **Recommended:** Install [express-query-int](https://www.npmjs.com/package/express-query-int) for numeric support `npm install --save express-query-int`

```javascript
require('dotenv').config();

// (packages) Load required packages
var express = require('express');
var api = require('express-mongodb-rest');
var queryInt = require('express-query-int');

// (options) Initialize options object
var options = {rest: {}, mongodb: {}};

// (options_mongodb) Use the base Express query string format
options.mongodb.parse = function(query) {return query;};

// (options_get) GET options
options.rest.GET = {};
options.rest.GET.method = 'find';
options.rest.GET.keys = ['q', 'options'];
options.rest.GET.query = [{}]; // return all if no query string provided

// (options_post) POST options
options.rest.POST = {};
options.rest.POST.method = 'insertMany';
options.rest.POST.keys = ['docs', 'options'];

// (options_put) PUT options
options.rest.PUT = {};
options.rest.PUT.method = 'updateMany';
options.rest.PUT.keys = ['q', 'update', 'options'];

// (options_delete) DELETE options
options.rest.DELETE = {};
options.rest.DELETE.method = 'deleteMany';
options.rest.DELETE.keys = ['q'];

// (app) Create express app
var app = express();
app.use(queryInt()); // allow queries with numbers (optional)
app.use('/api/:collection', api(options)); // add MongoDB REST API
app.listen(3000);
```

Run the file `app.js` defined above:

```
node app.js
```

Go to `localhost:3000/api/collection` with a web browser to use the API, where:

* `collection` is the name of the collection in your MongoDB database

## Contributions

### Report Contributions

Reports for issues and suggestions can be made using the [issue submission](https://github.com/rrwen/express-mongodb-rest/issues) interface.

When possible, ensure that your submission is:

* **Descriptive**: has informative title, explanations, and screenshots
* **Specific**: has details of environment (such as operating system and hardware) and software used
* **Reproducible**: has steps, code, and examples to reproduce the issue

### Code Contributions

Code contributions are submitted via [pull requests](https://help.github.com/articles/about-pull-requests/):

1. Ensure that you pass the [Tests](#tests)
2. Create a new [pull request](https://github.com/rrwen/express-mongodb-rest/pulls)
3. Provide an explanation of the changes

A template of the code contribution explanation is provided below:

```
## Purpose

The purpose can mention goals that include fixes to bugs, addition of features, and other improvements, etc.

## Description

The description is a short summary of the changes made such as improved speeds or features, and implementation details.

## Changes

The changes are a list of general edits made to the files and their respective components.
* `file_path1`:
	* `function_module_etc`: changed loop to map
	* `function_module_etc`: changed variable value
* `file_path2`:
	* `function_module_etc`: changed loop to map
	* `function_module_etc`: changed variable value

## Notes

The notes provide any additional text that do not fit into the above sections.
```

For more information, see [Developer Install](#developer-install) and [Implementation](#implementation).

## Developer Notes

### Developer Install

Install the latest developer version with `npm` from github:

```
npm install git+https://github.com/rrwen/express-mongodb-rest
```
  
Install from `git` cloned source:

1. Ensure [git](https://git-scm.com/) is installed
2. Clone into current path
3. Install via `npm`

```
git clone https://github.com/rrwen/express-mongodb-rest
cd express-mongodb-rest
npm install
```

### Tests

1. Clone into current path `git clone https://github.com/rrwen/express-mongodb-rest`
2. Enter into folder `cd express-mongodb-rest`
3. Ensure [devDependencies](https://docs.npmjs.com/files/package.json#devdependencies) are installed and available
4. Run tests with a `.env` file (see [tests/README.md](tests/README.md))
5. Results are saved to [tests/log](tests/log) with each file corresponding to a version tested

```
npm install
npm test
```

### Documentation

Use [documentationjs](https://www.npmjs.com/package/documentation) to generate html documentation in the `docs` folder:

```
npm run docs
```

See [JSDoc style](http://usejsdoc.org/) for formatting syntax.

### Upload to Github

1. Ensure [git](https://git-scm.com/) is installed
2. Inside the `express-mongodb-rest` folder, add all files and commit changes
3. Push to github

```
git add .
git commit -a -m "Generic update"
git push
```

### Upload to npm

1. Update the version in `package.json`
2. Run tests and check for OK status (see [tests/README.md](tests/README.md))
3. Generate documentation
4. Login to npm
5. Publish to npm

```
npm test
npm run docs
npm login
npm publish
```

### Implementation


The module [express-mongodb-rest](https://www.npmjs.com/package/express-mongodb-rest) uses the following [npm](https://www.npmjs.com/) packages for its implementation:

npm | Purpose
--- | ---
[express](https://www.npmjs.com/package/express) | Serve REST API application to handle query string requests and data responses
[mongodb](https://www.npmjs.com/package/mongodb) | Query MongoDB database using query string requests

```
 express      <-- Handle query requests and JSON responses
    |
 mongodb      <-- query data using request
```

### Changes

#### v3.0.0

* Methods are now available in the route parameters (`/:method`)
* Modified `options.mongodb.method` to be the default method
* Added `options.mongodb.methods` and `options.rest.methods` as Objects defining functions that are called before and after a query
* Added `options.express.method` for defining the route parameter name (such as `/:method`) for the collection method used
* Removed `options.mongodb.callback` and `options.rest.<METHOD>.callback`
* Removed `options.mongodb.parse` and `options.rest.<METHOD>.parse`
* Removed `options.rest.<METHOD>.database`

#### v2.5.0

* Now uses [connection pooling](https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling) for faster queries
* Removed `options.express.database`, you can no longer access at the database level through urls
* Removed `options.express.deny.database` and `options.express.allow.database` as user now has to manually set the database
* Added `options.mongodb.options` for connection options

#### v2.0.0

* Default now uses JSON object format for url queries (`q={"field":"value"}` instead of `q[field]=value`)
* Both JSON object format and query string formats supported
* Added option to change response codes for `options.express.deny.code` and `options.express.allow.code` (See [Documentation](https://rrwen.github.io/express-mongodb-rest))

#### v1.0.0

* Initial release
* Default is query string format for url queries (`q[field]=value`)
