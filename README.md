# angular-autoreject-promises
Adds promise auto-rejection by timeout to $q service.

# Install

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
module.factory('sampleService', function($timeout, $q) {

  var simulateLongWaitPromise = $q(function(resolve, reject) {
    $timeout(function() {
      resolve();
    }, 20000);
  });
  
  return simulateLongWaitPromise.then(function() {
    // if autorejection works, we should never see this message in the console
    console.log('data loaded');
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

