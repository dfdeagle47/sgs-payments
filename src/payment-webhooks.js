module.exports = (function () {
	'use strict';

	function PaymentWebhooks () {}

	PaymentWebhooks.prototype.hook = function (req, res) {
		var event = req.body || {};
		if (typeof event === 'string') {
			try {
				event = JSON.parse(event);
			}
			catch (e) {
				return res.status(500).send();
			}
		}

		this.stripe.events.retrieve(event.id, function (e, event) {
			if (e) {
				return res.status(500).send();
			}

			this.eventRouter(event, function (e) {
				if (e) {
					return res.status(500).send();
				}

				res.status(200).send();
			});
		}.bind(this));
	};

	return PaymentWebhooks;

})();
