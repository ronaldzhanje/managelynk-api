import { Knex } from 'knex';
import * as path from 'path';
import * as fs from 'fs';

export async function seed(knex: Knex): Promise<void> {
  // Load seed data from JSON file
  const seedDataPath = path.join(__dirname, 'data', 'Utah_Plumbing_Companies.json');
  const plumbingCompanies = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  
  // Process seed entries
  const vendors = plumbingCompanies.map((company: any) => ({
    businessName: company.businessName,
    license_number: company.licenseNo,
    license_type: company.licenseType,
    license_status: company.licenseStatus,
    license_expiration: company.expirationDate,
    address_line1: company.addressLine1,
    address_line2: company.addressLine2,
    city: company.city,
    state: company.state,
    zipcode: company.zipcode,
    phone: company.phone,
    email: company.email,
    qualifier: company.qualifier,
    created_at: new Date(),
    updated_at: new Date()
  }));

  // Upsert vendors based on license number
  for (const vendor of vendors) {
    await knex('vendors')
      .insert(vendor);
  }
} 