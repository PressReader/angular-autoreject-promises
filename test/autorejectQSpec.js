/**
 * Created on 11/4/2015.
 */

describe('timeoutQ', function() {

  'use strict';

  var $timeout,
      $q,
      $log,
      timeoutInterval = 1000,
      clock,
      emptyPromiseFactories = [
        /* $q.defer promises */
        function(resolveResult) {
          var defer = $q.defer();
          if (resolveResult) defer.resolve(resolveResult());
          return defer.promise;
        },
        /* native style promises */
        function(resolveResult) { return $q(function(resolve) { if (resolveResult) resolve(resolveResult()); }); }
      ];

  beforeEach(module('ng-autoreject-promises', ['autorejectProvider', function(_autorejectProvider_) {
    var provider = _autorejectProvider_;
    provider.config({
      logTimeouts: true,
      timeoutInterval: timeoutInterval
    });
  }]));

  beforeEach(inject(function(_$timeout_, _$q_, _$log_) {
    $timeout = _$timeout_;
    $q       = _$q_;
    $log     = _$log_;
  }));

  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock && clock.restore();
    $log.reset();
  });

  function flatten(arr) {
    return arr.reduce(function(a, b) {
      return a.concat(b);
    }, []);
  };

  angular.forEach(emptyPromiseFactories, function(promiseFactory) {
    it('keeps a promise in pending state if no timeout happened', function() {
      // Arrange
      var promise = promiseFactory();

      // Act
      clock.tick(timeoutInterval - 1);

      // Assert
      promise.should.have.deep.property('$$state.status', 0);
    });

    it('rejects a promise after a specified amount of time', function() {
      // Arrange
      var promise = promiseFactory();

      // Act
      clock.tick(timeoutInterval);

      // Assert
      return promise.should.be.rejected && $timeout.flush();
    });

    it('rejects a promise and writes error information to $log service', function() {
      // Arrange
      var promise = promiseFactory();

      // Act
      clock.tick(timeoutInterval);

      // Assert
      var error = flatten($log.error.logs).pop();

      assert.isDefined(error, 'No error messages logged during promise rejection process.');
      error.should.be.an.instanceOf(Error);
      error.should.have.property('message', 'Promise has been rejected due to a timeout.');
    });

    it('keeps a promise in pending state if no timeout happened', function() {
      // Arrange
      var promise = promiseFactory();

      // Act
      clock.tick(timeoutInterval - 1);

      // Assert
      promise.should.have.deep.property('$$state.status', 0);
    });

    it('does nothing, if promise is rejected/resolved at the time of timeout', function() {
      // Arrange
      var resolveObject = { x: 2 },
          promise       = promiseFactory(function() { return resolveObject; });

      // Act
      clock.tick(timeoutInterval);

      // Assert
      $log.assertEmpty();
      return promise.should.eventually.be.equal(resolveObject) && $timeout.flush();
    });
  });

});
