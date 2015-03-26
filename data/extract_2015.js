var fs = require("fs");

var fields = require("./fields.json");

var args = require('minimist')(process.argv.slice(2));

var MongoClient = require('mongodb').MongoClient;

var datasets = {
	smoking: {
		name: "Adult smoking",
		data_index: 1,
		low_index: 2,
		high_index: 3
	},
	death: {
		name: "Premature death",
		data_index: 1
	},
	ypll: {
		name: "Premature death",
		data_index: 2
	},
	adjusted: {
		name: "misc",
		data_index: 1
	}
};

MongoClient.connect("mongodb://localhost:27017/county_health_rankings", function(err, db) {
	extract(db, datasets[args._[0]]);
});

function extract(db, dataset) {
	var collection = db.collection("counties");

	var counties = {};

	collection.find({ year: 2015 }).each(function(err, doc) {
		if (!doc) {
			fs.writeFile("json/" + args._[0] + "_2015.json", JSON.stringify(counties));
			db.close();
			return;
		}

		var field = fields[dataset.name].years[doc.year][dataset.data_index],
			//value = [ doc.population, doc.data[dataset.name][field] ];
			value = [ doc.data[dataset.name][field], doc.data[dataset.name].population ];

		if (dataset.low_index) {
			value.push(doc.data[dataset.name][fields[dataset.name].years[doc.year][dataset.low_index]]);
			value.push(doc.data[dataset.name][fields[dataset.name].years[doc.year][dataset.high_index]]);
		}

		counties[doc.FIPS] = value;
	});
}