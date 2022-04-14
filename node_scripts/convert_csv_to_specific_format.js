const fs = require('fs');
var debug = 0;
var with_header = (process.argv[3]) && (process.argv[3] == 1);

try {
    // read contents of the file
    let csv_file = process.argv[2];
    const data = fs.readFileSync(csv_file, 'UTF-8');

    // split the contents by new line
    const lines = data.split(/\r?\n/);


    var data_resume = [];
    var data_global = [];
    var correspondance_parcelles_ids = [];
    // print all lines
    lines.forEach((line) => {
        if (debug) console.log("DEBUG: line: "+line)
        if (!line) {
            return;
        }
        let csv = line.split(';');
        if (!data_global['0']) {
            data_global['0'] = csv[0];
        }
        if (!data_global['D']) {
            data_global['D'] = csv[0].substr(0,4) +'-'+(csv[0].substr(0,4) + 1);
        }
        if (csv[3].match('Résumé parcelle')) {
            if (!data_resume[csv[3]]) {
                data_resume[csv[3]] = [];
            }
            switch (csv[4]) {
                case "Commune":
                    data_resume[csv[3]]['O'] = csv[5];
                    break;
                case "Surface demandée":
                    data_resume[csv[3]]['Q'] = csv[5];
                    break;
                case "Plantation":
                    if (csv[5] == 'X') {
                        data_resume[csv[3]]['G0'] = 'Oui';
                    }
                    break;
                case "Pallissage":
                    if (csv[5] == 'X') {
                        data_resume[csv[3]]['G1'] = 'Oui';
                    }
                    break;
                case "Irrigation":
                    if (csv[5] == 'X') {
                        data_resume[csv[3]]['H'] = 'Oui';
                    }
                    break;
                case "Cépage":
                    data_resume[csv[3]]['K'] = csv[5];
                    break;
                case "EIR":
                    data_resume[csv[3]]['L'] = csv[5];
                    break;
                case "EIP":
                    data_resume[csv[3]]['M'] = csv[5];
                    break;
                case "Objectifs principaux":
                    data_resume[csv[3]]['R'] = csv[5];
                    data_resume[csv[3]]['E'] = csv[5].split(' ').pop();
                    break;
                case "Parcelle demandée":
                    correspondance_parcelles_ids[csv[5]] = csv[3];
                    break;
                default:
            }
        }else if (csv[3].match('Détail des parcelles') && csv[4] == 'id') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['I'] = csv[5].substr(4,2);
        }else if (csv[3].match('Détail des parcelles') && csv[4] == 'Statut parcelle') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['D0'] = csv[5];
        }else if (csv[3].match('Détail des parcelles') && !csv[3].match('Liste des droits') && csv[4] == 'Appellation') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['J'] = csv[5];
        }else if (csv[3].match('Détail des parcelles') && !csv[3].match('Liste des droits') && csv[4] == 'Section') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['P'] = csv[5];
        }else if (csv[4].match('Engagement n')) {
            data_global['A'] = csv[5];
        }else if (csv[4] == 'Raison sociale SIRET') {
            data_global['B'] = csv[5];
        }else if (csv[4] == 'Engagement plan') {
            data_global['C'] = csv[5];
        }else if (csv[4] == 'Total surfaces PLA-indiv' && csv[5] != '-') {
            data_global['F'] = 'Plantation';
        }else if (csv[4] == 'Total surfaces PLA-coll' && csv[5] != '-') {
            data_global['F'] = 'Plantation';
        }else if (csv[4] == 'Total surfaces PAL-seul' && csv[5] != '-') {
            data_global['F'] = 'Palissage';
        }else if (csv[4] == 'Total surfaces IRR-seule' && csv[5] != '-') {
            data_global['F'] = 'Irrigation';
        }else if (csv[4] == 'Total surfaces PAL+IRR-seuls' && csv[5] != '-') {
            data_global['F'] = 'Palissage + Irrigation';
        }else if (csv[4] == "Contrôles réalisés Cépage éligible") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['S'] = csv[5];
        }else if (csv[4] == "Contrôles réalisés AOP éligible") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['T'] = csv[5];
        }else if (csv[4] == "Contrôles réalisés Action principale éligible") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['U'] = csv[5];
        }else if (csv[4] == "Contrôles réalisés Actions complémentaires éligibles") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            data_resume[myid]['V'] = csv[5];
        }
        
        
    });
} catch (err) {
    console.error(err);
}
if (with_header) {
    console.log("Dossier;Engagement;Demandeur;Type demande;Statut demande;Campagne;Action;Type de restructuration;Plantation;Palissage;Irrigation;Type d'autorisation;Appellation;Cépage;Entre rang;Entre pied;Dep;Commune;Section;Superficie;Objectif principal;Contrôles réalisés Cépage éligible;Contrôles réalisés AOP éligible;Contrôles réalisés Action principale éligible;Contrôles réalisés Actions complémentaires éligibles;Assurance");
}
for(x in data_resume) {
    let res = {...data_resume[x], ...data_global};
    let keys = ['0', 'A','B','C','D0','D','E','F','G0','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V'];
    let line = "";
    for(y in keys) {
        if (!res[keys[y]]) {
            if (keys[y] == 'G' || keys[y] == 'G0' || keys[y] == 'H') {
                res[keys[y]] = 'Non';
            }else {
                res[keys[y]] = '';
            }
        }
        line += res[keys[y]] + ";";
    }
    console.log(line);
}