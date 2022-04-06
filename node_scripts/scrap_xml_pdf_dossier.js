const fs = require('fs');
var debug = 0;

try {
    // read contents of the file
    let xml_file = process.argv[2];
    const data = fs.readFileSync(xml_file, 'UTF-8');
    var [dossier, maj] = xml_file.replace(/.*RecapRS_/, '').replace('.', '_').split("_");

    // split the contents by new line
    const lines = data.split(/\r?\n/);

    var i = 0;
    var parcelleid = 0;
    var cadastraleid = 0;
    var oldtop = 0;
    var action = '';
    var oldaction = 'OLD';
    var key = '';
    var oldkey = '';
    var buffervalue = '';
    var ordre = '0';
    // print all lines
    lines.forEach((line) => {
        let top = line.split('"')[1]
        let left = line.split('"')[3]
        if (line.match(/<image .*jpg/)) {
            parcelleid++;
        }
        line = line.replace(/<[^>]*>/g, ';');
        line = line.replace(/^;?[ \t]*/, '');
        line = line.replace(/[ \t]*;?$/, '');
        line = line.replace(':',';');
        if (line.match(/^Statut parcelle/) || line.match(/^Date transmission/)) {
            line = ';'+line;
        }
        i++;
        if (debug) console.log("DEBUG: line ("+i+") "+line);
        switch (line.split(';')[1]) {
            case 'Dossier N° ':
                if (action == 'parcelles restructuration') {
                    parcelleid = 0;
                }
                action = '';
                return;
            case 'N° CVI':
                buffervalue = '';
                action = 'CVI';
                ordre = '0';
                return;
            case 'N° SIRET':
                action = 'SIRET';
                ordre = '0';
                return;
            case 'du siège':
                ordre = '1';
                key = 'Contact Adresse du siege';
                action = 'twolines';
                return;
            case 'de correspondance':
                ordre = '1';
                key = 'Contact Adresse de correspondance';
                action = 'twolines';
                return;
            case 'Adresse ':
                return;
            case 'Téléphone fixe':
                key = 'Contact Telephone fixe';
                action = 'sameline';
                break;
            case 'Contact Téléphone portable ':
                key = 'Telephone portable';
                action = 'sameline';
                break;
            case 'Contact Courriel ':
                action = 'sameline';
                key = 'Email';
                break;
            case 'PLA-indiv':
            case 'PLA-coll':
            case 'PAL-seul':
            case 'IRR-seule':
            case 'PAL+ IRR-':
            case 'seuls':
                action = 'Total surfaces demandées par action';
                return;
            case 'Plan':
                key = 'Engagement plan';
                action = 'nextline';
                return ;
            case 'N°':
                if (action == 'controles realises droits') {
                    return;
                }
                key = 'Engagement n°';
                action = 'nextline';
                return ;
            case 'Surface demandée':
                if (action == 'parcelles restructuration')  return ;
                key = 'Engagement surface demandée (ha)';
                action = 'nextline';
                return ;
            case "Nombre d'associés du GAEC total":
                buffervalue  = '';
                key = 'Nombre associés du GAEC';
                action = 'nextline';
                return ;
            case "Demande d'avance individuelle":
                key = 'Surface demandée avance individuelle';
                action = 'getline4';
                return ;
            case "Demande d'avance collective":
                key = 'Surface demandée avance collective';
                action = 'getline4';
                return ;
            case 'densité':
                if (action == 'controles realises droits') {
                    return;
                }
                key = 'Option PCR retenue pour le recours au changement de densité';
                action = 'nextline';
                return ;
            case 'RIB IBAN/BIC (format SEPA)':
                action = 'RIB';
                return;
            case 'Date de transmission DA ST':
                key = 'Date de transmission DA ST'
                action = 'nextline';
                return ;
            case 'Date de transmission DP ST':
                key = 'Date de transmission DP ST'
                action = 'nextline';
                return ;
            case 'Parcelles Restructuration':
                ordre = '2';
                action = 'parcelles restructuration';
                return ;
            case 'Parcelle demandée ':
            case 'Surface demandée ':
            case 'Action ':
            case 'Action complémentaire ':
            case 'Objectifs principaux ':
            case 'Commune ':
            case 'Section ':
            case 'EIR ':
            case 'EIP ':
            case 'Cépage ':
            case 'Statut parcelle ':
            case 'Date transmission ST ':
            case 'Appellation ':
            case 'Densité (pieds/ha) ':
                ordre = '3';
                key = 'Détail des parcelles '+parcelleid+' '+line.split(';')[1].trim();
                action = 'sameline';
                if(line == ";Statut parcelle ; En cours d’;") {
                    line = ";Statut parcelle ; En cours d’instruction";
                }
                break;
            case 'Parcelles plantées qui composent la parcelle culturale':
                action = 'parcelle culturale';
                cadastraleid = 1;
                break;
            case 'Règles supplémentaires':
                key = 'Détail des parcelles '+parcelleid+' Règles supplémentaires'
                action = 'nextline';
                return;
            case 'Contrôles réalisés':
                if (action == 'sameline') {
                    action = 'controles realises';
                }else{
                    action = 'controles realises droits';
                }
                return;
            case 'Surface retenue suite ':
                action = '';
                return;
            case 'Liste des droits / des arrachages / des parcelles à arracher':
                action = 'liste des droits';
                return;
            default:
        }
        if (debug) console.log("DEBUG: action: "+action+" != "+oldaction);
        if (action != oldaction) {
            i = 0;
        }
        oldaction = action;
        buffervalue += line.replace(/;/g, '')+" ";
        switch (action) {
            case 'CVI':
                if (i == 0) {
                    key = 'CVI';
                }else if(i == 1) {
                    key = 'Raison sociale du CVI';
                }
                break;
            case 'SIRET':
                if (i == 0) {
                    key = 'SIRET';
                } else if (i == 1) {
                    key = 'Type societe';
                } else if (i == 2) {
                    key = 'Raison sociale SIRET';
                }
                break;
            case 'twolines':
                if (i < 2) {
                    return;
                }
                oldaction = '';
                break;
            case 'getline4':
                if (i < 3) {
                    buffervalue = '';
                    return;
                }
                oldaction = '';
                break;
            case 'nextline':
                oldaction = '';
                break;
            case 'sameline':
                c = line.split(';');
                if (c.length < 3) {
                    key = '';
                    return;
                }
                buffervalue = c[2];
                oldaction = '';                
                break;
            case 'Total surfaces demandées par action':
                if (i == 0) key = 'Total surfaces PLA-indiv';
                if (i == 1) key = 'Total surfaces PLA-coll';
                if (i == 2) key = 'Total surfaces PAL-seul';
                if (i == 3) key = 'Total surfaces IRR-seule';
                if (i == 4) key = 'Total surfaces PAL+IRR-seuls';
                break;
            case 'RIB':
                if (i < 3 || i > 6) {
                    buffervalue = '';
                    return ;
                }
                if (i == 3) key = 'RIB identifiants';
                if (i == 4) key = 'RIB Titulaire';
                if (i == 5) key = 'RIB Domiciliation';
                if (i == 6) key = 'RIB Etat';
                break;
            case 'parcelles restructuration':
                if (i < 13) {
                    buffervalue = '';
                    return;
                }
                if (oldtop != top) {
                    parcelleid++;
                }
                oldtop = top;
                key = 'Résumé parcelle '+parcelleid;
                if (left > 1100) {
                    key += ' Objectifs principaux';
                }else if (left > 1000) {
                    key += ' EIP';
                }else if (left > 950) {
                    key += ' EIR';
                }else if (left > 800) {
                    key += ' Cépage'
                }else if (left > 750) {
                    key += ' Irrigation'
                }else if (left > 650) {
                    key += ' Palissage'
                }else if (left > 550) {
                    key += ' Plantation'
                }else if (left > 450) {
                    key += ' Surface demandée'
                }else if (left > 250) {
                    key += ' Commune'
                }else if (left > 180) {
                    key += ' Parcelle demandée'
                }else if (left > 20) {
                    key += ' N° GPS/ Surf. retenue'
                }
                break;
            case 'parcelle culturale':
                if (i < 13) {
                    buffervalue = '';
                    return;
                }
                if (buffervalue == 'Total ') {
                    key = '';
                    action = '';
                    return;
                }
                key = 'Détail des parcelles '+parcelleid+' Parcelle culturale '+cadastraleid;
                if (left > 420) {
                    cadastraleid++;
                    key += " Surface demandée"
                } else if (left > 320) {
                    key += " Campagne de plantation"
                } else if (left > 190) {
                    key += " Surface au CVI"
                }else if (left > 120) {
                    key += " Numéro d'ordre"
                } else if (left > 25) {
                    key += ' Référence cadastrale'
                } else if (left > 20) {
                    key = 'Détail des parcelles '+parcelleid+' Parcelle culturale id';
                }
                break;
            case 'controles realises':
                if (i % 2 == 0) {
                    key = 'Détail des parcelles '+parcelleid+' Contrôles réalisés '+buffervalue.trim();
                    buffervalue = '';
                    return;
                }
                break;
            case 'liste des droits':
                if (i < 25 || (i < 31 && left > 500)) {
                    buffervalue = '';
                    return;
                }
                key = 'Détail des parcelles '+parcelleid+' Liste des droits '+cadastraleid+' ';
                if (left > 1300) {
                    key += "Code mesure RS"; 
                } else if (left > 1200) {
                    key += "Dossier AP (hors PCL)";
                } else if (left > 1060) {
                    key += "Résultat instruction";
                } else if (left > 990) {
                    key += "Type de instruction";
                } else if (left > 850) {
                    key += "Surface demandée";
                } else if (left > 700) {
                    key += "Cépage";
                } else if (left > 610) {
                    key += "Densité (pieds/ha)";
                } else if (left > 570) {
                    key += "EIP";
                } else if (left > 530) {
                    key += "EIR";
                } else if (left > 400) {
                    key += "Appellation";
                } else if (left > 260) {
                    key += "Date d'arrachage";
                } else if (left > 145) {
                    key += 'Référence cadastrale';
                } else if (left > 110) {
                    key += 'Type de droit';
                } else if (left > 60) {
                    key += 'N° du droit';
                } else if (left > 30) {
                    cadastraleid = buffervalue.trim();
                    buffervalue = '';
                    return;
                } else if (left > 20) {
                    key = 'Détail des parcelles '+parcelleid+' Liste des droits id';
                }
                break;
            case 'controles realises droits':
                if (i < 15 || (i < 20 && left > 300)) {
                    buffervalue = '';
                    return;
                }
                if (buffervalue.match("Date d'impression")) {
                    action = '';
                    return ;
                }
                key = 'Détail des parcelles '+parcelleid+' Liste des droits '+cadastraleid+' ';
                if (left > 650) {
                    key += 'Résultat instruction automatique'
                } else if (left > 550) {
                    key += 'Règle supplémentaire'
                } else if (left > 450) {
                    key += 'Calcul densité'
                } else if (left > 400) {
                    key += 'Débrayage RMD'
                } else if (left > 300) {
                    key += 'Cible densité'
                } else if (left > 200) {
                    key += 'Croisement de cépage'
                } else if (left > 130) {
                    key += 'Constrôle de restructuration'
                } else if (left > 60) {
                    key += 'Type de restructuration'
                } else if (left > 30) {
                    cadastraleid = buffervalue.trim();
                    buffervalue = '';
                    return;
                }
                break;
            default:
                if (line) {
                    if (debug) console.log("DEBUG: line ("+i+" t:"+top+" l:"+left+") : "+line+" < "+action);
                }
                buffervalue = '';
                return;
        }
        if (key && buffervalue) {
            console.log(dossier+';'+maj+';'+ordre+';'+key+';'+buffervalue.trim());
            key = '';
            buffervalue = '';
            return;
        }
    });
} catch (err) {
    console.error(err);
}