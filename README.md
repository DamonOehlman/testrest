# testREST - REST API Testing Solution

testREST is a helper for writing unit tests against a REST API.  It's been written to fill a gap in current testing solutions for testing a REST API.  While a [few people](http://stackoverflow.com/questions/203495/testing-rest-webservices) are happy using [SoapUI](http://www.soapui.org/) for testing webservices in general, I think things could be better.

testREST is an experiment at determining if this is the case.  In testREST you:

1. Define your tests with plain text files in a simple format
2. Use [mocha](https://github.com/visionmedia/mocha) to run your tests

The library is very much under development at this stage, but it would be great to get some feedback on the proposed spec file format:

```
# test description
METHOD /uri
> Send-Header: value
request body text

EXPECT code
< Expected-Header: value
response body
```

Here are some examples:

```
# returns a 404 for /does-not-exist
GET /does-not-exist
EXPECT 404
```