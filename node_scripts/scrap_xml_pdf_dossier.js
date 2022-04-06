const fs = require('fs');

try {
    // read contents of the file
    let xml_file = process.argv[2];
    const data = fs.readFileSync(xml_file, 'UTF-8');
    var [dossier, maj] = xml_file.replace('RecapRS_', '').split("/");

    // split the contents by new line
    const lines = data.split(/\r?\n/);

    var page = 'page garde';
    var i = 0;
    var action = '';
    var oldaction = 'OLD';
    var key = '';
    var oldkey = '';
    var buffervalue = '';
    // print all lines
    lines.forEach((line) => {
        line = line.replace(/<[^>]*>/g, ';');
        line = line.replace(/^;?[ \t]*/, '');
        line = line.replace(/[ \t]*;?$/, '');
        i++;
        switch (line.split(';')[1]) {
            case 'N° CVI':
                action = 'CVI';
                return;
            case 'N° SIRET':
                action = 'SIRET';
                return;
            case 'du siège':
                key = 'adresse du siege';                
                action = 'twolines';
                return;
            case 'de correspondance':
                key = 'adresse de correspondance';
                action = 'twolines';
                return;
            case 'Adresse ':
                return;
            case 'Téléphone fixe':
                key = 'telephone fixe';
                action = 'sameline';
                break;
            case 'Téléphone portable ':
                key = 'telephone portable';
                action = 'sameline';
                break;
            case 'Courriel ':
                action = 'sameline';
                key = 'email';
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
                key = 'Engagement n°';
                action = 'nextline';
                return ;
            case 'Surface demandée':
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
            default:
                if (line) {
                    console.log("DEBUG: line: "+line);
                }
        }
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
                    key = 'raison sociale du CVI';
                }
                break;
            case 'SIRET':
                if (i == 0) {
                    key = 'SIRET';
                } else if (i == 1) {
                    key = 'Type societe';
                } else if (i == 2) {
                    key = 'raison sociale SIRET';
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
                if (i == 0) key = 'PLA-indiv';
                if (i == 1) key = 'PLA-coll';
                if (i == 2) key = 'PAL-seul';
                if (i == 3) key = 'IRR-seule';
                if (i == 4) key = 'PAL+IRR-seuls';                
                break;
            case 'RIB':
                if (i < 3 || i > 6) {
                    buffervalue = '';
                    return ;
                }
                if (i == 3) key = 'RIB';
                if (i == 4) key = 'Titulaire RIB';
                if (i == 5) key = 'Domiciliation RIB';
                if (i == 6) key = 'Etat RIB';
                break;
            default:
                if (line) {
                    console.log("DEBUG: line: "+line);
                }
                buffervalue = '';
                return 
        }
        if (key && buffervalue) {
            console.log(key+';'+buffervalue.trim());
            key = '';
            buffervalue = '';
            return;
        }
    });
} catch (err) {
    console.error(err);
}