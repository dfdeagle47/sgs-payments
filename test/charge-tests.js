var SGSPayments = require('./coverage/instrument/src/sgs-payments');

var assert = require('assert');

module.exports = function () {
	'use strict';

	it('Stripe is initialized', function () {
		assert.strictEqual(SGSPayments.stripe.constructor.name, 'Stripe');
	});

};
