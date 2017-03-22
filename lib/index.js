'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var omit = require('lodash.omit');
var Track = require('segmentio-facade').Track;

/**
 * Expose `Appboy` integration.
 */

var Appboy = module.exports = integration('Appboy')
  .global('appboy')
  .option('apiKey', '')
  .option('safariWebsitePushId', '')
  .option('automaticallyDisplayMessages', true)
  .tag('<script src="https://js.appboycdn.com/web-sdk/1.6/appboy.min.js">');

/**
 * Initialize.
 *
 * @api public
 */

Appboy.prototype.initialize = function() {
  var options = this.options;
  var self = this;
  var userId = this.analytics.user().id();
  // stub out function
  /* eslint-disable */
  +function(a,p,P,b,y) {
    window.appboy={};for(var s="destroy toggleAppboyLogging setLogger openSession changeUser requestImmediateDataFlush requestFeedRefresh subscribeToFeedUpdates logCardImpressions logCardClick logFeedDisplayed requestInAppMessageRefresh logInAppMessageImpression logInAppMessageClick logInAppMessageButtonClick subscribeToNewInAppMessages removeSubscription removeAllSubscriptions logCustomEvent logPurchase isPushSupported isPushBlocked isPushGranted isPushPermissionGranted registerAppboyPushMessages unregisterAppboyPushMessages submitFeedback ab ab.User ab.User.Genders ab.User.NotificationSubscriptionTypes ab.User.prototype.getUserId ab.User.prototype.setFirstName ab.User.prototype.setLastName ab.User.prototype.setEmail ab.User.prototype.setGender ab.User.prototype.setDateOfBirth ab.User.prototype.setCountry ab.User.prototype.setHomeCity ab.User.prototype.setEmailNotificationSubscriptionType ab.User.prototype.setPushNotificationSubscriptionType ab.User.prototype.setPhoneNumber ab.User.prototype.setAvatarImageUrl ab.User.prototype.setLastKnownLocation ab.User.prototype.setUserAttribute ab.User.prototype.setCustomUserAttribute ab.User.prototype.addToCustomAttributeArray ab.User.prototype.removeFromCustomAttributeArray ab.User.prototype.incrementCustomUserAttribute ab.InAppMessage ab.InAppMessage.SlideFrom ab.InAppMessage.ClickAction ab.InAppMessage.DismissType ab.InAppMessage.OpenTarget ab.InAppMessage.ImageStyle ab.InAppMessage.Orientation ab.InAppMessage.CropType ab.InAppMessage.prototype.subscribeToClickedEvent ab.InAppMessage.prototype.subscribeToDismissedEvent ab.InAppMessage.prototype.removeSubscription ab.InAppMessage.prototype.removeAllSubscriptions ab.InAppMessage.Button ab.InAppMessage.Button.prototype.subscribeToClickedEvent ab.InAppMessage.Button.prototype.removeSubscription ab.InAppMessage.Button.prototype.removeAllSubscriptions ab.SlideUpMessage ab.ModalMessage ab.FullScreenMessage ab.ControlMessage ab.Feed ab.Feed.prototype.getUnreadCardCount ab.Card ab.ClassicCard ab.CaptionedImage ab.Banner ab.WindowUtils display display.automaticallyShowNewInAppMessages display.showInAppMessage display.showFeed display.destroyFeed display.toggleFeed sharedLib".split(" "),i=0;i<s.length;i++){for(var k=appboy,l=s[i].split("."),j=0;j<l.length-1;j++)k=k[l[j]];k[l[j]]=function(){console&&console.error("The Appboy SDK has not yet been loaded.")}}appboy.initialize=function(){console&&console.error("Appboy cannot be loaded - this is usually due to strict corporate firewalls or ad blockers.")};appboy.getUser=function(){return new appboy.ab.User};appboy.getCachedFeed=function(){return new appboy.ab.Feed};
  }(document, 'script', 'link');
  /* eslint-enable */

  // this is used to test this.loaded
  this._shim = window.appboy.initialize;

  this.load(function() {
    var config = {};
    if (options.safariWebsitePushId) config.safariWebsitePushId = options.safariWebsitePushId;
    window.appboy.initialize(options.apiKey, config);

    if (options.automaticallyDisplayMessages) window.appboy.display.automaticallyShowNewInAppMessages();
    if (userId) window.appboy.changeUser(userId);
    window.appboy.openSession();
    self.ready();
  });
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Appboy.prototype.loaded = function() {
  return window.appboy && window.appboy.initialize !== this._shim;
};

/**
 * Recognized Appboy fields. Traits other than these will be included as custom attributes.
 *
 */

var recognizedTraits = [
  'first_name',
  'last_name',
  'dob',
  'image_url',
  'gender',
  'home_city',
  'country'
];

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Appboy.prototype.identify = function(identify) {
  var userId = identify.userId();
  // Appboy doesn't want you to call changeUser unless a userId is present because they do automatic anonymous user tracking on their end
  // https://www.appboy.com/documentation/Web/#setting-user-ids
  if (!userId) return;
  window.appboy.changeUser(userId);

  // set attributes from identify payload
  var attributes = formatTraits(identify, this.options);
  var customAttributes = omit(attributes, recognizedTraits);
  this.setUserAttributes(attributes);
  this.setCustomUserAttributes(customAttributes);
};

/**
 * Aliases of Segment's special traits for Appboy's recognized user profile fields
 *
 */

var traitAliases = {
  firstName: 'first_name',
  lastName: 'last_name',
  birthday: 'dob',
  avatar: 'image_url'
};

/**
 * Formats for the genders that will be correctly parsed by Appboy
 *
 */

var acceptedGenders = ['m', 'f', 'male', 'female', 'man', 'woman', 'other'];

/**
 * Format the traits from the identify
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

function formatTraits(identify, settings) {
  var traits = identify.traits(traitAliases) || {};

  // delete any trait names mapped to Appboy user profile fields
  Object.keys(traitAliases).forEach(function(key) {
    delete traits[key];
  });

  // extract city and country from address if it exists
  if (traits.address) {
    if (traits.address.city) {
      traits.home_city = traits.address.city;
    }
    if (traits.address.country) {
      traits.country = traits.address.country;
    }
  }

  // remove unnecessary known traits
  delete traits.id;
  delete traits.name;
  delete traits.address;

  // check and/or change format for existing traits
  if (traits.dob) {
    traits.dob = formatDate(traits.dob);
  }
  // only pass on gender if Appboy will recognize it
  traits.gender = getGender(traits.gender);

  // include external_id and _update_existing_only
  traits.external_id = identify.userId();
  traits._update_existing_only = settings.updateExistingOnly;

  return traits;
}

/**
 * Formats a date to YYYY-MM-DD
 *
 * @param {Mixed} date
 * @return {String}
 * @api private
 */

function formatDate(date) {
  date = new Date(date);
  if (isNaN(date.getTime())) return;
  return date.toISOString().slice(0,10);
}

/**
 * Gets a gender Appboy can use or returns null
 * @param  {String} gender [description]
 */

function getGender(gender) {
  if (!gender) return;
  if (typeof gender !== 'string') return;
  if (acceptedGenders.indexOf(gender.toLowerCase()) > -1) return gender;
}

/**
 * Sets the user traits on an Appboy user object
 * @param  {Object} user result of window.appboy.getUser()
 * @param  {Object} attributes formatted user attributes
 */

Appboy.prototype.setUserAttributes = function(attributes) {
  var user = window.appboy.getUser();
  if (attributes.first_name) {
    user.setFirstName(attributes.first_name);
  }
  if (attributes.last_name !== '') {
    user.setLastName(attributes.last_name);
  }
  if (attributes.dob) {
    user.setDateOfBirth(attributes.dob);
  }
  if (attributes.home_city) {
    user.setHomeCity(attributes.home_city);
  }
  if (attributes.country) {
    user.setCountry(attributes.country);
  }
  if (attributes.gender) {
    user.setGender(attributes.gender);
  }
};

/**
 * Sets custom user traits on an Appboy user object
 * @param  {Object} user result of window.appboy.getUser()
 * @param  {Object} attributes formatted customer user attributes
 */
Appboy.prototype.setCustomUserAttributes = function(attributes) {
  Object.keys(attributes).forEach(function(key) {
    if (!attributes[key]) return;
    window.appboy.getUser().setCustomUserAttribute(key, attributes[key]);
  });
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Appboy.prototype.track = function(track) {
  var props = track.properties() || {};
  window.appboy.logCustomEvent(track.event(), props);
};

/**
 * Order Completed.
 *
 * @api public
 * @param {Track} track
 */

Appboy.prototype.orderCompleted = function(track) {
  var purchases = mapProductsToPurchases(track, track.products());
  var order_id = track.orderId();
  var checkout_id = track.checkoutId();

  purchases.forEach(function(purchase) {
    var extraProperties = omit(purchase, ['product_id', 'price', 'currency', 'quantity']);
    if (order_id) extraProperties.order_id = order_id;
    if (checkout_id) extraProperties.checkout_id = checkout_id;
    window.appboy.logPurchase(purchase.product_id, purchase.price, purchase.currency, purchase.quantity, extraProperties);
  });
};

/**
 * Map Segment spec products to Appboy purchase format.
 * @param {Array} products
 * @return {Array}
 */

function mapProductsToPurchases(track, products) {
  var purchases = [];
  // add purchase for each product
  products.forEach(function(product) {
    var item = new Track({ properties: product });
    purchases.push({
      external_id: track.userId(),
      product_id: item.productId() || item.id(),
      currency: item.currency() || 'USD',
      price: item.price(),
      quantity: item.quantity() || 1
    });
  });

  return purchases;
}

/**
 * Group.
 *
 * @api public
 * @param {Group} group
 */

Appboy.prototype.group = function(group) {
  var groupId = group.groupId();
  var gId = 'ab_segment_group_' + groupId;
  this.setCustomUserAttribute(gId, true);
};
