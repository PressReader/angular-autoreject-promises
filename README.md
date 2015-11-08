# angular-autoreject-promises
Adds promise auto-rejection by timeout to $q service.

It is often useful to get some promises rejected after a significant amount of time passed on wait. If something went wrong and promise 'hanged' we could possibly never know of that and spend a couple of hours debugging code and trying to understand what's going on. 

```js
var waitForSignal = function() {
  return $q(function(resolve, reject) {
    // if someone forget to resolve/reject this promise
    // it hangs and never gets resolved
  });
});

return waitForSignal;
```

or in case of AJAX request is sent
```js

var sendRequest = function() {
    // if server is unresponsive, this hangs as well
    return $http.get('/some/url');
});

```

This is where auto-rejection comes to play. If promise is neither resolved nor rejected after the specified amount of time, it gets rejected with a timeout error and other modules subscribed to this promise will be notified.

```js
  var sendRequest = function() {
    return $http
    .get('/some/url')
    .catch(function(reason) {
      // handle reason and resend request or cancel it
      if (autoreject.isTimeoutError(reason)) {
      
      }
    });
  });
```

Production-ready code is usually free from these errors, but for debug purposes when working with the latest code from develoment branches we find it extremely useful.

# Install

Currently, no Bower package is available - we still don't sure whether this package is useful to anybody except us. Once we see a demand, we will create a separate package. Before that, this module can still be added via a direct link to github:

_bower.json_
```js
{
  'angular-autoreject-promises': 'pressreader/angular-autoreject-promises'
}
```

Otherwise, just clone this repository and grab *src/autorejectQ.js* file.

Do not forget to add script to your default *index.html* file. We recommend to use Bower and [wiredep](https://github.com/taptapship/wiredep) to manage dependencies in your app, but it is totally up to you.

```html
<script src="autorejectQ.js"></script>
```


# Example

```js

// add module dependency
var module = angular.module('myApp', ['angular-autoreject-promises']);

// configure autoreject provider
module.config(function(autorejectProvider) {
  autorejectProvider.config({
    // this will enable autoreject functionality. 
    enable: true,
    // allow 15 sec wait before promise gets rejected
    timeoutInterval: 15000, 
    // all timeouts will be logged via $log service
    logTimeouts: true
  });
});

// sample service
module.factory('sampleService', function($timeout, $q, autoreject) {

  var simulateLongWaitPromise = $q(function(resolve, reject) {
    $timeout(function() {
      resolve();
    }, 20000);
  });
  
  return simulateLongWaitPromise.then(function() {
    // if autorejection works, we should never see this message in the console
    console.log('data loaded');
  })
  .catch(function(reason) {
    if autoreject.isTimeoutError(reason) {
      // do something with timeout
    }
  });
});

```


## LICENSE
The MIT License (MIT)

Copyright (c) 2015 PressReader

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

