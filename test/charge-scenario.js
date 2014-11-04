// var SGSPayments = require('../src/sgs-payments');
var SGSPayments = require('./coverage/instrument/src/sgs-payments');
var account = require('./fixtures/account');

var assert = require('assert');

module.exports = function () {
	'use strict';

	var validateCustomer = function (numCards, callback) {
		SGSPayments.getCustomer(
			account.customerInfo.id,
			function (e, customer) {
				if (e) {
					return callback(e);
				}

				account.customerInfo = customer;

				assert.strictEqual(customer.email, account.email);
				assert.strictEqual(customer.id.substr(0, 4), 'cus_');

				if (numCards !== 0) {
					assert.strictEqual(customer.default_card.substr(0, 5), 'card_');
				}
				else {
					assert.strictEqual(customer.default_card, null);
				}

				assert.strictEqual(Array.isArray(customer.cards.data), true);
				assert.strictEqual(customer.cards.data.length, numCards);

				callback(null);
			}
		);
	};

	it('Create a customer.', function (callback) {
		SGSPayments.createCustomer({
			email: account.email
		}, function (e, customer) {
			if (e) {
				return callback(e);
			}

			account.customerInfo = customer;

			validateCustomer(0, callback);
		});
	});

	it('Fail if no token or default card are specified.', function (callback) {
		this.timeout(10 * 1000);
		SGSPayments.getOrCreateCard(
			account.customerInfo,
			null,
			function (e, card) {
				assert.strictEqual(e instanceof Error, true);
				assert.strictEqual(card === undefined, true);

				validateCustomer(0, callback);
			}
		);
	});

	it('Add valid card to customer.', function (callback) {
		this.timeout(10 * 1000);
		SGSPayments.stripe.tokens.create({
			card: account.card
		}, function (e, token) {
			if (e) {
				return callback(e);
			}

			account.cardInfo = token.card;
			account.cardToken = token.id;

			assert.strictEqual(token.id.substr(0, 4), 'tok_');
			assert.strictEqual(token.card.id.substr(0, 5), 'card_');
			assert.strictEqual(token.card.customer, null);
			assert.strictEqual(typeof token.card.fingerprint, 'string');

			SGSPayments.getOrCreateCard(
				account.customerInfo,
				account.cardToken,
				function (e, card) {
					if (e) {
						return callback(e);
					}

					assert.strictEqual(card.id, account.cardInfo.id);
					assert.strictEqual(card.fingerprint, account.cardInfo.fingerprint);

					validateCustomer(1, callback);
				}
			);
		});
	});

	it('Fallback to customer default card if token not specified.', function (callback) {
		this.timeout(10 * 1000);
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

				validateCustomer(1, callback);
			}
		);
	});

	it('No-op if card is duplicate of default card.', function (callback) {
		this.timeout(10 * 1000);
		SGSPayments.stripe.tokens.create({
			card: account.card
		}, function (e, token) {
			if (e) {
				return callback(e);
			}

			account.duplicateCardInfo = token.card;
			account.duplicateCardToken = token.id;

			assert.strictEqual(token.id.substr(0, 4), 'tok_');
			assert.strictEqual(token.card.id.substr(0, 5), 'card_');
			assert.strictEqual(token.card.customer, null);
			assert.strictEqual(typeof token.card.fingerprint, 'string');

			SGSPayments.getOrCreateCard(
				account.customerInfo,
				account.duplicateCardToken,
				function (e, card) {
					if (e) {
						return callback(e);
					}

					assert.strictEqual(card.id, account.cardInfo.id);
					assert.strictEqual(card.id, account.customerInfo.default_card);
					assert.strictEqual(card.fingerprint, account.cardInfo.fingerprint);

					validateCustomer(1, callback);
				}
			);
		});
	});

	it('Fail if card fails CVC security check.', function (callback) {
		this.timeout(10 * 1000);
		SGSPayments.stripe.tokens.create({
			card: {
				number: '4000000000000101',
				exp_month: account.card.exp_month,
				exp_year: account.card.exp_year,
				cvc: account.card.cvc
			}
		}, function (e, token) {
			if (e) {
				return callback(e);
			}

			account.invalidCVCCardInfo = token.card;
			account.invalidCVCCardToken = token.id;

			assert.strictEqual(token.id.substr(0, 4), 'tok_');
			assert.strictEqual(token.card.id.substr(0, 5), 'card_');
			assert.strictEqual(token.card.customer, null);
			assert.strictEqual(typeof token.card.fingerprint, 'string');

			SGSPayments.getOrCreateCard(
				account.customerInfo,
				account.invalidCVCCardToken,
				function (e, card) {
					assert.strictEqual(e instanceof Error, true);
					assert.strictEqual(card === undefined, true);

					validateCustomer(1, callback);
				}
			);
		});
	});

	it('Fail if token is not of type card.', function (callback) {
		this.timeout(10 * 1000);
		SGSPayments.stripe.tokens.create({
			bank_account: {
				country: 'US',
				currency: 'usd',
				routing_number: '110000000',
				account_number: '000123456789'
			}
		}, function (e, token) {
			if (e) {
				return callback(e);
			}

			account.bankAccountInfo = token.card;
			account.bankAccountToken = token.id;

			assert.strictEqual(token.id.substr(0, 5), 'btok_');
			assert.strictEqual(token.bank_account.id.substr(0, 3), 'ba_');
			assert.strictEqual(typeof token.bank_account.fingerprint, 'string');

			SGSPayments.getOrCreateCard(
				account.customerInfo,
				account.bankAccountToken,
				function (e, card) {
					assert.strictEqual(e instanceof Error, true);
					assert.strictEqual(card === undefined, true);

					validateCustomer(1, callback);
				}
			);
		});
	});

	it('Charge the customer.', function (callback) {
		this.timeout(10 * 1000);
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

				validateCustomer(1, callback);
			}
		);
	});

};
