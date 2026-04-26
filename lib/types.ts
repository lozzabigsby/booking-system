export type Role = 'staff' | 'admin';
export type ServiceCategory = 'nails' | 'aesthetics' | 'lashes' | 'beauty' | 'training';

export interface Staff {
  id: string;
  name: string;
  title: string;
  categories: ServiceCategory[];
  trainingOnlyMondays?: boolean;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  category: ServiceCategory;
}

export interface Booking {
  id: string;
  staffId: string;
  serviceIds: string[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  start: string;
  end: string;
  source: 'customer' | 'manual';
  notes?: string;
}

export type BlockType = 'full-day' | 'half-day' | 'range';

export interface BlockOff {
  id: string;
  staffId: string;
  type: BlockType;
  start: string;
  end: string;
  half?: 'morning' | 'afternoon';
  reason: string;
}
