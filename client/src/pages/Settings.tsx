import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Building2,
  Users,
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<"company" | "users" | "security" | "notifications" | "integrations">("company");

  const sections = [
    { id: "company", label: "Company Profile", icon: Building2 },
    { id: "users", label: "User Management", icon: Users },
    { id: "security", label: "Security Settings", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "API & Integrations", icon: Globe },
  ];

  return (
    <StockDashboardLayout title="SETTINGS">
      <div className="flex gap-6">
        {/* Settings Navigation */}
        <Card className="w-64 bg-white border-slate-200 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as typeof activeSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#1e3a5f] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeSection === "company" && (
            <>
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-500" />
                    Company Information
                  </CardTitle>
                  <CardDescription>Manage your company profile and issuer details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" defaultValue="Acme Corporation" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticker">Stock Ticker</Label>
                      <Input id="ticker" defaultValue="ACME" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cusip">CUSIP Number</Label>
                      <Input id="cusip" defaultValue="123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exchange">Exchange</Label>
                      <Select defaultValue="nyse">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nyse">NYSE</SelectItem>
                          <SelectItem value="nasdaq">NASDAQ</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="authorizedShares">Authorized Shares</Label>
                      <Input id="authorizedShares" defaultValue="100,000,000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outstandingShares">Outstanding Shares</Label>
                      <Input id="outstandingShares" defaultValue="50,000,000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parValue">Par Value</Label>
                      <Input id="parValue" defaultValue="$0.001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                      <Select defaultValue="december">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="december">December 31</SelectItem>
                          <SelectItem value="june">June 30</SelectItem>
                          <SelectItem value="march">March 31</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.success("Company settings saved")}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "users" && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  User Management
                </CardTitle>
                <CardDescription>Manage administrator access and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { name: "Admin User", email: "admin@company.com", role: "Super Admin", status: "active" },
                    { name: "Compliance Officer", email: "compliance@company.com", role: "Compliance", status: "active" },
                    { name: "Transfer Agent", email: "agent@company.com", role: "Agent", status: "active" },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge className="bg-green-500/20 text-green-600">{user.status}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Edit user - Feature coming soon")}>Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => toast.info("Add user - Feature coming soon")}>
                  <Users className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and authentication options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Require 2FA for all administrator accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-slate-500">Automatically log out after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">IP Whitelisting</p>
                    <p className="text-sm text-slate-500">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-slate-500">Log all system activities for compliance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.success("Security settings saved")}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure alerts and notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Alerts</p>
                    <p className="text-sm text-slate-500">Notify on large or unusual transactions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compliance Deadlines</p>
                    <p className="text-sm text-slate-500">Reminders for upcoming regulatory deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Shareholder Activity</p>
                    <p className="text-sm text-slate-500">Alerts for significant shareholder changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Health</p>
                    <p className="text-sm text-slate-500">Notifications for system issues or downtime</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Notification Email</Label>
                  <Input defaultValue="alerts@company.com" />
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.success("Notification settings saved")}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "integrations" && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  API & Integrations
                </CardTitle>
                <CardDescription>Manage API keys and external integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">API Key</p>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Regenerate API key - Feature coming soon")}>
                      <Key className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  <code className="text-sm bg-slate-200 px-2 py-1 rounded block">sk_live_••••••••••••••••••••••••</code>
                </div>
                <Separator />
                <div className="space-y-4">
                  <p className="font-medium">Connected Services</p>
                  {[
                    { name: "DTC/DTCC", status: "connected" },
                    { name: "SWIFT Network", status: "connected" },
                    { name: "SEC EDGAR", status: "connected" },
                    { name: "IRS e-File", status: "pending" },
                  ].map((service, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span>{service.name}</span>
                      <Badge className={service.status === "connected" ? "bg-green-500/20 text-green-600" : "bg-amber-500/20 text-amber-600"}>
                        {service.status === "connected" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => toast.info("Add integration - Feature coming soon")}>
                  Add New Integration
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StockDashboardLayout>
  );
}
