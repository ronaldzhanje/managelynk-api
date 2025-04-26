const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Define file paths
const inputFilePath = path.join(__dirname, '../seeds/data/Utah Plumbing Companies - 04-19-2025.csv');
const outputFilePath = path.join(__dirname, '../seeds/data/Utah_Plumbing_Companies.json');

// Read the CSV file
const csvData = fs.readFileSync(inputFilePath, 'utf8');

// Parse CSV data
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Transform the data to match the expected JSON format
const jsonData = records.map(record => ({
  licenseType: record['LICENSE TYPE'],
  licenseNo: record['LICENSE NO'],
  licenseStatus: record['LICENSE STATUS'],
  fullName: record['FULL NAME'],
  issueDate: record['ISSUE DATE'],
  expirationDate: record['EXPIRATION DATE'],
  addressLine1: record['ADDR LINE 1'],
  addressLine2: record['ADDR LINE 2'],
  city: record['CITY'],
  state: record['STATE'],
  zipcode: record['ZIPCODE'],
  phone: record['PHONE'],
  disciplinaryAction: record['DISCIPLINARY ACTION'],
  docketNumber: record['DOCKET NUMBER'],
  email: record['EMAIL'],
  qualifier: record['QUALIFIER'] ? record['QUALIFIER'].split(',').map(item => item.trim()) : []
}));

// Write the JSON data to a file
fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf8');

console.log(`Conversion complete! JSON file saved to: ${outputFilePath}`);
console.log(`Total records processed: ${jsonData.length}`); 