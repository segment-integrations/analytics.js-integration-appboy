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

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.appboy, 'logCustomEvent');
        analytics.stub(window.appboy, 'logPurchase');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.appboy.logCustomEvent, 'event');
      });

      it('should send send all properties', function() {
        analytics.track('event with properties', {
          nickname: 'noonz',
          spiritAnimal: 'wolf',
          best_friend: 'tom'
        });
        analytics.called(window.appboy.logCustomEvent, 'event with properties', {
          nickname: 'noonz',
          spiritAnimal: 'wolf',
          best_friend: 'tom'
        });
      });

      it('should call logPurchase for each product', function() {
        analytics.track('Order Completed', {
          total: 30,
          revenue: 25,
          shipping: 3,
          currency: 'USD',
          products: [
            {
              product_id: '507f1f77bcf86cd799439011',
              sku: '45790-32',
              name: 'Monopoly: 3rd Edition',
              price: 19.23,
              quantity: 1,
              category: 'Games'
            },
            {
              product_id: '505bd76785ebb509fc183733',
              sku: '46493-32',
              name: 'Uno Card Game',
              price: 3,
              quantity: 2,
              category: 'Games'
            }
          ]
        });
        analytics.called(window.appboy.logPurchase, '507f1f77bcf86cd799439011', 19.23, 'USD', 1, {
          total: 30,
          revenue: 25,
          shipping: 3
        });
        analytics.called(window.appboy.logPurchase, '505bd76785ebb509fc183733', 3, 'USD', 2, {
          total: 30,
          revenue: 25,
          shipping: 3
        });
      });

      it('should not fail if currency, quantity, and purchaseProperties are undefined', function() {
        analytics.track('Order Completed', {
          products: [
            {
              product_id: '507f1f77bcf86cd799439011',
              price: 19.23
            },
            {
              product_id: '505bd76785ebb509fc183733',
              price: 3
            }
          ]
        });
        analytics.called(window.appboy.logPurchase, '507f1f77bcf86cd799439011', 19.23);
        analytics.called(window.appboy.logPurchase, '505bd76785ebb509fc183733', 3);
      });
    });
  });
});