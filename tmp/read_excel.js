
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = "C:\\Users\\Donald\\Downloads\\Ouverture & Facturation GLS.xlsm";
const logFile = path.resolve(__dirname, 'excel_analysis.txt');

try {
    const workbook = xlsx.readFile(filePath);
    let output = "Sheets found:\n";
    workbook.SheetNames.forEach(name => {
        output += `- "${name}"\n`;
    });
    
    // Find sheet containing "proforma" and "simple"
    const targetName = workbook.SheetNames.find(n => n.toLowerCase().includes("proforma") && n.toLowerCase().includes("simple"));
    output += `\nCible identifiée : "${targetName}"\n`;
    
    if (targetName) {
        const sheet = workbook.Sheets[targetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        data.slice(0, 100).forEach((row, i) => {
            output += `Ligne ${i}: ${JSON.stringify(row)}\n`;
        });
    }
    fs.writeFileSync(logFile, output);
    console.log("Analyse terminée. Fichier écrit dans " + logFile);

} catch (error) {
    fs.writeFileSync(logFile, "Erreur: " + error.message);
}
