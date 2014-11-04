// var SGSPayments = require('../src/sgs-payments');
var SGSPayments = require('./coverage/instrument/src/sgs-payments');
var account = require('./fixtures/account');

var assert = require('assert');

module.exports = function () {
	'use strict';

	it('Create a card.', function (callback) {
		SGSPayments.stripe.tokens.create({
			card: {
				number: account.card,
				exp_month: '12',
				exp_year: '2015',
				cvc: '123'
			}
		}, function (e, card) {
			if (e) {
				return callback(e);
			}

			account.cardInfo = card.card;
			account.cardToken = card.id;

			assert.strictEqual(card.id.substr(0, 4), 'tok_');
			assert.strictEqual(card.card.id.substr(0, 5), 'card_');
			assert.strictEqual(card.card.customer, null);
			assert.strictEqual(typeof card.card.fingerprint, 'string');
			callback(null);
		});
	});

	it('Create a customer.', function (callback) {
		SGSPayments.createCustomer({
			email: account.email
		}, function (e, customer) {
			if (e) {
				return callback(e);
			}

			account.customerInfo = customer;

			assert.strictEqual(customer.id.substr(0, 4), 'cus_');
			assert.strictEqual(customer.default_card, null);
			assert.strictEqual(Array.isArray(customer.cards.data), true);
			assert.strictEqual(customer.cards.data.length, 0);
			callback(null);
		});
	});

	it('Add card to customer.', function (callback) {
		this.timeout(5 * 1000);
		SGSPayments.getOrCreateCard(
			account.customerInfo,
			account.cardToken,
			function (e, card) {
				if (e) {
					return callback(e);
				}

				assert.strictEqual(card.id, account.cardInfo.id);
				assert.strictEqual(card.fingerprint, account.cardInfo.fingerprint);
				callback(null);
			}
		);
	});

	it('Charge the customer.', function (callback) {
		SGSPayments.createCharge(
			account.customerInfo,
			account.chargeInfo,
			function (e, charge) {
				if (e) {
					return callback(e);
				}

				assert.strictEqual(charge.card.id, account.cardInfo.id);
				assert.strictEqual(charge.card.fingerprint, account.cardInfo.fingerprint);
				assert.strictEqual(charge.customer, account.customerInfo.id);
				assert.strictEqual(charge.amount, account.chargeInfo.amount);
				callback(null);
			}
		);
	});

};
