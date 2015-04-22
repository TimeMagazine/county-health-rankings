#!/usr/bin/env node

var fs = require("fs");
var args = require('minimist')(process.argv.slice(2));

if (!args.dataset || !args.field) {
	console.log("You need to give extract.js two arguments, e.g.: --dataset='Adult smoking' --field='% Smokers'")
	return;
}

extract(args.dataset, args.field);

function extract(dataset, field) {
	var data = {};

	for (var year = 2010; year <= 2015; year += 1) {
		var json = require("./json/" + year + ".json");

		for (var fips in json) {
			data[fips] = data[fips] || {
				county: json[fips].County,
				state:  json[fips].State
			};
			data[fips][year] = json[fips].data[dataset][field];
		}
	}

	console.log(JSON.stringify(data, null, 2));
}