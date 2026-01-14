import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Briefcase, 
  Search, 
  Plus, 
  Filter,
  Award,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  FileText
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Demo data
const equityPlans = [
  { id: 1, name: "2024 Stock Option Plan", type: "stock_options", totalPool: 5000000, granted: 3200000, available: 1800000, participants: 450, status: "active" },
  { id: 2, name: "RSU Plan 2024", type: "rsu", totalPool: 2000000, granted: 1500000, available: 500000, participants: 280, status: "active" },
  { id: 3, name: "Performance Share Plan", type: "performance", totalPool: 1000000, granted: 750000, available: 250000, participants: 50, status: "active" },
];

const grants = [
  { id: 1, grantNumber: "GR-2024-001", employee: "Sarah Johnson", type: "stock_options", shares: 10000, grantDate: "2024-01-15", vestingSchedule: "4-year cliff", vestedShares: 2500, status: "active" },
  { id: 2, grantNumber: "GR-2024-002", employee: "Michael Chen", type: "rsu", shares: 5000, grantDate: "2024-02-01", vestingSchedule: "3-year monthly", vestedShares: 1667, status: "active" },
  { id: 3, grantNumber: "GR-2024-003", employee: "Emily Davis", type: "performance", shares: 15000, grantDate: "2024-03-01", vestingSchedule: "Performance-based", vestedShares: 0, status: "pending_approval" },
  { id: 4, grantNumber: "GR-2024-004", employee: "Robert Kim", type: "stock_options", shares: 8000, grantDate: "2024-01-20", vestingSchedule: "4-year cliff", vestedShares: 2000, status: "active" },
];

const vestingEvents = [
  { id: 1, date: "2024-12-15", employee: "Sarah Johnson", shares: 625, type: "stock_options", status: "upcoming" },
  { id: 2, date: "2024-12-15", employee: "Michael Chen", shares: 139, type: "rsu", status: "upcoming" },
  { id: 3, date: "2025-01-01", employee: "Robert Kim", shares: 500, type: "stock_options", status: "scheduled" },
  { id: 4, date: "2025-01-15", employee: "Sarah Johnson", shares: 625, type: "stock_options", status: "scheduled" },
];

export default function EquityPlans() {
  const [activeTab, setActiveTab] = useState<"plans" | "grants" | "vesting">("plans");
  const [searchTerm, setSearchTerm] = useState("");

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "stock_options":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Stock Options</Badge>;
      case "rsu":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">RSU</Badge>;
      case "performance":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Performance</Badge>;
      case "sar":
        return <Badge className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30">SAR</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
      case "pending_approval":
        return <Badge className="bg-amber-500/20 text-amber-600">Pending Approval</Badge>;
      case "upcoming":
        return <Badge className="bg-cyan-500/20 text-cyan-600">Upcoming</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/20 text-blue-600">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-slate-500/20 text-slate-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <StockDashboardLayout title="EQUITY PLAN ADMINISTRATION">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-slate-400">Active Plans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,200</p>
                  <p className="text-sm text-slate-400">Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12/01</p>
                  <p className="text-sm text-slate-400">Next Vesting Date</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-slate-400">Employee Portal Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Tax Withholding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">Automated calculations enabled</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">Grant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-medium">New Awards pending CEO approval</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">FASB/SEC Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">All reports up to date</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant={activeTab === "plans" ? "default" : "outline"}
                  onClick={() => setActiveTab("plans")}
                  className={activeTab === "plans" ? "bg-[#1e3a5f]" : ""}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Equity Plans
                </Button>
                <Button 
                  variant={activeTab === "grants" ? "default" : "outline"}
                  onClick={() => setActiveTab("grants")}
                  className={activeTab === "grants" ? "bg-[#1e3a5f]" : ""}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Grants & Awards
                </Button>
                <Button 
                  variant={activeTab === "vesting" ? "default" : "outline"}
                  onClick={() => setActiveTab("vesting")}
                  className={activeTab === "vesting" ? "bg-[#1e3a5f]" : ""}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Vesting Schedule
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {activeTab === "plans" ? "New Plan" : activeTab === "grants" ? "New Grant" : "Add Event"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "plans" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Pool</TableHead>
                    <TableHead>Granted</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equityPlans.map((plan) => {
                    const utilization = (plan.granted / plan.totalPool) * 100;
                    return (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{getTypeBadge(plan.type)}</TableCell>
                        <TableCell>{plan.totalPool.toLocaleString()}</TableCell>
                        <TableCell>{plan.granted.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">{plan.available.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={utilization} className="w-20 h-2" />
                            <span className="text-sm">{utilization.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{plan.participants}</TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Manage plan - Feature coming soon")}>Manage</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {activeTab === "grants" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grant #</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Shares</TableHead>
                    <TableHead>Grant Date</TableHead>
                    <TableHead>Vesting Schedule</TableHead>
                    <TableHead>Vested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => {
                    const vestedPct = (grant.vestedShares / grant.shares) * 100;
                    return (
                      <TableRow key={grant.id}>
                        <TableCell className="font-mono">{grant.grantNumber}</TableCell>
                        <TableCell className="font-medium">{grant.employee}</TableCell>
                        <TableCell>{getTypeBadge(grant.type)}</TableCell>
                        <TableCell>{grant.shares.toLocaleString()}</TableCell>
                        <TableCell>{grant.grantDate}</TableCell>
                        <TableCell>{grant.vestingSchedule}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={vestedPct} className="w-16 h-2" />
                            <span className="text-sm">{grant.vestedShares.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(grant.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toast.info("View grant - Feature coming soon")}>View</Button>
                            {grant.status === "pending_approval" && (
                              <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toast.info("Approve grant - Feature coming soon")}>Approve</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {activeTab === "vesting" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vesting Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shares Vesting</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vestingEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.date}</TableCell>
                      <TableCell>{event.employee}</TableCell>
                      <TableCell>{getTypeBadge(event.type)}</TableCell>
                      <TableCell>{event.shares.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View details - Feature coming soon")}>View</Button>
                          {event.status === "upcoming" && (
                            <Button variant="ghost" size="sm" className="text-cyan-600" onClick={() => toast.info("Process vesting - Feature coming soon")}>Process</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </StockDashboardLayout>
  );
}
