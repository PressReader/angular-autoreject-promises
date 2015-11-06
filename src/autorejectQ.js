/**
 * Created on 11/4/2015.
 */


(function(angular) {

  'use strict';

  autorejectProvider.$inject = ['$provide'];
  function autorejectProvider($provide) {

    var defaults = {
          /**
           * Specifies an amount of time in milliseconds to wait,
           * until promise will be automatically rejected.
           */
          timeoutInterval: 5000,

          /**
           * boolean flag, to indicate whether rejections by timeout should be
           * written to $log service or not.
           */
          logTimeouts: false,

          /**
           * If set to false, this provider will not add timeout functionality
           * to $q service. It is recommended to enable this provider for debug purposes only.
           */
          enable: false
        },
        /**
         * current settings used by provider.
         */
        settings = defaults;

    timeoutQDecorator.$inject = ['$delegate', '$rootScope', '$log'];
    function timeoutQDecorator($delegate, $rootScope, $log) {

      var $Q              = $delegate,
          error           = new Error('Promise has been rejected due to a timeout.'),
          /**
           * this function creates a promise that gets automatically rejected
           * after timeout occurs.
           * @returns {Promise} - promise object.
           */
          timeout         = function timeoutPromise() {
            return $Q(function(resolve, reject) {
              setTimeout(function() {

                $rootScope.$apply(function() {
                  reject(error);
                });
              }, settings.timeoutInterval);
            });
          },
          /**
           * A naive implementation of Promise.race .
           * see
           * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race}
           * for details.
           * @param {Array<Promise>} promises - array of promises
           * @returns {Promise} - promise, gets resolved or rejected as soon as any promise fulfills/rejects.
           */
          race            = function race(promises) {
            return $Q(function(resolve, reject) {
              angular.forEach(promises, function(promise) {
                promise.then(resolve, reject);
              })
            })
          },
          /**
           * Creates a `Autorejected Deferred` object which represents a task which will finish in the future.
           * if task is not completed after a specified amount of time it will automatically be rejected.
           *
           * @returns {Deferred} Returns a new instance of deferred.
           */
          autorejectDefer = function autorejectDefer() {

            if (!settings.enable) return $Q.defer();

            var dfd = $Q.defer();

            race([dfd.promise, timeout()])
            // specification allows multiple resolve calls on the same defer
            // only first will matter, all other will simply be ignored.
              .then(dfd.resolve, function(reason) {

                if (reason === error && settings.logTimeouts) {
                  $log.error(error);
                }

                dfd.reject(error);
              });

            return dfd;
          };

      // service implementation
      var $service = function $service(resolver) {

        if (!settings.enable) return $Q(resolver);

        var dfd = autorejectDefer();

        resolver(dfd.resolve, dfd.reject);

        return dfd.promise;
      };

      // copying all methods from original $q service.
      angular.forEach($delegate, function(method, name) {
        $service[name] = method;
      });

      $service.defer = autorejectDefer;

      return $service;
    }

    /**
     * Configures this provider.
     * @param {Object} config - configuration settings.
     * @param {Number} config.timeoutInterval - Specifies an amount of time in milliseconds to wait,
     * until promise will be automatically rejected.
     * @param {Boolean} config.logTimeouts - indicates whether rejections by timeout should be
     * written to $log service or not.
     */
    this.config = function(config) {
      settings = angular.extend({}, settings, config);
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
