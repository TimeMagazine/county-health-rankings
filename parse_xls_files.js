#!/usr/bin/env node

var XLS = require("xlsjs"),
	fs = require("fs");

var data_files = require("./excel/filenames.json");

var schemas = {};

function parse(year) {
	year = year || 2010;

	var filename = "./excel/" + data_files[year];
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

	// 2014 has some nonsense in this row, which messes up the parsing
	rows["1"]["A"] = "";

	// this is for the top row: premature death, poor health, etc. (Death to nested headers!)
	var categories = [],
		category = "";

	// we need to connect the merged cells in the first row the cells in the second row. (Death to nested headers!)
	// we'll be counting the occurences of each header in the schemas object for a sense for how consistent the headers are
	for (var column in rows["2"]) {
		if (rows["1"][column]) {
			category = rows["1"][column].replace(/\./g, "").split(" (")[0];
			categories.push(category);
		}

		rows["2"][column] = {
			value: rows["2"][column].replace(/\./g, ""),
			category: category
		}

		if (category === "") {
			continue;
		}

		schemas[category] = schemas[category] || { count: 0, years: {} };

		if (!schemas[category].years[year]) {
			schemas[category].count += 1;
			schemas[category].years[year] = [];
		}
		schemas[category].years[year].push(rows["2"][column].value);
	}

	var counties = {};

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
			//console.log("No FIPS found for", row);
			continue;
		}

		var age_adjusted_indeces = {
			2015: "AJ"
		};

		county._id = county.FIPS + "_" + year;
		counties[county.FIPS] = county;
	}

	fs.writeFile("json/" + year + ".json", JSON.stringify(counties, null, 2));
	console.log("Found", Object.keys(counties).length, "counties in", year);
}

for (var y = 2010; y <= 2015; y += 1) {
	parse(y);	
}

fs.writeFile("json/schemas.json", JSON.stringify(schemas, null, 2));
