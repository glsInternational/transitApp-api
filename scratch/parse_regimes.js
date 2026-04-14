const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Donald\\Projects\\node\\transit_api\\docs\\liste_des_regimes_douaniers_a_la_date_du_29-07-2021.txt';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);
const regimes = [];

console.log(`Total lines: ${lines.length}`);

lines.forEach((line, index) => {
    // console.log(`Line ${index + 1}: "${line}"`);
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Look for a code (usually 4 digits) at the beginning of the trimmed line
    const match = trimmed.match(/^(\d{4})\s+(.+)$/);
    if (match) {
        const code = match[1];
        const libelle = match[2].trim();
        
        let type = "suspensif";
        if (code.startsWith('1') || code.startsWith('4')) {
            type = "definitif";
        }
        
        regimes.push({ code, libelle, type });
    }
});

console.log(JSON.stringify(regimes, null, 4));
