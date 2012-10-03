# testREST - REST API Testing Solution

testREST is a testing helper that is designed to make the process of testing your REST application easier to write and easier to read. A simple [YAML](http://www.yaml.org/) definition file format is used to describe tests.  For example:

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

Now the above tests a designed to test a simple server that echos header values and cookie values back in a JSON response, and when run in conjuction with the following mocha test file, will execute successfully:

```js
var testrest = require('testrest');

describe('header tests', testrest('headers', {
  server: require('./server/headers')
}));
```

There are a few things going on here, which will be explained in more detail in the upcoming testREST docs.  In the meantime, feel free to have a look at the tests in this repository or hack through the code.