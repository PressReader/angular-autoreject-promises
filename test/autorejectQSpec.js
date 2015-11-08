/**
 * Created on 11/4/2015.
 */

describe('timeoutQ', function() {

  'use strict';

  var $timeout,
      $q,
      $log,
      timeoutInterval       = 1000,
      clock,
      emptyPromiseFactories = [
        /* $q.defer promises */
        function(resolveResult, rejectResult) {
          var defer = $q.defer();
          if (resolveResult) defer.resolve(resolveResult());
          if (rejectResult) defer.reject(rejectResult());

          return defer.promise;
        },
        /* native style promises */
        function(resolveResult, rejectResult) {
          return $q(function(resolve, reject) {
            if (resolveResult) resolve(resolveResult());
            if (rejectResult) reject(rejectResult());
          });
        }
      ],
      autoreject,
      provider;

  beforeEach(module('angular-autoreject-promises', ['autorejectProvider', function(_autorejectProvider_) {
    provider = _autorejectProvider_;
    provider.config({
      logTimeouts: true,
      enable: true,
      timeoutInterval: timeoutInterval
    });
  }]));

  beforeEach(inject(function(_$timeout_, _$q_, _$log_, _autoreject_) {
    $timeout   = _$timeout_;
    $q         = _$q_;
    $log       = _$log_;
    autoreject = _autoreject_;
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
  }

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

    it('does nothing, if promise is resolved at the time of timeout', function() {
      // Arrange
      var resolveObject = { x: 2 },
          promise       = promiseFactory(function() {
            return resolveObject;
          });

      // Act
      clock.tick(timeoutInterval);

      // Assert
      $log.assertEmpty();
      return promise.should.eventually.be.equal(resolveObject) && $timeout.flush();
    });

    it('does nothing, if promise is rejected at the time of timeout', function() {
      // Arrange
      promiseFactory(null, function() {
        return "rejection reason.";
      });

      // Act
      clock.tick(timeoutInterval);

      // Assert
      $log.assertEmpty();
    });

    it('gets promise rejected with reason specified by user if no timeout happened', function() {
      // Arrange
      var rejectionReason = "reason",
          promise         = promiseFactory(null, function() {
            return rejectionReason;
          });

      // Act
      clock.tick(timeoutInterval);

      // Assert
      return promise.should.eventually.be.rejectedWith(rejectionReason) && $timeout.flush();
    });

    it('does nothing if disabled', function() {
      // Arrange
      provider.config({ enable: false });
      var promise = promiseFactory();

      // Act
      clock.tick(timeoutInterval);

      // Assert
      promise.should.have.deep.property('$$state.status', 0);
    });
  });

  angular.forEach(['when', 'all', 'resolve', 'reject'], function(method) {
    it('decorated $q service must respond to "' + method + '"', function() {
      // Arrange

      // Act

      // Assert
      angular.isFunction($q[method]).should.equal(true, method + ' was not copied from original $q service');
    });
  });

  describe('#wasRejectedByTimeout', function() {
    it('returns false if error is not a TimeoutError.', function() {
      // Arrange
      var error = new Error();

      // Act
      var result = autoreject.isTimeoutError(error);

      // Assert
      result.should.equal(false);
    });

    it('returns true if error is a timeout error', function() {
      // Arrange
      var error;
      $q.defer().promise.catch(function(reason) {
        error = reason;
      });
      clock.tick(timeoutInterval);

      // Act
      var result = autoreject.isTimeoutError(error);

      // Assert
      result.should.equal(true);
    });
  });
});
