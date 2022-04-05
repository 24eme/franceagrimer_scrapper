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
        switch (line) {
            case ';N° CVI;':
                action = 'CVI';
                return;
            case ';N° SIRET;':
                action = 'SIRET';
                return;
            case ';du siège;':
                action = 'adresse';
                return;
            default:
                
        }
        if (action != oldaction) {
            i = 0;
        }
        oldaction = action;
        buffervalue += line.replace(/;/g, '');
        switch (action) {
            case 'CVI':
                if (i == 1) {
                    key = 'CVI';
                }else if(i == 2) {
                    key = 'raison sociale du CVI';
                }
                break;
            case 'SIRET':
                if (i == 1) {
                    key = 'SIRET';
                } else if (i == 2) {
                    key = 'Type societe';
                } else if (i == 3) {
                    key = 'raison sociale SIRET';
                }
                break;
            case 'adresse':
                if (i == 1) {
                    key = 'adresse du siege';
                }
                break;
            default:
                if (line) {
                    console.log("DEBUG: line: "+line);
                }
                buffervalue = '';
                return 
        }
        if (key != oldkey) {
            console.log(key+';'+buffervalue);
            oldkey = key;
            buffervalue = '';
            return;
        }
    });
} catch (err) {
    console.error(err);
}