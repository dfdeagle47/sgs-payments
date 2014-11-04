module.exports = (function () {
	'use strict';

	function SmallestCurrencyUnit () {}

	SmallestCurrencyUnit.prototype.getCurrencyModifier = function (currency) {
		currency = currency.toUpperCase();

		if (!!~this.zeroDecimalCurrencies.indexOf(currency)) {
			return null;
		}

		return 0.01;
	};

	SmallestCurrencyUnit.prototype.zeroDecimalCurrencies = [
		'BIF',
		'DJF',
		'JPY',
		'KRW',
		'PYG',
		'VND',
		'XAF',
		'XPF',
		'CLP',
		'GNF',
		'KMF',
		'MGA',
		'RWF',
		'VUV',
		'XOF'
	];

	return new SmallestCurrencyUnit();

})();
