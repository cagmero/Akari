const fs = require('fs');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');

async function main() {
    console.log("--- PDF EXTRACTION ---");
    try {
        let dataBuffer = fs.readFileSync('../../Hackathon Documentation 2026.pdf');
        let data = await pdf(dataBuffer);
        console.log(data.text.substring(0, 3000));
        console.log("\n... [truncating if too long, showing end:] ...\n");
        console.log(data.text.substring(Math.max(0, data.text.length - 2000)));
    } catch(e) { console.error("PDF read failed", e); }

    console.log("\n--- EXCEL EXTRACTION ---");
    try {
        const workbook = xlsx.readFile('../../Cross Currency and Precious Metals Identifiers.xlsx');
        const sheet_name_list = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        console.log(xlData.slice(0, 20)); // show top 20 rows
    } catch(e) { console.error("Excel read failed", e); }
}

main();
