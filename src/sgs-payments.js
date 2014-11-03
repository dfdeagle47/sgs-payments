var stripe = require('stripe');
var _ = require('underscore');

var PaymentSubscriptions = require('./payment-subscriptions');
var PaymentCustomers = require('./payment-customers');
var PaymentWebhooks = require('./payment-webhooks');
var PaymentCharges = require('./payment-charges');
var PaymentPlans = require('./payment-plans');
var PaymentCards = require('./payment-cards');

module.exports = (function () {
	'use strict';

	function PaymentProcessing () {}

	_.extend(PaymentProcessing.prototype, PaymentSubscriptions.prototype);
	_.extend(PaymentProcessing.prototype, PaymentCustomers.prototype);
	_.extend(PaymentProcessing.prototype, PaymentWebhooks.prototype);
	_.extend(PaymentProcessing.prototype, PaymentCharges.prototype);
	_.extend(PaymentProcessing.prototype, PaymentPlans.prototype);
	_.extend(PaymentProcessing.prototype, PaymentCards.prototype);

	PaymentProcessing.prototype.init = function (config) {
		this.stripe = stripe(config.apiKey);

		this.config(config);
	};

	PaymentProcessing.prototype.config = function (config) {
		config = _.defaults(config, {
			securityChecks: {
				payments: {
					accept_deliquents: true
				},
				cards: {
					address_line1: false,
					address_zip: false,
					cvc: true
				}
			},
			plans: []
		});

		this.securityChecks = config.securityChecks;
		this.plans = config.plans;
	};

	return new PaymentProcessing();

})();
