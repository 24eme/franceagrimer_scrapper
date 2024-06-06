#!/bin/bash

. bin/config.inc

export FRANCEAGRIMER_USERNAME
export FRANCEAGRIMER_PASSWORD
export FRANCEAGRIMER_DEBUG

campagne=$1
date=$2
if ! test "$campagne"; then
	echo "Campagne attendu";
	exit 2
fi
if ! test "$date"; then
date=$(date +%Y%m%d%H%M)
fi

mkdir -p download/$$ export
rm -f download/$$/Export-*csv

csvdossier=export/$date"_"$campagne"_"dossiers.csv

if ! test -f "$csvdossier"; then

node node_scripts/scrap_csv_campagne.js download/$$ $campagne
if ! test -f download/$$/Export-*csv ; then
	echo "L'export a échoué pour la campagne $campagne"
	exit 1
fi
mv -f download/$$/Export-*csv $csvdossier
recode ISO88591..UTF8 $csvdossier

fi

rm -f download/$$/*pdf
cat $csvdossier | awk -F ';' '{print $3}' | grep '^[0-9]' | sed 's/DU$//' | while read dossier ; do
	if ! find export/ -name "*"$dossier"*pdf" | grep "$dossier" ; then
	node node_scripts/scrap_pdf_campagne_cvi.js download/$$ $campagne $dossier"DU"
	if ! test -f download/$$/*pdf ; then
		echo "ERREUR: $dossier non récupéré";
	else
		mv -f download/$$/*pdf export/
	fi
	fi
done

