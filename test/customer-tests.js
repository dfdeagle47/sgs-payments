var SGSPayments = require('./coverage/instrument/src/sgs-payments');
var account = require('./fixtures/account');

var assert = require('assert');

module.exports = function () {
	'use strict';

	it('Create a customer.', function (callback) {
		SGSPayments.createCustomer({
			email: account.email
		}, function (e, customer) {
			if (e) {
				return callback(e);
			}

			assert.strictEqual(customer.id.substr(0, 4), 'cus_');
			assert.strictEqual(customer.default_card, null);
			assert.strictEqual(Array.isArray(customer.cards.data), true);
			assert.strictEqual(customer.cards.data.length, 0);
		});
	});

};
