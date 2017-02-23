'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');

/**
 * Expose `Appboy` integration.
 */

var Appboy = module.exports = integration('Appboy')
  .global('appboy')
  .option('apiKey', '')
  // this is a minimal version and does not include appboy.display which
  // is the public interface for the UI portions of Appboy's Web SDK. For now
  // only going to have this version until we figure out how many appboy
  // features we are going to include in this integration.
  .tag('<script src="https://js.appboycdn.com/web-sdk/1.6/appboy.core.min.js">');

/**
 * Initialize.
 *
 * @api public
 */

Appboy.prototype.initialize = function() {
  var options = this.options;
  var self = this;

  // stub out function
  /* eslint-disable */
  +function(a,p,P,b,y) {
    window.appboy={};for(var s="destroy toggleAppboyLogging setLogger openSession changeUser requestImmediateDataFlush requestFeedRefresh subscribeToFeedUpdates logCardImpressions logCardClick logFeedDisplayed requestInAppMessageRefresh logInAppMessageImpression logInAppMessageClick logInAppMessageButtonClick subscribeToNewInAppMessages removeSubscription removeAllSubscriptions logCustomEvent logPurchase isPushSupported isPushBlocked isPushGranted isPushPermissionGranted registerAppboyPushMessages unregisterAppboyPushMessages submitFeedback ab ab.User ab.User.Genders ab.User.NotificationSubscriptionTypes ab.User.prototype.getUserId ab.User.prototype.setFirstName ab.User.prototype.setLastName ab.User.prototype.setEmail ab.User.prototype.setGender ab.User.prototype.setDateOfBirth ab.User.prototype.setCountry ab.User.prototype.setHomeCity ab.User.prototype.setEmailNotificationSubscriptionType ab.User.prototype.setPushNotificationSubscriptionType ab.User.prototype.setPhoneNumber ab.User.prototype.setAvatarImageUrl ab.User.prototype.setLastKnownLocation ab.User.prototype.setUserAttribute ab.User.prototype.setCustomUserAttribute ab.User.prototype.addToCustomAttributeArray ab.User.prototype.removeFromCustomAttributeArray ab.User.prototype.incrementCustomUserAttribute ab.InAppMessage ab.InAppMessage.SlideFrom ab.InAppMessage.ClickAction ab.InAppMessage.DismissType ab.InAppMessage.OpenTarget ab.InAppMessage.ImageStyle ab.InAppMessage.Orientation ab.InAppMessage.CropType ab.InAppMessage.prototype.subscribeToClickedEvent ab.InAppMessage.prototype.subscribeToDismissedEvent ab.InAppMessage.prototype.removeSubscription ab.InAppMessage.prototype.removeAllSubscriptions ab.InAppMessage.Button ab.InAppMessage.Button.prototype.subscribeToClickedEvent ab.InAppMessage.Button.prototype.removeSubscription ab.InAppMessage.Button.prototype.removeAllSubscriptions ab.SlideUpMessage ab.ModalMessage ab.FullScreenMessage ab.ControlMessage ab.Feed ab.Feed.prototype.getUnreadCardCount ab.Card ab.ClassicCard ab.CaptionedImage ab.Banner ab.WindowUtils display display.automaticallyShowNewInAppMessages display.showInAppMessage display.showFeed display.destroyFeed display.toggleFeed sharedLib".split(" "),i=0;i<s.length;i++){for(var k=appboy,l=s[i].split("."),j=0;j<l.length-1;j++)k=k[l[j]];k[l[j]]=function(){console&&console.error("The Appboy SDK has not yet been loaded.")}}appboy.initialize=function(){console&&console.error("Appboy cannot be loaded - this is usually due to strict corporate firewalls or ad blockers.")};appboy.getUser=function(){return new appboy.ab.User};appboy.getCachedFeed=function(){return new appboy.ab.Feed};
  }(document, 'script', 'link');
  /* eslint-enable */


  this._shim = window.appboy.initialize;

  this.load(function() {
    window.appboy.initialize(options.apiKey);
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
 * Identify.
 * 
 * https://js.appboycdn.com/web-sdk/latest/doc/ab.User.html
 *
 * @api public
 * @param {Identify} identify
 */

// Appboy.prototype.identify = function(identify) {
// };

// /**
//  * Track.
//  * 
//  * https://js.appboycdn.com/web-sdk/latest/doc/module-appboy.html#.logCustomEvent
//  *
//  * @api public
//  * @param {Track} track
//  */

// Appboy.prototype.track = function(track) {
// };

// *
//  * Order Completed. 
//  * 
//  * Breaking this out because it requires certain properties that all other events don't.
//  * 
//  * https://js.appboycdn.com/web-sdk/latest/doc/module-appboy.html#.logPurchase
//  *
//  * @api public
//  * @param {Track} track
 

// Appboy.prototype.orderCompleted = function(track) {
// };