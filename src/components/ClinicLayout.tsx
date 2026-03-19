import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, FileText, Stethoscope,
  DollarSign, BarChart3, Settings, Menu, X, ChevronLeft, LogOut,
  Search, Bell, UserPlus, ShieldCheck, Moon, Sun, Languages,
  ListOrdered, Activity, Package, UserX, Lock
} from "lucide-react";
import NotificationPanel from "@/components/NotificationPanel";
import { useAuth } from "@/hooks/useAuth";
import ClinicSwitcher from "@/components/ClinicSwitcher";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { mockPatients } from "@/data/mockData";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface NavItem {
  path: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "/patients", labelKey: "nav.patients", icon: Users },
  { path: "/appointments", labelKey: "nav.appointments", icon: CalendarDays },
  { path: "/queue", labelKey: "nav.queue", icon: ListOrdered },
  { path: "/prescriptions", labelKey: "nav.prescriptions", icon: FileText },
  { path: "/services", labelKey: "nav.services", icon: Stethoscope },
  { path: "/inventory", labelKey: "nav.inventory", icon: Package },
  { path: "/finance", labelKey: "nav.finance", icon: DollarSign },
  { path: "/no-show", labelKey: "nav.noShow", icon: UserX },
  { path: "/doctor-performance", labelKey: "nav.doctorPerformance", icon: Activity },
  { path: "/reports", labelKey: "nav.reports", icon: BarChart3 },
  { path: "/users", labelKey: "nav.users", icon: ShieldCheck, adminOnly: true },
  { path: "/settings", labelKey: "nav.settings", icon: Settings },
];

interface ClinicLayoutProps {
  children: React.ReactNode;
}

// Global Search Component
function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = query.trim()
    ? mockPatients.filter(p =>
        p.name.includes(query) || p.phone.includes(query)
      ).slice(0, 5)
    : [];

  const handleSelect = (id: string) => {
    onClose();
    navigate(`/patients/${id}`);
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-card rounded-2xl overflow-hidden border border-border" style={{ boxShadow: 'var(--card-shadow-lg)' }}>
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("layout.search")}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-en">ESC</kbd>
          </div>
          {query.trim() && (
            <div className="max-h-[300px] overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {t("layout.noResults")}
                </div>
              ) : (
                results.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-right"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground font-en">{p.phone}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{p.age} {t("layout.years")}</span>
                  </button>
                ))
              )}
            </div>
          )}
          {!query.trim() && (
            <div className="p-4 space-y-2">
              <p className="text-[10px] text-muted-foreground font-medium mb-2">{t("layout.quickActions")}</p>
              <Link to="/patients" onClick={onClose} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <UserPlus className="h-4 w-4 text-primary" /> {t("layout.addPatient")}
              </Link>
              <Link to="/appointments" onClick={onClose} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <CalendarDays className="h-4 w-4 text-accent" /> {t("layout.bookAppointment")}
              </Link>
              <Link to="/prescriptions" onClick={onClose} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground">
                <FileText className="h-4 w-4 text-success" /> {t("layout.writePrescription")}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}



export default function ClinicLayout({ children }: ClinicLayoutProps) {
  const location = useLocation();
  const { profile, role, signOut } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { hasNavAccess } = useFeatureAccess();


  const displayName = profile?.full_name || (lang === "ar" ? "مستخدم" : "User");
  const roleLabel = t(`role.${role || "user"}`);
  const initials = displayName.slice(0, 2);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Get current page title
  const currentPageTitle = navItems.find(n => n.path === location.pathname)?.labelKey;

  return (
    <div className="min-h-screen bg-background flex flex-row-reverse">
      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-l border-border/80 bg-card fixed top-0 right-0 h-full z-40 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          collapsed ? "w-[72px]" : "w-[250px]"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/80">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground leading-none">Smart Clinic</h1>
                <p className="text-[9px] text-muted-foreground mt-0.5">Management System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center mx-auto">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search trigger */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-3 h-9 rounded-xl bg-muted/70 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-right">{t("layout.search")}</span>
              <kbd className="text-[9px] bg-background px-1 py-0.5 rounded font-en">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => {
            if (role === "receptionist" && ["/finance", "/reports", "/settings"].includes(item.path)) return false;
            if (role === "accountant" && ["/prescriptions", "/services", "/reports", "/settings"].includes(item.path)) return false;
            if (role === "patient") return ["/"].includes(item.path);
            if (item.adminOnly && role !== "admin") return false;
            return true;
          }).map((item) => {
            const isExactActive = location.pathname === item.path;
            const isLocked = !hasNavAccess(item.labelKey);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`touch-target flex items-center gap-3 px-3 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isLocked
                    ? "text-muted-foreground/50 hover:bg-muted/30"
                    : isExactActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${isExactActive && !isLocked ? 'text-primary' : ''}`} />
                {!collapsed && <span>{t(item.labelKey)}</span>}
                {isLocked && !collapsed && (
                  <Lock className="h-3 w-3 mr-auto text-muted-foreground/40" />
                )}
                {isExactActive && !collapsed && !isLocked && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border/80">
          {collapsed ? (
            <div className="p-3 flex justify-center">
              <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title={t("layout.signOut")}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-xs font-bold">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold truncate text-foreground">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
                </div>
                <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title={t("layout.signOut")}>
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 glass z-50 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 rounded-lg">
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <h1 className="text-sm font-bold text-foreground">Smart Clinic</h1>
          <ClinicSwitcher />
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Language">
            <Languages className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Theme">
            {theme === "light" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
          </button>
          <NotificationPanel />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-card z-50 lg:hidden border-l border-border"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <Stethoscope className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <h1 className="text-sm font-bold">Smart Clinic</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 -ml-2 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="py-3 px-2.5 space-y-0.5">
                {navItems.filter(item => {
                  if (role === "receptionist" && ["/finance", "/reports", "/settings"].includes(item.path)) return false;
                  if (role === "accountant" && ["/prescriptions", "/services", "/reports", "/settings"].includes(item.path)) return false;
                  if (role === "patient") return ["/"].includes(item.path);
                  if (item.adminOnly && role !== "admin") return false;
                  return true;
                }).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`touch-target flex items-center gap-3 px-3 rounded-xl text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </nav>
              {/* Mobile user section */}
              <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border bg-card">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary text-xs font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
                  </div>
                  <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav lg:hidden flex items-center justify-around h-20 px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <div className={`flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 ${
                isActive ? "bg-primary/10 shadow-sm" : ""
              }`}>
                <item.icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? 'scale-105' : ''}`} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span className={`leading-tight ${isActive ? 'font-bold' : 'font-normal'}`}>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Top Bar */}
      <div className={`hidden lg:flex fixed top-0 z-30 h-14 items-center justify-between px-6 border-b border-border/60 bg-background/80 backdrop-blur-lg transition-all duration-300 ${
        collapsed ? "right-[72px] left-0" : "right-[250px] left-0"
      }`}>
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {currentPageTitle ? t(currentPageTitle) : t("nav.dashboard")}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-muted/60 hover:bg-muted text-xs text-muted-foreground transition-colors min-w-[200px]"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t("layout.search")}</span>
            <kbd className="mr-auto text-[9px] bg-background px-1.5 py-0.5 rounded font-en">⌘K</kbd>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors relative"
            title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            <Languages className="h-[18px] w-[18px]" />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-primary font-en">
              {lang === "ar" ? "EN" : "ع"}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            title={theme === "light" ? "Dark Mode" : "Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="h-[18px] w-[18px]" />
            ) : (
              <Sun className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Notifications */}
          <NotificationPanel />
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          collapsed ? "lg:mr-[72px]" : "lg:mr-[250px]"
        } mt-14 lg:mt-14 mb-16 lg:mb-0`}
      >
        <div className="p-4 lg:p-6 max-w-[1400px]">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
