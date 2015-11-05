/**
 * Created on 11/4/2015.
 */

describe('timeoutQ', function() {

  'use strict';

  var $interval,
    $q,
    clock;

  beforeEach(module('myApp'));

  beforeEach(inject(function(_$interval_, _$q_) {
    $interval = _$interval_;
    $q = _$q_;
  }));

  beforeEach(function() {
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock && clock.restore();
  });

  it('test', function() {
    // Arrange
    var promise = $q.defer().promise;

    // Act
    clock.tick(5000);

    // Assert
    return promise.should.be.rejected && $interval.flush();
  });

});
