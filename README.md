County Health Rankings
=====

The University of Wisconsin Population Health Institute's annual report of county-by-county health data is a wonderful resource, but the data is locked in Excel files that change format over time and are formatted for humans, not machines. (Death to nested headers!) 

##Data
The Excel files that live in the `excel` directory were downloaded from [countyhealthrankings.org](http://www.countyhealthrankings.org/rankings/data) on April 22, 2015 and were not modified in any way. You are encouraged to redownload the files if you have any reason to suspect they have been modified. The citation for these files is:

> University of Wisconsin Population Health Institute. County Health Rankings & Roadmaps 2015. www.countyhealthrankings.org.

##Usage

We've already converted the Excel files into nested JSON files by year, available in the `json` directory. You can easily recreate this step with the following command:

	./parse_xls_files.json

To get data for each county for each year, just pass the name of the dataset and the field you want:

	./extract.js --dataset='Adult smoking' --field='% Smokers' > data/smoking.json