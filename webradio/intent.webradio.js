'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _helpers = require('../../node_modules/ava-ia/lib/helpers');

exports.default = function (state, actions) {

	if (state.isIntent) return (0, _helpers.resolve)(state);

	var tokens = (0, _helpers.intersect)(Config.modules.webradio.rules.openWebradio, state.tokens);

	if (tokens) {
		if (state.debug) info('Intent WebRadio'.bold.green, 'syntax:', 'true'.green);
		state.isIntent = true;
		return (0, _helpers.factoryActions)(state, actions);
	} else
		return (0, _helpers.resolve)(state);
};

