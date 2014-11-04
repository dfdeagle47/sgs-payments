var async = require('async');
var _ = require('underscore');

module.exports = (function () {
	'use strict';

	function PaymentCards () {}

	PaymentCards.prototype.getOrCreateCard = function (customer, tokenId, callback) {
		var defaultCard = _.findWhere(customer.cards.data, {
			id: customer.default_card
		});

		if (typeof tokenId !== 'string' || !tokenId.length) {
			if (defaultCard === undefined) {
				return callback(
					new Error('STRIPE: Missing token or card for customer ' + customer.id + '!')
				);
			}

			return callback(null, defaultCard);
		}

		// Might be useful to skip the getCard() call completely
		// and replace it with a single replaceOrCreateCard() call.
		this.getCard(tokenId, function (e, token) {
			if (e) {
				return callback(e);
			}

			if (token.type !== 'card') {
				return callback(
					new Error('STRIPE: Invalid token type ' + token.type + ' for token ' + tokenId + '!')
				);
			}

			var newCard = token.card;
			if (this.compareCard(defaultCard, newCard)) {
				return callback(null, defaultCard);
			}

			this.replaceOrCreateCard(customer.id, tokenId, callback);
		}.bind(this));
	};

	PaymentCards.prototype.replaceOrCreateCard = function (customerId, tokenId, callback) {
		this.stripe.customers.createCard(
			customerId,
			{
				card: tokenId
			},
			function (e, card) {
				if (e) {
					return callback(e);
				}

				if (this.checkCard(card) !== true) {
					return this.stripe.customers.deleteCard(
						customerId,
						card.id,
						function (e, confirmation) {
							if (e) {
								return callback(e);
							}

							if (confirmation.deleted !== true || confirmation.id !== card.id) {
								return callback(
									new Error('STRIPE: Card ' + card.id + ' couldn\'t be deleted!')
								);
							}

							callback(
								new Error('STRIPE: Card ' + card.id + ' failed security checks!')
							);
						}
					);
				}

				async.waterfall([
					function (cb) {
						this.stripe.customers.update(
							customerId,
							{
								default_card: card.id
							},
							cb
						);
					}.bind(this),
					function (customer, cb) {
						var oldDefaultCards = customer.cards.data
							.filter(function (card) {
								return card.id !== customer.default_card;
							}
						);

						// console.log('CARDS=', customer.cards.data);
						// console.log('DEFAULT_CARD=', customer.default_card);
						// console.log('OLD_DEFAULT_CARDS=', oldDefaultCards);
						// console.log('OLD_DEFAULT_CARD=', oldDefaultCards[0]);

						if (oldDefaultCards.length < 1) {
							return cb(null);
						}

						var oldDefaultCard = oldDefaultCards[0];

						this.stripe.customers.deleteCard(
							customerId,
							oldDefaultCard,
							cb
						);
					}.bind(this),
				], function (e) {
					if (e) {
						return callback(e);
					}

					callback(null, card);
				});
			}.bind(this)
		);
	};

	PaymentCards.prototype.getCard = function (tokenId, callback) {
		this.stripe.tokens.retrieve(tokenId, callback);
	};

	PaymentCards.prototype.compareCard = function (cardA, cardB) {
		var fingerprintA = (cardA || {}).fingerprint;
		var fingerprintB = (cardB || {}).fingerprint;
		return typeof fingerprintA === 'string' && fingerprintA.length && (fingerprintA === fingerprintB);
	};

	PaymentCards.prototype.checkCard = function (card) {
		var isValid = true;
		var keys = Object.keys(this.securityChecks.cards);
		var len = keys.length;
		var securityCheckConfig;
		var securityCheckResult;
		var key;

		while (len-- && isValid === true) {
			key = keys[len];
			securityCheckConfig = this.securityChecks.cards[key];
			securityCheckResult = card[key + '_check'];

			if (securityCheckConfig !== false && securityCheckResult !== 'pass') {
				isValid = false;
			}
		}

		return isValid;
	};

	return PaymentCards;

})();
