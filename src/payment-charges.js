var SmallestCurrencyUnit = require('./currencies/smallest-currency-unit');

module.exports = (function () {
	'use strict';

	function PaymentCharges () {}

	PaymentCharges.prototype.createCharge = function (customer, plan, callback) {
		var currencyModifier = SmallestCurrencyUnit.getCurrencyModifier(plan.currency);

		if (currencyModifier === null) {
			return callback(
				new Error('STRIPE: Currency ' + plan.currency + ' is not handled correctly!')
			);
		}

		this.stripe.charges.create({
			currency: plan.currency,
			amount: plan.amount * (1 / currencyModifier),

			customer: customer.id,
			description: 'Customer ' + customer.email + ' is charged for ' + plan.name + '.'
		}, callback);
	};

	return PaymentCharges;

})();
