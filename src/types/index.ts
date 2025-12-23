export interface CompanyProfile {
  id: number;
  name: string;
  tagline?: string;
  address: string;
  contact: string;
  gst: string;
  pan: string;
  business_type: string;
  bank_name: string;
  account_no: string;
  ifsc: string;
  branch: string;
  terms_conditions: string;
}

export interface Buyer {
  id: number;
  name: string;
  address?: string;
  contact_number: string;
  gst_number?: string;
}

export interface Dalal {
  id: number;
  name: string;
  contact_number: string;
  address?: string;
}

export interface Material {
  id: number;
  name: string;
  extra_detail?: string;
  hsn_code?: string;
}

export interface Dhara {
  id: number;
  dhara_name: string;
  days: number;
}

export interface Tax {
  id: number;
  name: string;
  percentage: number;
}

export interface Bill {
  id: number;
  bill_no: number;
  date: string;
  buyer_id: number;
  dalal_id: number;
  material_id: number;
  meter: number;
  price_rate: number;
  dhara_id: number;
  tax_id: number;
  chalan_no: string;
  taka_count: number;
  payment_received: boolean;
  // Joined fields
  buyer_name?: string;
  buyer_address?: string;
  buyer_gst?: string;
  dalal_name?: string;
  material_name?: string;
  material_hsn_code?: string;
  dhara_name?: string;
  dhara_days?: number;
  due_date?: string;
  days_to_due?: number;
  base_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  tax_name?: string;
  tax_percentage?: number;
}