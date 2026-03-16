// Mock data for the clinic management system

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  address: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  medicalHistory: string;
  previousSurgeries: string;
  allergies: string[];
  currentMedications: string[];
  createdAt: string;
  lastVisit: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  doctor: string;
  visitType: 'consultation' | 'followup' | 'procedure' | 'lab';
  notes: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  medications: { name: string; dosage: string; duration: string; notes: string }[];
  doctorNotes: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  notes: string;
  category: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  type: 'visit' | 'lab' | 'prescription' | 'surgery' | 'note';
  title: string;
  description: string;
  date: string;
}

export const mockPatients: Patient[] = [
  {
    id: '1', name: 'أحمد محمد علي', phone: '0501234567', age: 35,
    address: 'الرياض، حي النزهة', maritalStatus: 'married',
    medicalHistory: 'ضغط دم مرتفع', previousSurgeries: 'لا يوجد',
    allergies: ['بنسلين'], currentMedications: ['أملوديبين 5mg'],
    createdAt: '2024-01-15', lastVisit: '2025-03-10',
  },
  {
    id: '2', name: 'خالد عبدالله السعيد', phone: '0559876543', age: 42,
    address: 'جدة، حي الروضة', maritalStatus: 'married',
    medicalHistory: 'سكري نوع 2', previousSurgeries: 'عملية دوالي الخصية 2020',
    allergies: [], currentMedications: ['ميتفورمين 1000mg'],
    createdAt: '2024-03-20', lastVisit: '2025-03-14',
  },
  {
    id: '3', name: 'فهد سعد القحطاني', phone: '0541112233', age: 28,
    address: 'الدمام، حي الفيصلية', maritalStatus: 'single',
    medicalHistory: 'لا يوجد', previousSurgeries: 'لا يوجد',
    allergies: ['سلفا'], currentMedications: [],
    createdAt: '2024-06-10', lastVisit: '2025-03-12',
  },
  {
    id: '4', name: 'محمد عبدالرحمن الشمري', phone: '0567778899', age: 55,
    address: 'الرياض، حي العليا', maritalStatus: 'married',
    medicalHistory: 'ارتفاع كوليسترول، تضخم البروستاتا', previousSurgeries: 'استئصال المرارة 2018',
    allergies: ['أسبرين'], currentMedications: ['تامسولوسين 0.4mg', 'أتورفاستاتين 20mg'],
    createdAt: '2023-11-05', lastVisit: '2025-03-15',
  },
  {
    id: '5', name: 'عبدالعزيز إبراهيم المالكي', phone: '0533445566', age: 31,
    address: 'مكة، حي الشوقية', maritalStatus: 'married',
    medicalHistory: 'لا يوجد', previousSurgeries: 'لا يوجد',
    allergies: [], currentMedications: [],
    createdAt: '2025-01-20', lastVisit: '2025-03-13',
  },
];

export const mockAppointments: Appointment[] = [
  { id: '1', patientId: '1', patientName: 'أحمد محمد علي', phone: '0501234567', doctor: 'د. سلطان الأحمدي', visitType: 'consultation', notes: 'استشارة أولية', date: '2025-03-16', time: '09:00', status: 'scheduled' },
  { id: '2', patientId: '2', patientName: 'خالد عبدالله السعيد', phone: '0559876543', doctor: 'د. سلطان الأحمدي', visitType: 'followup', notes: 'متابعة بعد العملية', date: '2025-03-16', time: '09:30', status: 'scheduled' },
  { id: '3', patientId: '3', patientName: 'فهد سعد القحطاني', phone: '0541112233', doctor: 'د. سلطان الأحمدي', visitType: 'lab', notes: 'تحليل هرمونات', date: '2025-03-16', time: '10:00', status: 'in-progress' },
  { id: '4', patientId: '4', patientName: 'محمد عبدالرحمن الشمري', phone: '0567778899', doctor: 'د. سلطان الأحمدي', visitType: 'procedure', notes: 'فحص البروستاتا', date: '2025-03-16', time: '10:30', status: 'scheduled' },
  { id: '5', patientId: '5', patientName: 'عبدالعزيز إبراهيم المالكي', phone: '0533445566', doctor: 'د. سلطان الأحمدي', visitType: 'consultation', notes: 'فحص العقم', date: '2025-03-16', time: '11:00', status: 'scheduled' },
  { id: '6', patientId: '1', patientName: 'أحمد محمد علي', phone: '0501234567', doctor: 'د. سلطان الأحمدي', visitType: 'followup', notes: 'متابعة', date: '2025-03-16', time: '11:30', status: 'scheduled' },
  { id: '7', patientId: '2', patientName: 'خالد عبدالله السعيد', phone: '0559876543', doctor: 'د. سلطان الأحمدي', visitType: 'consultation', notes: '', date: '2025-03-16', time: '12:00', status: 'scheduled' },
  { id: '8', patientId: '3', patientName: 'فهد سعد القحطاني', phone: '0541112233', doctor: 'د. سلطان الأحمدي', visitType: 'followup', notes: '', date: '2025-03-17', time: '09:00', status: 'scheduled' },
];

export const mockServices: Service[] = [
  { id: '1', name: 'استشارة أولية', price: 300, notes: 'كشف أول', category: 'استشارة' },
  { id: '2', name: 'متابعة', price: 150, notes: 'زيارة متابعة', category: 'استشارة' },
  { id: '3', name: 'تحليل هرمونات', price: 450, notes: 'تحليل شامل', category: 'مختبر' },
  { id: '4', name: 'تحليل سائل منوي', price: 350, notes: '', category: 'مختبر' },
  { id: '5', name: 'أشعة دوبلر', price: 500, notes: 'دوبلر على الخصية', category: 'إجراء' },
  { id: '6', name: 'عملية دوالي', price: 8000, notes: 'عملية ميكروسكوبية', category: 'إجراء' },
];

export const mockExpenses: Expense[] = [
  { id: '1', category: 'إيجار', amount: 15000, date: '2025-03-01', notes: 'إيجار شهري' },
  { id: '2', category: 'رواتب', amount: 25000, date: '2025-03-01', notes: 'رواتب الموظفين' },
  { id: '3', category: 'معدات', amount: 5000, date: '2025-03-05', notes: 'مستلزمات طبية' },
  { id: '4', category: 'خدمات', amount: 2000, date: '2025-03-01', notes: 'كهرباء وماء' },
];

export const mockTimeline: TimelineEvent[] = [
  { id: '1', type: 'visit', title: 'زيارة استشارية', description: 'استشارة أولية - فحص سريري شامل', date: '2025-03-15' },
  { id: '2', type: 'lab', title: 'تحليل هرمونات', description: 'FSH, LH, Testosterone - النتائج طبيعية', date: '2025-03-10' },
  { id: '3', type: 'prescription', title: 'وصفة طبية', description: 'كلوميفين 50mg - شهر واحد', date: '2025-03-10' },
  { id: '4', type: 'visit', title: 'زيارة متابعة', description: 'متابعة نتائج التحاليل', date: '2025-02-20' },
  { id: '5', type: 'surgery', title: 'عملية دوالي', description: 'عملية ربط دوالي ميكروسكوبية - ناجحة', date: '2025-01-15' },
  { id: '6', type: 'note', title: 'ملاحظة طبية', description: 'المريض يعاني من آلام متقطعة', date: '2025-01-10' },
];

export const mockMedications = [
  'كلوميفين 50mg', 'تاموكسيفين 20mg', 'أناسترازول 1mg',
  'تستوستيرون 250mg', 'HCG 5000 IU', 'سيلدينافيل 50mg',
  'تادالافيل 20mg', 'تامسولوسين 0.4mg', 'فيناسترايد 5mg',
  'دوكسازوسين 4mg', 'فيتامين E 400mg', 'زنك 50mg',
  'L-Carnitine 1000mg', 'CoQ10 200mg', 'حمض الفوليك 5mg',
];

export const visitTypeLabels: Record<string, string> = {
  consultation: 'استشارة',
  followup: 'متابعة',
  procedure: 'إجراء',
  lab: 'مختبر',
};

export const statusLabels: Record<string, string> = {
  scheduled: 'مجدول',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  'in-progress': 'جاري',
};
