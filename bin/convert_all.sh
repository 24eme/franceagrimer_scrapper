#!/bin/bash

ls export/*pdf | while read file ; do
	pdf=$(basename $file)
     	xml=$(echo "$pdf" | sed 's/pdf$/xml/')
        csv=$(echo "$pdf" | sed 's/pdf$/csv/')
	mkdir -p tmp
	cp $file tmp/
	cd tmp/
	pdftohtml -xml $pdf > /dev/null
        cd ..
	node node_scripts/scrap_xml_pdf_dossier.js "tmp/"$xml | sort -u > "res/"$csv
	node node_scripts/convert_csv_to_specific_format.js "res/"$csv
#	rm -rf tmp
done
