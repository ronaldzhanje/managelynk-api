import { Knex } from 'knex';
import * as path from 'path';
import * as fs from 'fs';

export async function seed(knex: Knex): Promise<void> {
  // Load plumbing companies seed data
  const plumbingDataPath = path.join(__dirname, 'data', 'Utah_Plumbing_Companies.json');
  const plumbingCompanies = JSON.parse(fs.readFileSync(plumbingDataPath, 'utf8'));
  
  // Load landscape companies seed data
  const landscapeDataPath = path.join(__dirname, 'data', 'Utah_landscape_and_Recreation.json');
  const landscapeCompanies = JSON.parse(fs.readFileSync(landscapeDataPath, 'utf8'));
  
  // Process plumbing companies
  const plumbingVendors = plumbingCompanies.map((company: any) => ({
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

  // Process landscape companies
  const landscapeVendors = landscapeCompanies.map((company: any) => ({
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

  // Combine all vendors
  const allVendors = [...plumbingVendors, ...landscapeVendors];

  // Insert vendors with upsert
  for (const vendor of allVendors) {
    try {
      await knex('vendors')
        .insert(vendor)
        .onConflict('businessName')
        .merge();
    } catch (error) {
      console.error(`Error upserting vendor ${vendor.businessName}:`, error);
    }
  }
} 