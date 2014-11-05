var stripe = require('stripe')(
	'sk_test_KIcctxzFOY37X74CGN6tJi3X'
);
var async = require('async');

var createCustomer = function (email) {
	stripe.customers.create({
		id: email
	}, function (e, customer) {
		if (e) {
			throw e;
		}

		console.log('Customer=', customer);
	});
};

var clearCustomers = function () {
	stripe.customers.list({}, function (e, customers) {
		if (e) {
			throw e;
		}

		async.each(customers.data, function (customer, cb) {
			stripe.customers.del(customer.id, cb);
		}, function (e) {
			if (e) {
				throw e;
			}

			createCustomer('info@sagacify.com');
		});
	});
};

clearCustomers();
