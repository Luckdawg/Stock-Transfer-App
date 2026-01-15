import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  ArrowRightLeft, 
  Users, 
  Vote, 
  ShieldCheck, 
  Briefcase, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  User,
  TrendingUp,
  Lock,
  LogOut,
  Loader2,
  Building2,
  UserCog
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: LayoutDashboard, label: "DASHBOARD", path: "/" },
  { icon: FileText, label: "RECORDKEEPING", path: "/recordkeeping" },
  { icon: ArrowRightLeft, label: "TRANSACTIONS & ACTIONS", path: "/transactions" },
  { icon: Users, label: "SHAREHOLDER PORTAL", path: "/shareholder-portal" },
  { icon: Vote, label: "PROXY & VOTING", path: "/proxy-voting" },
  { icon: ShieldCheck, label: "COMPLIANCE & REPORTING", path: "/compliance" },
  { icon: Briefcase, label: "EQUITY PLANS", path: "/equity-plans" },
  { icon: BarChart3, label: "ANALYTICS", path: "/analytics" },
  { icon: Building2, label: "COMPANIES", path: "/companies" },
  { icon: UserCog, label: "USERS", path: "/users" },
  { icon: Settings, label: "SETTINGS", path: "/settings" },
];

interface StockDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  companySelector?: ReactNode;
}

export default function StockDashboardLayout({ children, title, companySelector }: StockDashboardLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Stock Transfer Platform</h1>
          </div>
          <p className="text-slate-400 text-lg mb-8">
            Enterprise-grade transfer agent and stock plan administration platform for public and private companies.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: FileText, label: "Recordkeeping" },
              { icon: ArrowRightLeft, label: "Transactions" },
              { icon: Users, label: "Shareholder Portal" },
              { icon: ShieldCheck, label: "Compliance" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <item.icon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-slate-300 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
          <Button 
            size="lg" 
            className="bg-amber-500 hover:bg-amber-600 text-white px-8"
            onClick={() => window.location.href = getLoginUrl()}
          >
            <Lock className="w-4 h-4 mr-2" />
            Sign In to Access Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2744] text-white flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-sm">STOCK TRANSFER</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/" && location.startsWith(item.path));
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive 
                    ? 'bg-amber-500/20 text-amber-400 border-l-4 border-amber-500' 
                    : 'text-slate-300 hover:bg-slate-700/50 border-l-4 border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="bg-[#1a2744] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold">
              {title || "STOCK TRANSFER APPLICATION – ENTERPRISE EDITION"}
            </h1>
            <p className="text-sm text-slate-400">
              <Lock className="w-3 h-3 inline mr-1" />
              Logged in as: <span className="text-amber-400">{user?.name || 'Administrator'}</span> | 
              Security Level: <span className="text-green-400">High</span> | 
              Last Login: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {companySelector}
            <Search className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" />
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-500 transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        {/* Footer Status Bar */}
        <footer className="bg-[#1a2744] text-white px-6 py-2 text-xs flex items-center justify-center gap-6 border-t border-slate-700">
          <span><span className="text-slate-400">SYSTEM STATUS:</span> <span className="text-green-400">ALL SERVICES OPERATIONAL</span></span>
          <span className="text-slate-600">|</span>
          <span><span className="text-slate-400">ENCRYPTION:</span> <span className="text-green-400">AES-256</span></span>
          <span className="text-slate-600">|</span>
          <span><span className="text-slate-400">MFA:</span> <span className="text-green-400">ENABLED</span></span>
          <span className="text-slate-600">|</span>
          <span><span className="text-slate-400">SUPPORT:</span> 24/7 HELP DESK</span>
        </footer>
      </div>
    </div>
  );
}
