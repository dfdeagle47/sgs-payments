var _ = require('underscore');

module.exports = (function () {
	'use strict';

	function PaymentCharges () {}

	PaymentCharges.prototype.createCharge = function (customer, plan, callback) {
		this.stripe.charges.create(
			_.extend(
				_.clone(plan),
				{
					customer: customer,
					description: 'Customer ' + customer.email + ' is charged for ' + plan.name + '.'
				}
			),
			callback
		);
	};

	return PaymentCharges;

})();
