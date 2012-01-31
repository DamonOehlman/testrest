# testREST - REST API Testing Solution

__NOTE:__ _testREST is currently a work in progress, feel free to use it, and please report issues, but don't get upset when it doesn't quite do what you expect it to._

testREST is a helper for writing unit tests against a REST API.  It's been written to fill a gap in current testing solutions for testing a REST API.  While a [few people](http://stackoverflow.com/questions/203495/testing-rest-webservices) are happy using [SoapUI](http://www.soapui.org/) for testing webservices in general, I think things could be better.

testREST is an experiment at determining if this is the case.  In testREST you:

1. Define your tests with plain text files in a simple format
2. Use [mocha](https://github.com/visionmedia/mocha) to run your tests

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

You will see here the call to `testrest` in place of a function for the test suite body as part of the describe statement.  What is happening here is the call to `testrest` returns a suite of tests generated from the rules contained within the `.txt` file partner for the current `.js` that is executing.  Have a look in the test folder of this repository, you'll get the picture.

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