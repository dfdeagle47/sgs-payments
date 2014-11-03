var _ = require('underscore');

module.exports = (function () {
	'use strict';

	function PaymentSubscriptions () {}

	PaymentSubscriptions.prototype.updateOrCreateSubscription = function (customer, planId, callback) {
		var plan = _.findWhere(customer.subscriptions.data, {
			id: planId
		});

		if (plan !== undefined) {
			return callback(
				new Error('STRIPE: Customer ' + customer.id + ' is already subscribed to plan ' + planId + '!')
			);
		}

		if (this.hasSubscription(customer)) {
			return this.updateSubscription(customer, planId, callback);
		}

		this.createSubscription(customer, planId, callback);
	};

	PaymentSubscriptions.prototype.createSubscription = function (customer, planId, callback) {
		this.stripe.customers.createSubscription(
			customer.id,
			{
				plan: planId
			},
			callback
		);
	};

	PaymentSubscriptions.prototype.updateSubscription = function (customer, planId, callback) {
		var subscriptionId = customer.subscriptions.data[0].id;
		this.stripe.customers.updateSubscription(
			customer.id,
			subscriptionId,
			{
				plan: planId
			},
			callback
		);
	};

	PaymentSubscriptions.prototype.cancelSubscription = function (customer, callback) {
		if (this.hasSubscription(customer)) {
			return callback(
				new Error('STRIPE: Customer ' + customer.id + ' has no subscription!')
			);
		}

		var subscriptionId = customer.subscriptions.data[0].id;
		this.stripe.customers.cancelSubscription(
			customer.id,
			subscriptionId,
			{
				at_period_end: true
			},
			callback
		);
	};

	PaymentSubscriptions.prototype.hasSubscription = function (customer) {
		return Array.isArray(customer.subscriptions.data) && customer.subscriptions.data.length;
	};

	return PaymentSubscriptions;

})();
