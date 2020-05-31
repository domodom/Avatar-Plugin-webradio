'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _helpers = require('../../node_modules/ava-ia/lib/helpers');
var _ = require('underscore');

// Ignoré une fois dans TERM
var TERM = ['radio', 'lance', 'lances', 'mets', 'met', 'démarres', 'démarre', 'écouter', 'je', 'veux', 'sur', 'la', 'le', 'de'];


exports.default = function (state) {

	return new Promise(function (resolve, reject) {

		var TAKEN = [];
		for (var i in TERM) {
			TAKEN.push(0);
		}

		var search = '';
		var indexRadio, stopRadio, pos, take;
		var terms = state.rawSentence.split(' ');

		terms.map(function (term, index) {

			if (!indexRadio && term.toLowerCase() === 'radio') indexRadio = true;
			if (term.toLowerCase() === 'coupe' || term.toLowerCase() === 'stop' || term.toLowerCase() === 'stoppe' || term.toLowerCase() === 'arrête') stopRadio = true;

			if (indexRadio) {

				take = false;
				pos = _.indexOf(TERM, term.toLowerCase());

				if (pos != -1) {
					if (TAKEN[pos] == 0) {
						if (search && search.length > 0) {
							take = true;
						} else {
							TAKEN[pos] = 1;
						}
					}
				} else {
					take = true;
				}
				if (take) {
					search += term;
					if (terms[index + 1]) search += ' ';
				}
			}
		});

		// Recherche si une pièce est dans la phrase.
		let room = Avatar.ia.clientFromRule(state.rawSentence);

		if (search) search = search.toLowerCase().replace('l\'', ''); 
		
		if (indexRadio && !stopRadio) {
			setTimeout(function () {
				state.action = {
					module: 'webradio',
					command: 'openWebradio',
					room: room,
					radio: search
				};
				resolve(state);
			}, 500);
		} else {
			setTimeout(function () {
				state.action = {
					module: 'webradio',
					command: 'stopWebradio',
					room: room
				};
				resolve(state);
			}, 500);
		}
	});
}