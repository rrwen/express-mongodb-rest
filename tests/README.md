# express-mongodb-rest

Richard Wen  
rrwen.dev@gmail.com  

* [Documentation](https://rrwen.github.io/express-mongodb-rest)

Express middleware for MongoDB REST APIs

[![npm version](https://badge.fury.io/js/express-mongodb-rest.svg)](https://badge.fury.io/js/express-mongodb-rest)
[![Build Status](https://travis-ci.org/rrwen/express-mongodb-rest.svg?branch=master)](https://travis-ci.org/rrwen/express-mongodb-rest)
[![Coverage Status](https://coveralls.io/repos/github/rrwen/express-mongodb-rest/badge.svg?branch=master)](https://coveralls.io/github/rrwen/express-mongodb-rest?branch=master)
[![npm](https://img.shields.io/npm/dt/express-mongodb-rest.svg)](https://www.npmjs.com/package/express-mongodb-rest)
[![GitHub license](https://img.shields.io/github/license/rrwen/express-mongodb-rest.svg)](https://github.com/rrwen/express-mongodb-rest/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/rrwen/express-mongodb-rest.svg?style=social)](https://twitter.com/intent/tweet?text=Express%20middleware%20for%20MongoDB%20REST%20APIs:%20https%3A%2F%2Fgithub.com%2Frrwen%2Fexpress-mongodb-rest%20%23nodejs%20%23npm)

## Test Environment

The test environment creates an isolated MongoDB database named `twitter2mongodb_database` to run tests on.

To connect to Twiter and MongoDB, a `.env` file is required:

1. Create a `.env` file in the root directory
2. Use the template below to provide Twitter credentials and MongoDB connection details inside the `.env` file
3. Ensure that `twitter2mongodb_database` does not exist (otherwise it will be dropped after tests)

```
TWITTER_CONSUMER_KEY=***
TWITTER_CONSUMER_SECRET=***
TWITTER_ACCESS_TOKEN_KEY=***
TWITTER_ACCESS_TOKEN_SECRET=***
MONGODB_CONNECTION=mongodb://localhost:27017
MONGODB_TESTDATABASE=twitter2mongodb_database
MONGODB_COLLECTION=twitter_data
```

The [Tests](../README.md#tests) can then be run with the following command:

```
npm test
```