var SGSPayments = require('../src/sgs-payments');
// var SGSPayments = require('./coverage/instrument/src/sgs-payments');
var account = require('./fixtures/account');

var assert = require('assert');

module.exports = function () {
	'use strict';

	it('Create a card token.', function (callback) {
		SGSPayments.stripe.tokens.create({
			card: account.card
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

	it('Fail when adding card to customer without specifying token.', function (callback) {
		SGSPayments.getOrCreateCard(
			account.customerInfo,
			null,
			function (e, card) {
				assert.strictEqual(e instanceof Error, true);
				assert.strictEqual(card === undefined, true);
				callback(null);
			}
		);
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

	it('Find updated customer.', function (callback) {
		SGSPayments.getCustomer(account.customerInfo.id, function (e, customer) {
			if (e) {
				return callback(e);
			}

			account.customerInfo = customer;

			assert.strictEqual(customer.id.substr(0, 4), 'cus_');
			assert.notStrictEqual(customer.default_card, null);
			assert.strictEqual(Array.isArray(customer.cards.data), true);
			assert.strictEqual(customer.cards.data.length, 1);
			callback(null);
		});
	});

	it('Fallback to customer default card.', function (callback) {
		SGSPayments.getOrCreateCard(
			account.customerInfo,
			null,
			function (e, card) {
				if (e) {
					return callback(e);
				}

				assert.strictEqual(card.id, account.cardInfo.id);
				assert.strictEqual(card.id, account.customerInfo.default_card);
				assert.strictEqual(card.fingerprint, account.cardInfo.fingerprint);
				callback(null);
			}
		);
	});

	it('Add a duplicate card.', function (callback) {
		SGSPayments.stripe.tokens.create({
			card: account.card
		}, function (e, card) {
			if (e) {
				return callback(e);
			}

			assert.strictEqual(card.id.substr(0, 4), 'tok_');
			assert.strictEqual(card.card.id.substr(0, 5), 'card_');
			assert.strictEqual(card.card.customer, null);
			assert.strictEqual(typeof card.card.fingerprint, 'string');
			callback(null);
		});
	});

	it('Don\'t add card to customer if duplicate.', function (callback) {
		SGSPayments.getOrCreateCard(
			account.customerInfo,
			null,
			function (e, card) {
				if (e) {
					return callback(e);
				}

				assert.strictEqual(card.id, account.cardInfo.id);
				assert.strictEqual(card.id, account.customerInfo.default_card);
				assert.strictEqual(card.fingerprint, account.cardInfo.fingerprint);
				callback(null);
			}
		);
	});

	it('Fail when adding card that fails CVC security check.', function (callback) {
		this.timeout(5 * 1000);
		SGSPayments.stripe.tokens.create({
			card: {
				number: '4000000000000101',
				exp_month: account.card.exp_month,
				exp_year: account.card.exp_year,
				cvc: account.card.cvc
			}
		}, function (e, card) {
			if (e) {
				return callback(e);
			}

			account.invalidCVCCardInfo = card.card;
			account.invalidCVCCardToken = card.id;

			assert.strictEqual(card.id.substr(0, 4), 'tok_');
			assert.strictEqual(card.card.id.substr(0, 5), 'card_');
			assert.strictEqual(card.card.customer, null);
			assert.strictEqual(typeof card.card.fingerprint, 'string');

			SGSPayments.getOrCreateCard(
				account.customerInfo,
				account.invalidCVCCardToken,
				function (e, card) {
					assert.strictEqual(e instanceof Error, true);
					assert.strictEqual(card === undefined, true);
					callback(null);
				}
			);
		});
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
