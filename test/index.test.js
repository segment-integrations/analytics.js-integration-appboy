'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Appboy = require('../lib/');

describe('Appboy', function() {
  var analytics;
  var appboy;
  var options = {
    apiKey: '7c664901-d8c0-4f82-80bf-e7e7a24478e8'
  };

  beforeEach(function() {
    analytics = new Analytics();
    appboy = new Appboy(options);
    analytics.use(Appboy);
    analytics.use(tester);
    analytics.add(appboy);
  });

  afterEach(function(done) {
    analytics.restore();
    analytics.reset();
    appboy.reset();
    sandbox();
    done();
  });

  it('should have the right settings', function() {
    analytics.compare(Appboy, integration('Appboy')
      .global('appboy')
      .option('apiKey', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(appboy, 'load');
    });

    describe('#initialize', function() {
      it('should call #load', function() {
        analytics.initialize();
        analytics.called(appboy.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(appboy, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe.skip('#track', function() {
      beforeEach(function() {
        analytics.stub(window, 'Appboy');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called();
      });

      it('should send the name of the event', function() {
        analytics.track('event name');
        analytics.called();
      });

      it('should send send all properties as an object', function() {
        analytics.track('event with properties');
        analytics.called();
      });
    });
  });
});