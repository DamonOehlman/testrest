# testrest

testREST is a testing helper that is designed to make the process of testing
your REST application easier to write and easier to read. A simple
[YAML](http://www.yaml.org/) definition file format is used to describe tests.


[![NPM](https://nodei.co/npm/testrest.png)](https://nodei.co/npm/testrest/)

[![Build Status](https://img.shields.io/travis/DamonOehlman/testrest.svg?branch=master)](https://travis-ci.org/DamonOehlman/testrest)

[![browser support](https://ci.testling.com/DamonOehlman/testrest.png)](https://ci.testling.com/DamonOehlman/testrest)


## Example Usage

First a `.yaml` file is defined for the test that you want to run. Displayed
below is an example from the testrest tests:

```yaml
- it: should be able to send headers to a server
  get: /echo-headers
  
  headers:
    foo: bar
    
  expect:
    status: 200
    body:
      foo: bar

- it: should be able to send cookies to a server
  get: /echo-cookies
  
  cookies:
    foo: bar
    
  expect:
    status: 200
    body:
      foo: bar
```

Now the above tests a designed to test a simple server that echos header values
and cookie values back in a JSON response, and when run in conjuction with the
following mocha test file, will execute successfully:

```js
var testrest = require('testrest');

describe('header tests', testrest('headers', {
  server: require('./server/headers')
}));
```

## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
