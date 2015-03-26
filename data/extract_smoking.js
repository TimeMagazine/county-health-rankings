var fs = require("fs");

var fields = require("./fields.json");

var args = require('minimist')(process.argv.slice(2));

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/county_health_rankings", function(err, db) {
	extract(db);
});

function extract(db, dataset) {
	var collection = db.collection("counties");

	var counties = [];

	collection.find({ year: 2015 }).each(function(err, doc) {
		if (!doc) {
			console.log(counties.length);
			fs.writeFile("json/smokers_2015.json", JSON.stringify(counties));
			db.close();
			return;
		}

		var county = {
			fips: 	   doc.FIPS,
			name: doc.County + ", " + doc.State,
			mortality: doc.data.misc.age_adjusted_mortality,
			smoking:   doc.data["Adult smoking"]["% Smokers"],
			obesity:   doc.data["Adult obesity"]["% Obese"]
		};

		counties.push(county);
	});
}