var XLS = require("xlsjs"),
	fs = require("fs");

var data_files = {
	"2010": "2010 County Health Rankings National Data.xls",
	"2011": "2011 County Health Rankings National Data_v2.xls",
	"2012": "2012 County Health Rankings National Data_v2.xls",
	"2013": "2013 County Health Rankings Data - v1.xls",
	"2014": "2014 County Health Rankings Data - v1.xls",
	"2015": "2015 County Health Rankings Data - v1.xls"
}

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/county_health_rankings", function(err, db) {
	parse(db);
});

var schemas = {};

function parse(db, year) {
	year = year || 2011;

	var collection = db.collection("counties");
	var filename = data_files[year];
	var workbook = XLS.readFile(filename);	
	var data = workbook.Sheets["Ranked Measure Data"];
	var additional = workbook.Sheets["Additional Measure Data"];

	var parse_row_id = /([A-Z]+)([0-9]+)/;

	var rows = {}; // we're going to organize the cells by row

	for (var cell in data) {
		var row_column = parse_row_id.exec(cell);
		if (!row_column) {
			continue;
		}
		var column = row_column[1],
			row = row_column[2];

		rows[row] = rows[row] || {};
		rows[row][column] = data[cell].v;
	}

	// this is for the top row: premature death, poor health, etc.
	var categories = [],
		category = "";

	// we need to connect the merged cells in the first row the cells in the second row
		
	for (var column in rows["2"]) {
		if (rows["1"][column]) {
			category = rows["1"][column].replace(/\./g, "").split(" (")[0];
			categories.push(category);
		}

		rows["2"][column] = {
			value: rows["2"][column].replace(/\./g, ""),
			category: category
		}
		schemas[category] = schemas[category] || { count: 0, years: {} };

		if (!schemas[category].years[year]) {
			schemas[category].count += 1;
			schemas[category].years[year] = [];
		}
		schemas[category].years[year].push(rows["2"][column].value);
	}

	var data = {};

	var count = 0,
		target = Object.keys(rows).length - 2;

	for (var row in rows) {
		if (row == 1 || row == 2) {
			continue;
		}

		var county = {
			year: year,
			data: {}
		};

		categories.forEach(function(category) { 
			county.data[category] = {};
		});

		county.data.misc = {};

		for (var column in rows[row]) {
			var header = rows["2"][column];
			// FIPS. State. County. etc.
			if (header.category == "") {
				county[header.value] = rows[row][column];
			} else {
				county.data[header.category][header.value] = rows[row][column];
			}
		}

		if (!county.FIPS || !county.County) {
			target -= 1;
			//console.log("No FIPS found for", row);
			continue;
		}

		var age_adjusted_indeces = {
			2015: "AJ"
		};

		county._id = county.FIPS + "_" + year;
		county.data.misc.population = additional["D" + row].v;
		county.data.misc.age_adjusted_mortality = additional["AJ" + row]? additional["AJ" + row].v : null;

		collection.insert(county, function(err, doc) {
			if (err) {
				//console.log(err);
			}
			count += 1;
			process.stdout.write(count + "\r");
			if (count == target) {
				console.log("Found", count, "counties in", year);
				if (data_files[year + 1]) {
					parse(db, year + 1);
				} else {
					db.close();
					fs.writeFile("schemas.json", JSON.stringify(schemas, null, 2));					
				}
			}
		});
	}
}

