(function($) {
	var time = require('time-interactive');	
	var interactive = time("county_health_rankings_2015");
	var d3 = require("d3");
	var base = require("d3-base");
	var topojson = require("topojson");

	var us = require("./data/us.json");
	var data = require("./data/json/adjusted_2015.json");
	var county_names = require("./data/county_names.json");

	//CSS
	require("./src/styles.less");

	var fipsToState = require("./data/fipsToState.json");

	//MARKUP
	$(require("./src/base.html")({
		headline: "",
		intro: ""
	})).appendTo(interactive.el);

	var tooltip = require("./src/tooltip.html");

	var projection = d3.geo.albersUsa()
	    .scale(1150)
	    .translate([950 / 2, 550 / 2]);

	var path = d3.geo.path()
	    .projection(projection);

	var color_scale = d3.scale.linear().domain([0, 600]).range(["white", "#900"]);

	var b = base("#canvas", {
		width: 900,
		resize: "auto"
	});

	var counties = topojson.feature(us, us.objects.counties).features;

	counties = counties.filter(function(d) {
		d.id = d.id < 10000? ("0" + d.id) : ("" + d.id);
		d.properties.st = fipsToState[d.id.slice(0, 2)];
		d.properties.nm = county_names[d.id];
		return d.properties.st;
	});

	b.svg.selectAll(".county")
		.data(counties)
		.enter().append("path")
    	.attr("d", path)
    	.each(function(d) {
			d.data = data[d.id];
    	})
    	.attr("class", function(d) {
    		return "county " + d.properties.st.replace(" ", "_");
    	})
		.style("fill", function(d, i) {
			if (!d.data || !d.data[0]) {
				d.color = "#FFF";
			} else {
				d.color = color_scale(d.data[0]);
			}
			return d.color;
		})
    	.tooltip(function(d, i, obj) {
    		var this_class = d3.select(obj).attr("class");
    		if (d.data[0]) {
    			return tooltip(d);
    		} else {
    			return "Insufficient data";
    		}
    	});

	b.svg.append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a, b) {
			return a !== b; // a border between two states
		}))
		.attr("class", "state-boundary")
		.attr("d", path);

    function makeLegend() {
        var number_of_steps = interactive.width() > 500? 10 : 5;
		var step = 1000 / number_of_steps;

        d3.selectAll("#county_health_rankings_2015 .legend ul li").remove();  
        d3.select("#county_health_rankings_2015 .legend ul").selectAll("li")
            .data(d3.range(0, 1001, step))
            .enter()
            .append("li")
            .html(function(d, i) {
            	return d? d : "N/A";
            })
            .attr("class", "legend_block")
            .style("border-bottom", function(d, i) {
            	return "12px solid " + color_scale(d);
            })
            .style("width", Math.floor(100 / (number_of_steps + 1)) + "%");
    }

	makeLegend();

}(window.jQuery));

