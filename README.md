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

## Install

1. Install [MongoDB](https://www.mongodb.com/)
2. Install [Node.js](https://nodejs.org/en/)
3. Install [express](https://www.npmjs.com/package/express) and [express-mongodb-rest](https://www.npmjs.com/package/express-mongodb-rest) via `npm`

```
npm install --save express express-mongodb-rest
```

For the latest developer version, see [Developer Install](#developer-install).

## Usage

An example usage of express-mongodb-rest:

```
var mongoREST = require('express-mongodb-rest');
```

See [Documentation](https://rrwen.github.io/express-mongodb-rest) for more details.

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
4. Run tests
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
2. Run tests and check for OK status
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
[express](https://www.npmjs.com/package/express) | Serve REST API application and translate query string URL to JSON
[mongodb](https://www.npmjs.com/package/mongodb) | Query MongoDB database using JSON

```
 express      <-- Handle requests and responses
    |
 mongodb      <-- query response
```
