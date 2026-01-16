import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  AlertTriangle,
  UserPlus,
  Loader2,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<"company" | "users" | "security" | "notifications" | "integrations">("company");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "issuer" | "shareholder" | "employee" | "user">("user");
  const [inviteMessage, setInviteMessage] = useState("");
  
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Fetch users
  const { data: users, isLoading: usersLoading } = trpc.user.list.useQuery();

  // Create invitation mutation
  const createInvitation = trpc.invitation.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Invitation email sent to ${data.email}!`);
      // Also copy link to clipboard as backup
      const inviteLink = `${window.location.origin}/invite/${data.token}`;
      navigator.clipboard.writeText(inviteLink);
      toast.info("Invitation link also copied to clipboard");
      
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("user");
      setInviteMessage("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete user mutation
  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    createInvitation.mutate({
      email: inviteEmail,
      role: inviteRole,
      message: inviteMessage || undefined,
      expiresInDays: 7,
    });
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteUser.mutate({ userId });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Admin</Badge>;
      case "issuer":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Issuer</Badge>;
      case "shareholder":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Shareholder</Badge>;
      case "employee":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Employee</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

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
                          <SelectItem value="otc">OTC Markets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="address">Corporate Address</Label>
                    <Input id="address" defaultValue="123 Main Street, Suite 500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" defaultValue="NY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" defaultValue="10001" />
                    </div>
                  </div>
                  <Button className="bg-[#1e3a5f]" onClick={() => toast.success("Company information updated")}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "users" && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-500" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage administrator access and permissions</CardDescription>
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#1e3a5f]">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite New User</DialogTitle>
                        <DialogDescription>
                          Send an invitation to a new user to join the platform
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="issuer">Issuer</SelectItem>
                              <SelectItem value="shareholder">Shareholder</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Personal Message (Optional)</Label>
                          <Input
                            id="message"
                            placeholder="Welcome to our platform!"
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-[#1e3a5f]"
                          onClick={handleInviteUser}
                          disabled={createInvitation.isPending}
                        >
                          {createInvitation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{u.name || "Unknown User"}</p>
                          <p className="text-sm text-slate-500">{u.email || "No email"}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getRoleBadge(u.role)}
                          {user?.id !== u.id && user?.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name || "this user")}
                              disabled={deleteUser.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No users found. Click "Add New User" to invite someone.
                  </div>
                )}
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
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-slate-500">Automatically log out inactive users</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
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
                <Button className="bg-[#1e3a5f]" onClick={() => toast.success("Security settings updated")}>
                  Save Security Settings
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
                <CardDescription>Configure email and system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transfer Notifications</p>
                    <p className="text-sm text-slate-500">Get notified when transfers are initiated</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compliance Alerts</p>
                    <p className="text-sm text-slate-500">Receive alerts for compliance deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-slate-500">Receive daily activity summary emails</p>
                  </div>
                  <Switch />
                </div>
                <Button className="bg-[#1e3a5f]" onClick={() => toast.success("Notification preferences updated")}>
                  Save Preferences
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
                <CardDescription>Manage API keys and third-party integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="font-medium">Production API Key</p>
                        <p className="text-sm text-slate-500 font-mono">sk_prod_••••••••••••1234</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("API key management - Feature coming soon")}>
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">Webhook Endpoint</p>
                        <p className="text-sm text-slate-500">Configure webhook notifications</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Webhook configuration - Feature coming soon")}>
                      Configure
                    </Button>
                  </div>
                </div>
                <Button variant="outline" onClick={() => toast.info("Generate new API key - Feature coming soon")}>
                  <Key className="w-4 h-4 mr-2" />
                  Generate New API Key
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StockDashboardLayout>
  );
}
