import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, FileText, Stethoscope,
  DollarSign, BarChart3, Settings, Menu, X, ChevronLeft
} from "lucide-react";

const navItems = [
  { path: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/patients", label: "المرضى", icon: Users },
  { path: "/appointments", label: "المواعيد", icon: CalendarDays },
  { path: "/prescriptions", label: "الوصفات", icon: FileText },
  { path: "/services", label: "الخدمات", icon: Stethoscope },
  { path: "/finance", label: "المالية", icon: DollarSign },
  { path: "/reports", label: "التقارير", icon: BarChart3 },
  { path: "/settings", label: "الإعدادات", icon: Settings },
];

interface ClinicLayoutProps {
  children: React.ReactNode;
}

export default function ClinicLayout({ children }: ClinicLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-row-reverse">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-l border-border bg-card fixed top-0 right-0 h-full z-40 transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <h1 className="text-base font-bold text-foreground">
              MedClinic<span className="text-primary mr-0.5">.</span>
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`touch-target flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                د.س
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">د. سلطان الأحمدي</p>
                <p className="text-xs text-muted-foreground">طبيب</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2">
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground">
          MedClinic<span className="text-primary">.</span>
        </h1>
        <div className="w-8" />
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-card z-50 lg:hidden border-l border-border"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <h1 className="text-base font-bold">
                  MedClinic<span className="text-primary">.</span>
                </h1>
                <button onClick={() => setSidebarOpen(false)} className="p-2 -ml-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="py-3 px-2 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`touch-target flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav lg:hidden flex items-center justify-around h-16">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-200 ${
          collapsed ? "lg:mr-[68px]" : "lg:mr-[240px]"
        } mt-14 lg:mt-0 mb-16 lg:mb-0`}
      >
        <div className="p-4 lg:p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
