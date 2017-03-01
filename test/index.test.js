'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Appboy = require('../lib/');
var assert = require('assert');

describe('Appboy', function() {
  var analytics;
  var appboy;
  var options = {
    apiKey: '7c664901-d8c0-4f82-80bf-e7e7a24478e8',
    automaticallyDisplayMessages: true,
    safariWebsitePushId: ''
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
      .option('apiKey', '')
      .option('automaticallyDisplayMessages', true)
      .option('safariWebsitePushId', '')
      );
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

    it('should call changeUser if userID is present', function(done) {
      analytics.user().id('user-id');
      analytics.once('ready', function() {
        assert.equal(window.appboy.getUser().getUserId(), 'user-id');
        done();
      });
      analytics.initialize();
    });

    it('should send Safari Website Push ID if provided in the settings', function() {
      appboy.options.safariWebsitePushId = 'web.com.example.domain';
      analytics.once('ready', function() {
        analytics.assert(appboy.safariWebsitePushId === options.safariWebsitePushId);
      });
      analytics.initialize();
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.appboy, 'changeUser');
      });

      it('should only send an identify call if userId is present', function() {
        analytics.identify('userId');
        analytics.called(window.appboy.changeUser, 'userId');
      });
    });
  });
});