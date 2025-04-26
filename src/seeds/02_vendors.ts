import { Knex } from 'knex';
import * as path from 'path';
import * as fs from 'fs';

export async function seed(knex: Knex): Promise<void> {
  // Load seed data from JSON file
  const seedDataPath = path.join(__dirname, 'data', 'Utah_Plumbing_Companies.json');
  const plumbingCompanies = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  
  // Process seed entries
  const vendors = plumbingCompanies.map((company: any) => ({
    businessName: company.fullName,
    licenseType: company.licenseType,
    licenseNo: company.licenseNo,
    licenseStatus: company.licenseStatus,
    issueDate: company.issueDate,
    expirationDate: company.expirationDate,
    addressLine1: company.addressLine1,
    addressLine2: company.addressLine2,
    city: company.city,
    state: company.state,
    zipcode: company.zipcode,
    phone: company.phone,
    email: company.email,
    qualifier: JSON.stringify(company.qualifier),
    disciplinaryAction: company.disciplinaryAction,
    docketNumber: company.docketNumber,
  }));

  // Insert vendors
  for (const vendor of vendors) {
    try {
      await knex('vendors').insert(vendor);
    } catch (error) {
      console.error(`Error inserting vendor ${vendor.businessName}:`, error);
    }
  }
} 