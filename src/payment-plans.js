var async = require('async');
var _ = require('underscore');

module.exports = (function () {
	'use strict';

	function PaymentPlans () {}

	PaymentPlans.prototype.getOrCreatePlans = function (callback) {
		var subscriptionPlans = [];
		var chargePlans = [];

		this.plans.forEach(function (plan) {
			if(this.isSubscriptionPlan(plan)) {
				subscriptionPlans.push(plan);
			}
			else {
				chargePlans.push(plan);
			}
		}.bind(this));

		async.map(
			subscriptionPlans,
			this.getOrCreatePlan.bind(this),
			function (e, plans) {
				if (e) {
					return callback(e);
				}

				this.plans = chargePlans.concat(plans);
				callback(null);
			}.bind(this)
		);
	};

	PaymentPlans.prototype.getOrCreatePlan = function (configPlan, callback) {
		var planId = configPlan.id;
		this.stripe.plans.retrieve(planId, function (e, stripePlan) {
			if (e) {
				return callback(e);
			}

			if (stripePlan && this.diffPlans(configPlan, stripePlan)) {
				return callback(
					new Error('STRIPE: Plan ' + planId + ' has a conflict!')
				);
			}
			else if (stripePlan) {
				return callback(null, stripePlan);
			}

			this.createPlan(configPlan, callback);
		}.bind(this));
	};

	PaymentPlans.prototype.createPlan = function (configPlan, callback) {
		this.stripe.plans.create({
			id: configPlan.id,
			name: configPlan.name,
			amount: configPlan.amount,
			currency: configPlan.currency,
			interval: configPlan.interval,
			metadata: configPlan.metadata,
			trial_period_days: configPlan.trial_period_days
		}, callback);
	};

	PaymentPlans.prototype.diffPlans = function (configPlan, stripePlan) {
		return _.isEqual(
			configPlan,
			_.pick(
				stripePlan,
				Object.keys(configPlan)
			)
		);
	};

	PaymentPlans.prototype.isSubscriptionPlan = function (plan) {
		return !!~['day', 'week', 'month', 'year'].indexOf(plan.interval);
	};

	return PaymentPlans;

})();
