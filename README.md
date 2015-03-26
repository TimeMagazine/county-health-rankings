Source files for county_health_rankings_2015
=====

##Installation and setup

Clone the repository anywhere you want it (if you didn't create it in the first place with the `time-interactive` CLI).

	git clone git@git.time-sandbox.com:timelabs/county_health_rankings_2015.git

Then switch to that directory and install the dependencies

	cd county_health_rankings_2015 && npm install

##Developing and building the app

This interactive is developed with [browserify](https://github.com/substack/node-browserify), which allows you to `require()` dependencies in a Node-like manner. The code lives in `debug.js`.

Any time you want to deploy, you need to bundle the `debug.js` file into a single script file that the browser can understand, like so:

With source mapping for debugging:

	browserify debug.js > script.js --debug

Minified (after running `npm install -g uglifyjs` once)

	browserify debug.js | uglifyjs > script.js