var SGSPayments = require('./coverage/instrument/src/sgs-payments');

var customerTests = require('./customer-tests');
var chargeTests = require('./charge-tests');

var assert = require('assert');
var stripe = require('stripe');
var path = require('path');
var fs = require('fs');

describe('Testing the payments module:', function () {
	'use strict';

	before('Initialising the module', function () {
		var apiKey = fs.readFileSync(
			path.resolve(__dirname, 'fixtures/api-key.txt')
		);

		SGSPayments.init({
			apiKey: apiKey
		});

		assert.strictEqual(SGSPayments.stripe instanceof stripe, true);
	});

	describe('Customers:', function () {
		customerTests();
	});

	describe('Charges:', function () {
		chargeTests();
	});

});
