import { Service, Staff } from './types';

export const staffSeed: Staff[] = [
  { id: 'amy', name: 'Amy', title: 'Salon Owner / Aesthetics / Nail Tech / Trainer', categories: ['aesthetics', 'nails', 'training'], trainingOnlyMondays: true },
  { id: 'chloe', name: 'Chloe', title: 'Senior Nail Tech / Eye Lash Tech', categories: ['nails', 'lashes'] },
  { id: 'kaylee', name: 'Kaylee', title: 'Nail Tech', categories: ['nails'] },
  { id: 'amelia', name: 'Amelia', title: 'Nail Tech', categories: ['nails'] },
  { id: 'carlie', name: 'Carlie', title: 'Beauty Therapist', categories: ['nails', 'lashes', 'beauty'] },
];

export const servicesSeed: Service[] = [
  { id: 'gel-manicure', name: 'Gel Manicure', durationMin: 60, price: 35, category: 'nails' },
  { id: 'builder-gel', name: 'Builder Gel Infill', durationMin: 75, price: 45, category: 'nails' },
  { id: 'nail-art', name: 'Nail Art Add-on', durationMin: 30, price: 12, category: 'nails' },
  { id: 'classic-lashes', name: 'Classic Lashes', durationMin: 90, price: 60, category: 'lashes' },
  { id: 'brow-shape', name: 'Brow Shape & Tint', durationMin: 45, price: 30, category: 'beauty' },
  { id: 'skin-booster', name: 'Skin Booster Consultation', durationMin: 45, price: 80, category: 'aesthetics' },
  { id: 'trainer-session', name: 'Nail Training Session', durationMin: 180, price: 200, category: 'training' },
];
