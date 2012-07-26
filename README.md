# testREST - REST API Testing Solution

__NOTE:__ _testREST is currently a work in progress, feel free to use it, and please report issues, but don't get upset when it doesn't quite do what you expect it to._

<a href="http://travis-ci.org/#!/DamonOehlman/testrest"><img src="https://secure.travis-ci.org/DamonOehlman/testrest.png" alt="Build Status"></a>

testREST is a helper for writing unit tests against a REST API.  It's been written to fill a gap in current testing solutions for testing a REST API.  While a [few people](http://stackoverflow.com/questions/203495/testing-rest-webservices) are happy using [SoapUI](http://www.soapui.org/) for testing webservices in general, I think things could be better.

testREST is an experiment at determining if this is the case.  In testREST you:

1. Define your tests with plain text files in a simple format
2. Use [mocha](https://github.com/visionmedia/mocha) to run your tests

## Alternative (Good) Solutions

Some good alternatives to testrest are:

- [nock](https://github.com/pgte/nock) (thanks to [dscape](http://twitter.com/dscape) for the tip).

## Installing

You can install testrest into a node project like so using `npm`: 

```
npm install testrest
```

In reality, though you probably want to add it into your `package.json` file as a dev dependency so users of your library / application aren't required to download the package, e.g.:

```json
{
  "name": "package-name",
    
  ..
  
  "dependencies": {
  }
  
  "devDependencies": {
    "testrest": "*"
  },

  ..
}
```

## Spec File Format

The library is very much under development at this stage, but it would be great to get some feedback on the proposed spec file format:

Displayed below is the spec file format that is currently being used.  A spec file allows for the definition of multiple end-point tests which will be executed sequentially.

```
# test description 1
METHOD /uri
> Send-Header: value
request body text

EXPECT code
< Expected-Header: value
response body

# test description 2
METHOD /uri/2
> Send-Header: value
request body text

EXPECT code
< Expected-Header: value
response body
```

### Spec File Examples

```
# returns a 404 for /does-not-exist
GET /does-not-exist
EXPECT 404

# returns Hi for /
GET /

EXPECT 2xx
Hi
< Server: restify
```

## JSON Response Parsing

If you specify JSON as the expected body of your response then a [chai.js](http://chaijs.com/) [deepEqual](http://chaijs.com/code/assert.html#deepEqual) is used to validate the response matches your expected response rather than a simple `equal` test.  

The behaviour of this checking is selective also.  That is only the sections of the JSON response that you specify in the test will be checked against the response.  For instance, the following tests both return true:

```
# returns valid JSON for /json-test
GET /json-test
EXPECT 2xx
{
    "first": "Roger",
    "last": "Rabbit"
}

# partial JSON tests are ok too
GET /json-test
EXPECT 2xx
{
    "first": "Roger"
}
```

## Creating Test Wrappers

When using Mocha, you define your tests in a number of `.js` files and Mocha intelligently turns these into it's own internal test representation, so without some simple glue Mocha is not going to interpret out `.txt` files as tests that need to be run.

We fix this by creating a simple wrapper file.  Shown below is an example from the [Sidelab Pointifex Reference Server](https://github.com/pointifex/reference-server) test suite:

```js
var testrest = require('testrest'),
    server = require('../lib/server');
    
describe('pointifex reference server tests', function() {
    before(function(done) {
        server.run(done);
    });
    
    // describe the details interface
    describe('details interface', testrest('details'));    
});
```

You will see here the call to `testrest` in place of a function for the test suite body as part of the describe statement.  

In this particular case a named test suite is being pulled in in the `testrest` call and a mocha test suite is returned.  The `testrest` function can also be used to return the testsuite that relates to the currently executing `.js` wrapper by simply calling `testrest()` with no arguments.

If you want to use a different `.txt` file that one that matches the current `.js` file, then you can provide the name of the alternative suite to the `testrest` function call.

Running the above test (using `mocha --reporter spec`) would provide the following output:

```
GET tests
  ✓ can load the definition file: simple-get.txt 
  ✓ can parse the definition file 
  ✓ loads the rules as new tests 
  ✓ returns a 404 for /does-not-exist 
  ✓ returns Hi for / 


✔ 5 tests complete (19ms)
```