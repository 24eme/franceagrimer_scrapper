#!/bin/bash

header="1"
ls $1/*pdf | while read file ; do
	pdf=$(basename $file)
     	xml=$(echo "$pdf" | sed 's/pdf$/xml/')
        csv=$(echo "$pdf" | sed 's/pdf$/csv/')
	mkdir -p tmp
	cp $file tmp/
	cd tmp/
	pdftohtml -xml $pdf > /dev/null
        cd ..
	node node_scripts/parsing_xml_pdf_dossier.js "tmp/"$xml | sort -u > "res/"$csv
	node node_scripts/convert_csv_to_specific_format.js "res/"$csv $header
	header="0"
#	rm -rf tmp
done
