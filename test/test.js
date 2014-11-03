// var SGSPayments = require('../src/sgs-payments');
var SGSPayments = require('./coverage/instrument/src/sgs-payments');

var assert = require('assert');
var path = require('path');
var fs = require('fs');

describe('Testing the payments module:', function () {
	'use strict';

	before('Initialising the module', function () {
		var apiKey = fs.readFileSync(
			path.resolve(__dirname, 'fixtures/api-key.txt')
		);

		var sgsPayments = SGSPayments.init({
			apiKey: apiKey
		});

		assert.strictEqual(sgsPayments.stripe.constructor.name, 'Stripe');
	});

	// describe('Charges:', function () {
	// 	oauthStrategyTests();
	// });

});
