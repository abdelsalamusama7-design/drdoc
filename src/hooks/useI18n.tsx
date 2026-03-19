import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";
type Direction = "rtl" | "ltr";

interface I18nContextType {
  lang: Language;
  dir: Direction;
  t: (key: string) => string;
  toggleLang: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Nav
    "nav.dashboard": "لوحة التحكم",
    "nav.patients": "المرضى",
    "nav.appointments": "المواعيد",
    "nav.prescriptions": "الوصفات",
    "nav.services": "الخدمات",
    "nav.finance": "المالية",
    "nav.reports": "التقارير",
    "nav.users": "المستخدمين",
    "nav.settings": "الإعدادات",
    "nav.queue": "الطابور",
    "nav.inventory": "المخزون",
    "nav.noShow": "إدارة الغياب",
    "nav.doctorPerformance": "أداء الأطباء",
    "nav.aiAssistant": "مساعد AI",
    "nav.medicalAlerts": "التنبيهات الطبية",
    "nav.smartSearch": "البحث الذكي",
    "nav.subscription": "الأسعار والاشتراكات",
    "nav.patientJourney": "رحلة المريض",

    // Nav Groups
    "navGroup.main": "الرئيسية",
    "navGroup.clinical": "العيادة",
    "navGroup.management": "الإدارة",
    "navGroup.tools": "أدوات ذكية",
    "navGroup.system": "النظام",

    // Layout
    "layout.search": "بحث سريع...",
    "layout.quickActions": "إجراءات سريعة",
    "layout.addPatient": "إضافة مريض جديد",
    "layout.bookAppointment": "حجز موعد",
    "layout.writePrescription": "كتابة وصفة",
    "layout.noResults": "لا توجد نتائج",
    "layout.signOut": "تسجيل الخروج",
    "layout.notifications": "الإشعارات",
    "layout.readAll": "قراءة الكل",
    "layout.years": "سنة",

    // Roles
    "role.admin": "مدير",
    "role.doctor": "طبيب",
    "role.receptionist": "موظف استقبال",
    "role.accountant": "محاسب",
    "role.patient": "مريض",
    "role.user": "مستخدم",

    // Dashboard
    "dash.welcome": "مرحباً دكتور 👋",
    "dash.todayDate": "اليوم",
    "dash.appointmentsToday": "مواعيد",
    "dash.patientsToday": "مرضى اليوم",
    "dash.appointmentCount": "مواعيد اليوم",
    "dash.todayRevenue": "إيراد اليوم",
    "dash.pendingFollowups": "متابعات معلقة",
    "dash.sar": "ج.م",
    "dash.todayAppointments": "مواعيد اليوم",
    "dash.all": "الكل",
    "dash.waiting": "بانتظار",
    "dash.inProgress": "جاري",
    "dash.time": "الوقت",
    "dash.patient": "المريض",
    "dash.visitType": "نوع الزيارة",
    "dash.doctor": "الطبيب",
    "dash.status": "الحالة",
    "dash.action": "إجراء",
    "dash.viewAll": "عرض الكل",
    "dash.weeklyRevenue": "إيرادات الأسبوع",
    "dash.totalWeekly": "إجمالي أسبوعي",
    "dash.dailyAvg": "متوسط يومي",
    "dash.quickAccess": "وصول سريع",
    "dash.allPatients": "الكل",
    "dash.recentPatients": "آخر المرضى",
    "dash.needFollowup": "يحتاجون متابعة",
    "dash.lastVisit": "آخر زيارة",
    "dash.monthlyRevenue": "الإيرادات الشهرية",
    "dash.last6Months": "آخر ٦ أشهر",
    "dash.details": "التفاصيل",
    "dash.visitTypes": "أنواع الزيارات",
    "dash.thisMonth": "هذا الشهر",
    "dash.clinicPerformance": "أداء العيادة",
    "dash.monthConsultations": "استشارات هذا الشهر",
    "dash.followups": "متابعات",
    "dash.topService": "أعلى خدمة",
    "dash.busiestDay": "أنشط يوم",
    "dash.alerts": "تنبيهات",
    "dash.topServices": "أكثر الخدمات طلباً",
    "dash.openFile": "فتح الملف",
    "dash.startVisit": "بدء الزيارة",
    "dash.addNote": "إضافة ملاحظة",

    // Quick Actions
    "action.newPatient": "مريض جديد",
    "action.bookAppointment": "حجز موعد",
    "action.prescription": "وصفة طبية",
    "action.addExpense": "إضافة مصروف",

    // Visit types
    "visit.consultation": "استشارة",
    "visit.followup": "متابعة",
    "visit.procedure": "إجراء",
    "visit.lab": "مختبر",

    // Status
    "status.scheduled": "بانتظار",
    "status.in-progress": "جاري",
    "status.completed": "مكتمل",
    "status.cancelled": "ملغي",

    // Days
    "day.sat": "سبت",
    "day.sun": "أحد",
    "day.mon": "إثنين",
    "day.tue": "ثلاثاء",
    "day.wed": "أربعاء",
    "day.thu": "خميس",
    "day.fri": "جمعة",

    // Months
    "month.jan": "يناير",
    "month.feb": "فبراير",
    "month.mar": "مارس",
    "month.apr": "أبريل",
    "month.may": "مايو",
    "month.jun": "يونيو",

    // Login
    "login.title": "تسجيل الدخول",
    "login.signup": "إنشاء حساب جديد",
    "login.fullName": "الاسم الكامل",
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.signInBtn": "تسجيل الدخول",
    "login.signUpBtn": "إنشاء حساب",
    "login.hasAccount": "لديك حساب؟ تسجيل الدخول",
    "login.noAccount": "ليس لديك حساب؟ إنشاء حساب",
    "login.error": "خطأ",
    "login.accountCreated": "تم إنشاء الحساب",
    "login.welcomeMsg": "مرحباً بك! جاري تسجيل الدخول...",

    // Notifications
    "notif.1": "فهد القحطاني - تحليل هرمونات جاهز",
    "notif.2": "خالد السعيد - موعد متابعة غداً",
    "notif.3": "٣ مرضى لم يعودوا منذ ٣ أشهر",
    "notif.4": "تقرير مالي شهري جاهز",
    "notif.time1": "منذ ١٠ دقائق",
    "notif.time2": "منذ ساعة",
    "notif.time3": "منذ ٣ ساعات",
    "notif.time4": "اليوم",

    // Alerts
    "alert.labReady": "فهد القحطاني - تحليل جاهز",
    "alert.lateFollowup": "٣ مرضى متأخرون عن المتابعة",
    "alert.weekFollowups": "٢ مواعيد متابعة هذا الأسبوع",

    // Performance
    "perf.initialConsultation": "استشارة أولية",
    "perf.wednesday": "الأربعاء",

    // User Management
    "users.title": "إدارة المستخدمين",
    "users.subtitle": "إدارة حسابات الموظفين وصلاحياتهم",
    "users.addStaff": "إضافة موظف",
    "users.refresh": "تحديث",
    "users.total": "إجمالي",
    "users.admins": "مدراء",
    "users.doctors": "أطباء",
    "users.receptionists": "استقبال",
    "users.noRole": "بدون دور",
    "users.searchPlaceholder": "ابحث بالاسم أو البريد أو الهاتف...",
    "users.noUsers": "لا يوجد مستخدمين",
    "users.you": "(أنت)",
    "users.neverLoggedIn": "لم يسجل دخول",
    "users.changeRole": "تغيير الدور",
    "users.deleteUser": "حذف المستخدم",
    "users.assignRole": "تعيين الدور",
    "users.chooseRole": "اختر الدور لـ",
    "users.fullAccess": "وصول كامل لجميع الأقسام",
    "users.doctorAccess": "وصول للمرضى والمواعيد والوصفات",
    "users.receptionistAccess": "وصول للمرضى والمواعيد فقط",
    "users.cancel": "إلغاء",
    "users.confirm": "تأكيد",
    "users.deleteTitle": "حذف المستخدم",
    "users.deleteConfirm": "هل أنت متأكد من حذف حساب",
    "users.deleteWarning": "لا يمكن التراجع عن هذا الإجراء.",
    "users.deleteFinal": "حذف نهائي",
    "users.roleUpdated": "تم تحديث الدور",
    "users.roleAssigned": "تم تعيين",
    "users.success": "بنجاح",
    "users.deleted": "تم حذف المستخدم",
    "users.deletedMsg": "تم حذف الحساب بنجاح",
    "users.createTitle": "إضافة موظف جديد",
    "users.createDesc": "أنشئ حساب جديد للموظف وحدد دوره في النظام",
    "users.phone": "الهاتف",
    "users.specialty": "التخصص",
    "users.role": "الدور",
    "users.createBtn": "إنشاء الحساب",
    "users.fillRequired": "يرجى ملء جميع الحقول المطلوبة",
    "users.passwordMin": "كلمة المرور يجب أن تكون ٦ أحرف على الأقل",
    "users.created": "تم إنشاء الحساب",
    "users.createdMsg": "تم إنشاء حساب",

    // Table headers
    "table.user": "المستخدم",
    "table.email": "البريد",
    "table.specialty": "التخصص",
    "table.role": "الدور",
    "table.lastLogin": "آخر دخول",
    "table.actions": "إجراءات",
  },
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.patients": "Patients",
    "nav.appointments": "Appointments",
    "nav.prescriptions": "Prescriptions",
    "nav.services": "Services",
    "nav.finance": "Finance",
    "nav.reports": "Reports",
    "nav.users": "Users",
    "nav.settings": "Settings",
    "nav.queue": "Queue",
    "nav.inventory": "Inventory",
    "nav.noShow": "No-Show",
    "nav.doctorPerformance": "Dr. Performance",
    "nav.aiAssistant": "AI Assistant",
    "nav.medicalAlerts": "Medical Alerts",
    "nav.smartSearch": "Smart Search",
    "nav.subscription": "Pricing & Subscriptions",
    "nav.patientJourney": "Patient Journey",

    // Nav Groups
    "navGroup.main": "Main",
    "navGroup.clinical": "Clinical",
    "navGroup.management": "Management",
    "navGroup.tools": "Smart Tools",
    "navGroup.system": "System",

    // Layout
    "layout.search": "Quick search...",
    "layout.quickActions": "Quick Actions",
    "layout.addPatient": "Add New Patient",
    "layout.bookAppointment": "Book Appointment",
    "layout.writePrescription": "Write Prescription",
    "layout.noResults": "No results found",
    "layout.signOut": "Sign Out",
    "layout.notifications": "Notifications",
    "layout.readAll": "Read all",
    "layout.years": "yrs",

    // Roles
    "role.admin": "Admin",
    "role.doctor": "Doctor",
    "role.receptionist": "Receptionist",
    "role.accountant": "Accountant",
    "role.patient": "Patient",
    "role.user": "User",

    // Dashboard
    "dash.welcome": "Welcome Doctor 👋",
    "dash.todayDate": "Today",
    "dash.appointmentsToday": "appointments",
    "dash.patientsToday": "Patients Today",
    "dash.appointmentCount": "Today's Appointments",
    "dash.todayRevenue": "Today's Revenue",
    "dash.pendingFollowups": "Pending Follow-ups",
    "dash.sar": "EGP",
    "dash.todayAppointments": "Today's Appointments",
    "dash.all": "All",
    "dash.waiting": "Waiting",
    "dash.inProgress": "In Progress",
    "dash.time": "Time",
    "dash.patient": "Patient",
    "dash.visitType": "Visit Type",
    "dash.doctor": "Doctor",
    "dash.status": "Status",
    "dash.action": "Action",
    "dash.viewAll": "View All",
    "dash.weeklyRevenue": "Weekly Revenue",
    "dash.totalWeekly": "Total Weekly",
    "dash.dailyAvg": "Daily Average",
    "dash.quickAccess": "Quick Access",
    "dash.allPatients": "All",
    "dash.recentPatients": "Recent Patients",
    "dash.needFollowup": "Need Follow-up",
    "dash.lastVisit": "Last visit",
    "dash.monthlyRevenue": "Monthly Revenue",
    "dash.last6Months": "Last 6 months",
    "dash.details": "Details",
    "dash.visitTypes": "Visit Types",
    "dash.thisMonth": "This month",
    "dash.clinicPerformance": "Clinic Performance",
    "dash.monthConsultations": "Monthly Consultations",
    "dash.followups": "Follow-ups",
    "dash.topService": "Top Service",
    "dash.busiestDay": "Busiest Day",
    "dash.alerts": "Alerts",
    "dash.topServices": "Most Requested Services",
    "dash.openFile": "Open File",
    "dash.startVisit": "Start Visit",
    "dash.addNote": "Add Note",

    // Quick Actions
    "action.newPatient": "New Patient",
    "action.bookAppointment": "Book Appointment",
    "action.prescription": "Prescription",
    "action.addExpense": "Add Expense",

    // Visit types
    "visit.consultation": "Consultation",
    "visit.followup": "Follow-up",
    "visit.procedure": "Procedure",
    "visit.lab": "Lab",

    // Status
    "status.scheduled": "Waiting",
    "status.in-progress": "In Progress",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",

    // Days
    "day.sat": "Sat",
    "day.sun": "Sun",
    "day.mon": "Mon",
    "day.tue": "Tue",
    "day.wed": "Wed",
    "day.thu": "Thu",
    "day.fri": "Fri",

    // Months
    "month.jan": "Jan",
    "month.feb": "Feb",
    "month.mar": "Mar",
    "month.apr": "Apr",
    "month.may": "May",
    "month.jun": "Jun",

    // Login
    "login.title": "Sign In",
    "login.signup": "Create Account",
    "login.fullName": "Full Name",
    "login.email": "Email",
    "login.password": "Password",
    "login.signInBtn": "Sign In",
    "login.signUpBtn": "Create Account",
    "login.hasAccount": "Have an account? Sign In",
    "login.noAccount": "Don't have an account? Sign Up",
    "login.error": "Error",
    "login.accountCreated": "Account Created",
    "login.welcomeMsg": "Welcome! Signing you in...",

    // Notifications
    "notif.1": "Fahd Al-Qahtani - Hormone test ready",
    "notif.2": "Khalid Al-Saeed - Follow-up tomorrow",
    "notif.3": "3 patients haven't returned in 3 months",
    "notif.4": "Monthly financial report ready",
    "notif.time1": "10 min ago",
    "notif.time2": "1 hour ago",
    "notif.time3": "3 hours ago",
    "notif.time4": "Today",

    // Alerts
    "alert.labReady": "Fahd Al-Qahtani - Lab results ready",
    "alert.lateFollowup": "3 patients overdue for follow-up",
    "alert.weekFollowups": "2 follow-up appointments this week",

    // Performance
    "perf.initialConsultation": "Initial Consultation",
    "perf.wednesday": "Wednesday",

    // User Management
    "users.title": "User Management",
    "users.subtitle": "Manage staff accounts and permissions",
    "users.addStaff": "Add Staff",
    "users.refresh": "Refresh",
    "users.total": "Total",
    "users.admins": "Admins",
    "users.doctors": "Doctors",
    "users.receptionists": "Reception",
    "users.noRole": "No Role",
    "users.searchPlaceholder": "Search by name, email or phone...",
    "users.noUsers": "No users found",
    "users.you": "(You)",
    "users.neverLoggedIn": "Never logged in",
    "users.changeRole": "Change Role",
    "users.deleteUser": "Delete User",
    "users.assignRole": "Assign Role",
    "users.chooseRole": "Choose role for",
    "users.fullAccess": "Full access to all sections",
    "users.doctorAccess": "Access to patients, appointments & prescriptions",
    "users.receptionistAccess": "Access to patients & appointments only",
    "users.cancel": "Cancel",
    "users.confirm": "Confirm",
    "users.deleteTitle": "Delete User",
    "users.deleteConfirm": "Are you sure you want to delete",
    "users.deleteWarning": "This action cannot be undone.",
    "users.deleteFinal": "Delete Permanently",
    "users.roleUpdated": "Role Updated",
    "users.roleAssigned": "Assigned",
    "users.success": "successfully",
    "users.deleted": "User Deleted",
    "users.deletedMsg": "Account deleted successfully",
    "users.createTitle": "Add New Staff",
    "users.createDesc": "Create a new staff account and assign their role",
    "users.phone": "Phone",
    "users.specialty": "Specialty",
    "users.role": "Role",
    "users.createBtn": "Create Account",
    "users.fillRequired": "Please fill all required fields",
    "users.passwordMin": "Password must be at least 6 characters",
    "users.created": "Account Created",
    "users.createdMsg": "Account created for",

    // Table headers
    "table.user": "User",
    "table.email": "Email",
    "table.specialty": "Specialty",
    "table.role": "Role",
    "table.lastLogin": "Last Login",
    "table.actions": "Actions",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("clinic-lang") as Language) || "ar";
  });

  const dir: Direction = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("clinic-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  };

  return (
    <I18nContext.Provider value={{ lang, dir, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
