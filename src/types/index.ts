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
}

export interface Dhara {
  id: number;
  dhara_name: string;
  days: number;
}

export interface Bill {
  id: number;
  date: string;
  buyer_id: number;
  dalal_id: number;
  material_id: number;
  meter: number;
  price_rate: number;
  dhara_id: number;
  chalan_no: string;
  taka_count: number;
  payment_received: boolean;
  // Joined fields
  buyer_name?: string;
  dalal_name?: string;
  material_name?: string;
  dhara_name?: string;
  dhara_days?: number;
  due_date?: string;
  days_to_due?: number;
  total_amount?: number;
}