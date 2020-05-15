'use strict';

var _ = require('lodash');

function $QProvider() {

  this.$get = ['$rootScope', function($rootScope) {

    function Promise() {
      this.$$state = {};
    }
    Promise.prototype.then = function(onFulfilled) {
      this.$$state.pending = this.$$state.pending || [];
      this.$$state.pending.push(onFulfilled);
      if (this.$$state.status > 0) {
        scheduleProcessQueue(this.$$state);
      }
    };

    function Deferred() {
      this.promise = new Promise();
    }
    Deferred.prototype.resolve = function(value) {
      if (this.promise.$$state.status) {
        return;
      }
      this.promise.$$state.value = value;
      this.promise.$$state.status = 1;
      scheduleProcessQueue(this.promise.$$state);
    };

    function defer() {
      return new Deferred();
    }

    function scheduleProcessQueue(state) {
      $rootScope.$evalAsync(function() {
        processQueue(state);
      });
    }

    function processQueue(state) {
      var pending = state.pending;
      state.pending = undefined;
      _.forEach(pending, function(onFulfilled) {
        onFulfilled(state.value);
      });
    }

    return {
      defer: defer
    };

  }];

}

module.exports = $QProvider;
