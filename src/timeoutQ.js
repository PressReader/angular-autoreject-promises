/**
 * Created on 11/4/2015.
 */
angular
  .module('myApp', [])
  .config(function($provide) {
    var TIMEOUT_INTERVAL = 5 * 1000;
    $provide.decorator('$q', function($delegate, $rootScope) {
      // Extend promises with non-returning handlers
      //function decoratePromise(promise) {
      //  promise._then = promise.then;
      //  promise.then = function(thenFn, errFn, notifyFn) {
      //    var p = promise._then(thenFn, errFn, notifyFn);
      //    return decoratePromise(p);
      //  };
      //
      //  promise.success = function(fn) {
      //    promise.then(function(value) {
      //      fn(value);
      //    });
      //    return promise;
      //  };
      //  promise.error = function(fn) {
      //    promise.then(null, function(value) {
      //      fn(value);
      //    });
      //    return promise;
      //  };
      //  return promise;
      //}
      //
      //var defer = $delegate.defer,
      //  when = $delegate.when,
      //  reject = $delegate.reject,
      //  all = $delegate.all;
      //$delegate.defer = function() {
      //  var deferred = defer();
      //  decoratePromise(deferred.promise);
      //  return deferred;
      //};
      //$delegate.when = function() {
      //  var p = when.apply(this, arguments);
      //  return decoratePromise(p);
      //};
      //$delegate.reject = function() {
      //  var p = reject.apply(this, arguments);
      //  return decoratePromise(p);
      //};
      //$delegate.all = function() {
      //  var p = all.apply(this, arguments);
      //  return decoratePromise(p);
      //};

      var defer = $delegate.defer;

      $delegate.defer = function() {

        var dfd = defer();
        setTimeout(function() {
          var error = new Error('Promise rejected due to a timeout.');
          console.error(error);
          $rootScope.$apply(function() {
            dfd.reject(error);
          });
        }, TIMEOUT_INTERVAL);

        return dfd;
      };

      return $delegate;
    });
  });
