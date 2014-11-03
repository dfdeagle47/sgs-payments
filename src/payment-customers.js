module.exports = (function () {
	'use strict';

	function PaymentCustomers () {}

	PaymentCustomers.prototype.getOrCreateCustomer = function (customer, callback) {
		if (typeof customer.id === 'string') {
			return this.getCustomer(customer.id, callback);
		}

		this.createCustomer(customer, callback);
	};

	PaymentCustomers.prototype.getCustomer = function (customerId, callback) {
		this.stripe.customers.retrieve(customerId, function (e, customer) {
			if (e) {
				return callback(e);
			}

			if (!customer) {
				return callback(
					new Error('STRIPE: Customer ' + customerId + ' doesn\'t exist!')
				);
			}

			if (customer.delinquent === true && this.securityChecks.payments.accept_deliquents !== true) {
				return callback(
					new Error('STRIPE: Customer ' + customerId + ' failed to pay last invoice!')
				);
			}

			callback(null, customer);
		}.bind(this));
	};

	PaymentCustomers.prototype.createCustomer = function (customer, callback) {
		this.stripe.customers.create(customer, callback);
	};

	return PaymentCustomers;

})();
