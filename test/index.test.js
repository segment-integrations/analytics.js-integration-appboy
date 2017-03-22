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

      it('should call setUserAttribute and setCustomUserAttribute with correct values', function() {
        analytics.stub(appboy, 'setUserAttributes');
        analytics.stub(appboy, 'setCustomerUserAttributes');

        analytics.identify('userId', {
          name: 'Gilfoyle',
          birthday: '02/14/1992',
          email: 'gilfoyle@piedpiper.com',
          plan: 'premium',
          logins: 5,
          gender: 'male',
          address: {
            city:'San Francisco',
            country: 'USA'
          }
        });

        analytics.called(appboy.setUserAttributes, {
          email: 'gilfoyle@piedpiper.com',
          plan: 'premium',
          logins: 5,
          gender: 'male',
          first_name: 'Gilfoyle',
          dob: '1992-02-14',
          home_city: 'San Francisco',
          country: 'USA',
          external_id: 'userId'
        });
        // analytics.called(appboy.setCustomerUserAttributes, {});
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.appboy, 'logCustomEvent');
      });

      it('should send a track call to make a custom event', function() {
        analytics.track('Registered', { plan: 'Pro Annual', accountType: 'Facebook' });
        analytics.called(window.appboy.logCustomEvent, 'Registered', { plan: 'Pro Annual', accountType: 'Facebook' });
      });
    });

    describe('#Order Completed', function() {
      beforeEach(function() {
        analytics.stub(window.appboy, 'logPurchase');
      });

      it('should call order completed', function() {
        analytics.track('Order Completed', {
          checkout_id: 'fksdjfsdjfisjf9sdfjsd9f',
          order_id: '50314b8e9bcf000000000000',
          currency: 'USD',
          products: [
            {
              product_id: '507f1f77bcf86cd799439011',
              name: 'Monopoly: 3rd Edition',
              price: 19,
              quantity: 1
            }]
        });

        analytics.called(window.appboy.logPurchase,
          '507f1f77bcf86cd799439011',
          19,
          'USD',
          1,
          {
            orderId:'50314b8e9bcf000000000000',
            checkoutId: 'fksdjfsdjfisjf9sdfjsd9f'
          }
        );
      });
    });

    describe('#Group', function() {
      beforeEach(function() {
        analytics.stub(appboy, 'setCustomUserAttribute');
      });

      it('should call group', function() {
        var groupId = 'test1234';
        analytics.group(groupId);
        analytics.called(appboy.setCustomUserAttribute, 'ab_segment_group_test1234');
      });
    });
  });
});
