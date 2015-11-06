/**
 * Created on 11/4/2015.
 */


(function(angular) {

  'use strict';

  autorejectProvider.$inject = ['$provide'];
  function autorejectProvider($provide) {

    var defaults = {
          timeoutInterval: 5000,
          logTimeouts: false
        },
        settings;

    timeoutQDecorator.$inject = ['$delegate', '$rootScope', '$log'];
    function timeoutQDecorator($delegate, $rootScope, $log) {

      var constructor = $delegate,
          error       = new Error('Promise has been rejected due to a timeout.'),
          timeout     = function timeoutPromise() {
            return constructor(function(resolve, reject) {
              setTimeout(function() {

                $rootScope.$apply(function() {
                  reject(error);
                });
              }, settings.timeoutInterval);
            });
          },
          race        = function race(promises) {
            return constructor(function(resolve, reject) {
              angular.forEach(promises, function(promise) {
                promise.then(resolve, reject);
              })
            })
          },
          autorejectDefer       = function autorejectDefer() {
            var dfd = $delegate.defer();

            race([dfd.promise, timeout()])
              .then(dfd.resolve, function(reason) {

                if (reason === error && settings.logTimeouts) {
                  $log.error(error);
                }

                dfd.reject(error);
              });

            return dfd;
          },
          autorejectQ = function autorejectQ(resolver) {
            var dfd = autorejectDefer();

            resolver(dfd.resolve, dfd.reject);

            return dfd.promise;
          };

      autorejectQ.defer = autorejectDefer;

      // copying all non-overridden methods from original $q service.
      angular.forEach($delegate, function(method, name) {
        if (angular.isFunction(method) && !autorejectQ[name]) {
          autorejectQ[name] = method;
        }
      });

      return autorejectQ;
    }

    this.config = function(config) {
      settings = angular.extend({}, defaults, config);
    };

    this.$get = function $get() {
      // nothing to provide here
    };

    $provide.decorator('$q', timeoutQDecorator);
  }

  angular
    .module('ng-autoreject-promises', [])
    .provider('autoreject', autorejectProvider);

})(window.angular);
