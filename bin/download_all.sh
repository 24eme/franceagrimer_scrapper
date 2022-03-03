#!/bin/bash

. bin/config.inc

export FRANCEAGRIMER_USERNAME
export FRANCEAGRIMER_PASSWORD
export FRANCEAGRIMER_DEBUG

campagne=$1

if ! test "$campagne"; then
	echo "Campagne attendu";
	exit2
fi

date=$(date +%Y%m%d%H%M)

mkdir -p download export
rm -f download/Export-*csv

node puppeteer_scripts/export_csv_campagne.js download $campagne
if ! test -f download/Export-*csv ; then
	echo "L'export a échoué pour la campagne $campagne"
	exit 1
fi
csvdossier=export/$date"_"$campagne"_"dossiers.csv
mv -f download/Export-*csv $csvdossier
recode ISO88591..UTF8 $csvdossier
rm -f download/*pdf
cat $csvdossier | awk -F ';' '{print $3}' | grep '^[0-9]' | while read dossier ; do
	node puppeteer_scripts/export_pdf_campagne_cvi.js download $campagne $dossier
	if ! test -f download/*pdf ; then
		echo "ERREUR: $dossier non récupéré";
	else
		mv -f download/*pdf export/
	fi
done

