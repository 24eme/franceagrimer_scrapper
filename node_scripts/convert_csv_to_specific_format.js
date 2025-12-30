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
        if (!data_global['Dossier']) {
            data_global['Dossier'] = csv[0];
        }
        if (!data_global['Campagne']) {
            data_global['Campagne'] = csv[0].substr(0,4) +'-'+(parseInt(csv[0].substr(0,4)) + 1);
        }
        try {
        if (csv[3].match('Résumé parcelle')) {
            if (!data_resume[csv[3]]) {
                data_resume[csv[3]] = [];
            }
            switch (csv[4]) {
                case "Commune":
                    data_resume[csv[3]]['Commune'] = csv[5];
                    break;
                case "Surface demandée":
                    data_resume[csv[3]]['Superficie'] = csv[5].replace(' ha ', ',').replace(' a ', '').replace(' ca', '');
                    break;
                case "Plantation":
                    if (csv[5] == 'X') {
                        data_resume[csv[3]]['Plantation'] = 'Oui';
                    }
                    break;
                case "Palissage":
                    if (csv[5] == 'X') {
                        data_resume[csv[3]]['Palissage'] = 'Oui';
                    }
                    break;
                case "Irrigation":
                    if (csv[5] == 'X') {
                        data_resume[csv[3]]['Irrigation'] = 'Oui';
                    }
                    break;
                case "Cépage":
                    data_resume[csv[3]]['Cépage'] = csv[5];
                    break;
                case "EIR":
                    data_resume[csv[3]]['EIR'] = csv[5];
                    break;
                case "EIP":
                    data_resume[csv[3]]['EIP'] = csv[5];
                    break;
                case "Objectifs principaux":
                    data_resume[csv[3]]['Objectif principal'] = csv[5].replace(' ha ', ',').replace(' a ', '').replace(' ca ', ' ').replace(' ca', ' ').replace(' ca', '');
                    data_resume[csv[3]]['Action'] = csv[5].split(' ').pop();
                    break;
                case "Parcelle demandée":
                    correspondance_parcelles_ids[csv[5]] = csv[3];
                    break;
                default:
            }
        }else if (csv[3].match('Détail des parcelles') && csv[4] == 'id') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]["Type d'autorisation"] = csv[5].substr(4,2);
        }else if (csv[3].match('Détail des parcelles') && csv[4] == 'Statut parcelle') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Statut demande'] = csv[5];
        }else if (csv[3].match('Détail des parcelles') && !csv[3].match('Liste des droits') && csv[4] == 'Appellation') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Appellation'] = csv[5];
        }else if (csv[3].match('Détail des parcelles') && !csv[3].match('Liste des droits') && csv[4] == 'Section') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Section'] = csv[5];
        }else if (csv[3].match('Détail des parcelles') && csv[4] == 'Référence cadastrale') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Dep'] = csv[5].substr(0,2);;
        }else if (csv[3].match('Détail des parcelles') && csv[4] == 'Action') {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Type de restructuration'] = csv[5];
        }else if (csv[4].match('Engagement n')) {
            data_global['Engagement'] = csv[5];
        }else if (csv[4] == 'Raison sociale SIRET') {
            data_global['Demandeur'] = csv[5];
        }else if (csv[4] == 'CVI') {
            data_global['CVI'] = csv[5];
        }else if (csv[4] == 'Engagement plan') {
            data_global['Type demande'] = csv[5];
        }else if (csv[4] == 'Total surfaces PLA-indiv' && csv[5] != '-') {
            data_global['PLA-indiv'] = csv[5].replace('.', ',');
        }else if (csv[4] == 'Total surfaces PLA-coll' && csv[5] != '-') {
            data_global['PLA-coll'] = csv[5].replace('.', ',');
        }else if (csv[4] == 'Total surfaces PAL-seul' && csv[5] != '-') {
            data_global['PAL-seul'] = csv[5].replace('.', ',');
        }else if (csv[4] == 'Total surfaces IRR-seule' && csv[5] != '-') {
            data_global["IRR-seule"] = csv[5].replace('.', ',');
        }else if (csv[4] == 'Total surfaces PAL+IRR-seuls' && csv[5] != '-') {
            data_global['PAL+IRR-seuls'] = csv[5].replace('.', ',');
        }else if (csv[4] == "Contrôles réalisés Cépage éligible") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Contrôles réalisés Cépage éligible'] = csv[5];
        }else if (csv[4] == "Contrôles réalisés AOP éligible") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Contrôles réalisés AOP éligible'] = csv[5];
        }else if (csv[4] == "Contrôles réalisés Action principale éligible") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Contrôles réalisés Action principale éligible'] = csv[5];
        }else if (csv[4] == "Contrôles réalisés Actions complémentaires éligibles") {
            let myid = correspondance_parcelles_ids[parseInt(csv[3].split(' ')[3])];
            if (!data_resume[myid]) {
                data_resume[myid] = [];
            }
            data_resume[myid]['Contrôles réalisés Actions complémentaires éligibles'] = csv[5];
        }else{
            if (debug) console.log("DEBUG: line sans intéret");
        }
        } catch (err) {
            console.error([err,csv]);
        }
    });
} catch (err) {
    console.error(err);
}
if (with_header) {
    //Previous : J: PLA-indiv;K: PLA-coll;L: PAL-seul;M: IRR-seule;N: PAL+IRR-seuls;
    console.log("Dossier;CVI;Engagement;Demandeur;Type demande;Statut demande;Campagne;Action;Type de restructuration;Plantation;Palissage;Irrigation;Type d'autorisation;Appellation;Cépage;EIR;EIP;Dep;Commune;Section;Superficie;Objectif principal;Contrôles réalisés Cépage éligible;Contrôles réalisés AOP éligible;Contrôles réalisés Action principale éligible;Contrôles réalisés Actions complémentaires éligibles;Assurance");
}
if (!Object.keys(data_resume).length) {
    data_resume['detail fictif'] = [];
    data_resume['detail fictif']['Statut demande'] = 'Demande sans parcelle';
}
for(x in data_resume) {
    let res = {...data_resume[x], ...data_global};
//  let keys = ['A',      'B',  'C',         'D',        'E',           'F',            'G',       'H',     'I',                       'J',         'K',        'L',         'M',                  'N',          'O',     'P',  'Q',  'R',  'S',      'T',      'U',         'V',                 'W',                                 'X',                              'Y',                                           'Z',                                                   'AA'
    let keys = ['Dossier','CVI','Engagement','Demandeur','Type demande','Statut demande','Campagne','Action','Type de restructuration','Plantation','Palissage','Irrigation',"Type d'autorisation",'Appellation','Cépage','EIR','EIP','Dep','Commune','Section','Superficie','Objectif principal','Contrôles réalisés Cépage éligible','Contrôles réalisés AOP éligible','Contrôles réalisés Action principale éligible','Contrôles réalisés Actions complémentaires éligibles','Assurance'];
    let line = "";
    for(y in keys) {
        if (!res[keys[y]]) {
             if (keys[y] == 'Plantation' || keys[y] == 'Palissage' || keys[y] == 'Irrigation') {
                res[keys[y]] = 'Non';
            }else {
                res[keys[y]] = '';
            }
        }
        line += res[keys[y]] + ";";
    }
    console.log(line);
}