/**
 * Created on 11/4/2015.
 */

describe('timeoutQ', function() {

  'use strict';

  var $timeout, $q;

  beforeEach(module('myApp'));

  beforeEach(inject(function(_$timeout_, _$q_) {
    $timeout = _$timeout_;
    $q = _$q_;
  }));

});
