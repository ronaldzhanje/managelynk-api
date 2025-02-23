export interface Vendor {
  id?: number;
  businessName: string;
  primaryContactName: string;
  serviceType: string;
  email?: string;
  phone?: string;
  service_area?: string[];
}
