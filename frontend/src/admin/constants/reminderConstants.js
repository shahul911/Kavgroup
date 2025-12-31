import { Droplet, Building, Map, Zap, Users, Wrench, Shield, FileCheck, FileText } from 'lucide-react';

export const categoryIcons = {
  'water-test': Droplet,
  'building-tax': Building,
  'land-tax': Map,
  'electricity-bill': Zap,
  'staff-payment': Users,
  'maintenance': Wrench,
  'insurance': Shield,
  'license': FileCheck,
  'other': FileText
};

export const categoryNames = {
  'water-test': 'Water Test Results',
  'building-tax': 'Building Tax',
  'land-tax': 'Land Tax',
  'electricity-bill': 'Electricity Bill',
  'staff-payment': 'Staff Payment',
  'maintenance': 'Maintenance',
  'insurance': 'Insurance',
  'license': 'License & Permits',
  'other': 'Other Bills'
};

export const timeOptions = {
  from: ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'],
  to: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM']
};
