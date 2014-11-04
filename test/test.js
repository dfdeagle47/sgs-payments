// var SGSPayments = require('../src/sgs-payments');
var SGSPayments = require('./coverage/instrument/src/sgs-payments');

var chargeScenario = require('./charge-scenario');

var assert = require('assert');
var stripe = require('stripe');
var async = require('async');
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

	before('Clear customers', function (callback) {
		this.timeout(10 * 1000);
		SGSPayments.stripe.customers.list({}, function (e, customers) {
			if (e) {
				return callback(e);
			}

			async.each(customers.data, function (customer, cb) {
				SGSPayments.stripe.customers.del(customer.id, cb);
			}, callback);
		});
	});

	describe('Charge customer scenario:', function () {
		chargeScenario();
	});

});
