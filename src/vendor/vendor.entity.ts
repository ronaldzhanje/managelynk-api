export interface Vendor {
  id?: number;
  businessName: string;
  licenseType?: string;
  licenseNo?: string;
  licenseStatus?: string;
  issueDate?: Date;
  expirationDate?: Date;
  addrLine1?: string;
  addrLine2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone?: string;
  disciplinaryAction?: string;
  docketNumber?: string;
  email?: string;
  qualifier?: any;
  primaryContactName?: string;
  services?: any;
}
