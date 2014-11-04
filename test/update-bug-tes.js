var stripe = require('stripe')(
	'sk_test_KIcctxzFOY37X74CGN6tJi3X'
);

var createToken = function (card, callback) {
	stripe.tokens.create({
		card: card
	}, callback);
};

var createCustomer = function (email, callback) {
	stripe.customers.create({
		email: email
	}, callback);
};

var createCard = function (customerId, tokenId, callback) {
	stripe.customers.createCard(
		customerId,
		{
			card: tokenId
		},
		callback
	);
};

var updateCustomerCard = function (customerId, cardId, callback) {
	stripe.customers.update(
		customerId,
		{
			default_card: cardId
		},
		callback
	);
};

var deleteCustomerCard = function (customerId, cardId, callback) {
	stripe.customers.deleteCard(
		customerId,
		cardId,
		callback
	);
};

createToken({
	number: '4242424242424242',
	exp_month: '12',
	exp_year: '2015',
	cvc: '123'
}, function (e, token) {
	if (e) {
		throw e;
	}

	createCustomer('info@sagacify.com', function (e, customer) {
		if (e) {
			throw e;
		}

		createCard(customer.id, token.id, function (e, card) {
			if (e) {
				throw e;
			}

			updateCustomerCard(customer.id, card.id, function (e, customer) {
				if (e) {
					throw e;
				}

				console.log('\n---------- (1) ----------');
				console.log('DEFAULT_CARD=', customer.default_card);
				console.log('NUM_CARDS=', customer.cards.data.length);
				console.log('CARDS=', customer.cards.data);
				console.log('---------- (1) ----------');

				createToken({
					number: '4000000000000101',
					exp_month: '12',
					exp_year: '2015',
					cvc: '123'
				}, function (e, token) {
					if (e) {
						throw e;
					}

					createCard(customer.id, token.id, function (e, card) {
						if (e) {
							throw e;
						}

						updateCustomerCard(customer.id, card.id, function (e, customer) {
							if (e) {
								throw e;
							}

							console.log('\n---------- (2) ----------');
							console.log('DEFAULT_CARD=', customer.default_card);
							console.log('NUM_CARDS=', customer.cards.data.length);
							console.log('CARDS=', customer.cards.data);
							console.log('---------- (2) ----------');

							deleteCustomerCard(customer.id, token.id, function (e, card) {
								if (e) {
									throw e;
								}

								
							});
						});
					});
				});
			});
		});
	});
});
