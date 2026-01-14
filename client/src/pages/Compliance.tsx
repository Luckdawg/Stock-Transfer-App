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
  ShieldCheck, 
  Search, 
  Plus, 
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Download,
  AlertCircle,
  XCircle,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Demo data
const taxFilings = [
  { id: 1, form: "1099-DIV", year: 2024, dueDate: "2025-01-31", status: "pending", recipients: 35000, generated: 34500 },
  { id: 2, form: "1099-B", year: 2024, dueDate: "2025-02-15", status: "in_progress", recipients: 12000, generated: 8000 },
  { id: 3, form: "1042-S", year: 2024, dueDate: "2025-03-15", status: "not_started", recipients: 2500, generated: 0 },
];

const complianceAlerts = [
  { id: 1, type: "filing_deadline", title: "1099-DIV Filing Due", description: "Tax forms must be filed by January 31, 2025", severity: "high", dueDate: "2025-01-31", status: "active" },
  { id: 2, type: "escheatment", title: "State Escheatment Report - CA", description: "California unclaimed property report due in 30 days", severity: "medium", dueDate: "2025-02-15", status: "active" },
  { id: 3, type: "regulatory", title: "Rule 17Ad-7 Compliance Review", description: "Annual compliance review scheduled", severity: "low", dueDate: "2025-03-01", status: "scheduled" },
  { id: 4, type: "insider_trading", title: "Potential Insider Trading Alert", description: "Unusual trading pattern detected for insider account", severity: "critical", dueDate: "-", status: "investigating" },
];

const auditTrail = [
  { id: 1, action: "Certificate Issuance", user: "Admin User", timestamp: "2024-12-12 14:32:15", details: "CERT-001239 issued to John Smith", status: "logged" },
  { id: 2, action: "Transfer Approval", user: "Compliance Officer", timestamp: "2024-12-12 13:45:22", details: "TX-2024120003 approved", status: "logged" },
  { id: 3, action: "Rule 144 Review", user: "Legal Team", timestamp: "2024-12-12 11:20:08", details: "Sale request reviewed for Jane Doe", status: "logged" },
  { id: 4, action: "Address Change", user: "Shareholder Portal", timestamp: "2024-12-12 10:15:33", details: "Address updated for account SH-A001234", status: "logged" },
];

const escheatmentReports = [
  { id: 1, state: "California", dueDate: "2025-02-15", amount: "$125,432", accounts: 234, status: "pending" },
  { id: 2, state: "Delaware", dueDate: "2025-03-01", amount: "$45,678", accounts: 89, status: "not_started" },
  { id: 3, state: "New York", dueDate: "2025-03-15", amount: "$78,901", accounts: 156, status: "not_started" },
];

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<"overview" | "tax" | "audit" | "escheatment">("overview");

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600 text-white"><AlertCircle className="w-3 h-3 mr-1" />Critical</Badge>;
      case "high":
        return <Badge className="bg-amber-500 text-white"><AlertTriangle className="w-3 h-3 mr-1" />High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-500 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-500/20 text-red-600">Active</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/20 text-blue-600">Scheduled</Badge>;
      case "investigating":
        return <Badge className="bg-amber-500/20 text-amber-600">Investigating</Badge>;
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-600">Resolved</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-cyan-500/20 text-cyan-600">In Progress</Badge>;
      case "not_started":
        return <Badge className="bg-slate-500/20 text-slate-600">Not Started</Badge>;
      case "logged":
        return <Badge className="bg-green-500/20 text-green-600">Logged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <StockDashboardLayout title="COMPLIANCE & REPORTING">
      <div className="space-y-6">
        {/* Compliance Score Card */}
        <Card className="bg-[#1e3a5f] border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Compliance Dashboard</h2>
                <p className="text-slate-400">Real-time compliance monitoring and regulatory reporting</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Compliance Score:</span>
                  <span className="text-4xl font-bold text-green-400">98/100</span>
                </div>
                <p className="text-sm text-green-400 flex items-center gap-1 justify-end mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Rule 17Ad-7 Compliant
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">1</p>
                  <p className="text-sm text-slate-500">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-amber-600">3</p>
                  <p className="text-sm text-slate-500">Pending Filings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">30</p>
                  <p className="text-sm text-slate-500">Days to Next Deadline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">All</p>
                  <p className="text-sm text-slate-500">Audit Trails Logged</p>
                </div>
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
                  variant={activeTab === "overview" ? "default" : "outline"}
                  onClick={() => setActiveTab("overview")}
                  className={activeTab === "overview" ? "bg-[#1e3a5f]" : ""}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Alerts Overview
                </Button>
                <Button 
                  variant={activeTab === "tax" ? "default" : "outline"}
                  onClick={() => setActiveTab("tax")}
                  className={activeTab === "tax" ? "bg-[#1e3a5f]" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Tax Reporting
                </Button>
                <Button 
                  variant={activeTab === "audit" ? "default" : "outline"}
                  onClick={() => setActiveTab("audit")}
                  className={activeTab === "audit" ? "bg-[#1e3a5f]" : ""}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Audit Trail
                </Button>
                <Button 
                  variant={activeTab === "escheatment" ? "default" : "outline"}
                  onClick={() => setActiveTab("escheatment")}
                  className={activeTab === "escheatment" ? "bg-[#1e3a5f]" : ""}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Escheatment
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "overview" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceAlerts.map((alert) => (
                    <TableRow key={alert.id} className={alert.severity === "critical" ? "bg-red-50" : ""}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{alert.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="text-slate-600">{alert.description}</TableCell>
                      <TableCell>{alert.dueDate}</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View alert - Feature coming soon")}>View</Button>
                          <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toast.info("Resolve alert - Feature coming soon")}>Resolve</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "tax" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxFilings.map((filing) => {
                    const progress = (filing.generated / filing.recipients) * 100;
                    return (
                      <TableRow key={filing.id}>
                        <TableCell className="font-mono font-bold">{filing.form}</TableCell>
                        <TableCell>{filing.year}</TableCell>
                        <TableCell className="font-medium">{filing.dueDate}</TableCell>
                        <TableCell>{filing.recipients.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-24 h-2" />
                            <span className="text-sm">{filing.generated.toLocaleString()} / {filing.recipients.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(filing.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toast.info("Generate forms - Feature coming soon")}>Generate</Button>
                            <Button variant="ghost" size="sm" onClick={() => toast.info("Download forms - Feature coming soon")}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {activeTab === "audit" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.action}</TableCell>
                      <TableCell>{entry.user}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.timestamp}</TableCell>
                      <TableCell className="text-slate-600">{entry.details}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "escheatment" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Accounts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escheatmentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.state}</TableCell>
                      <TableCell>{report.dueDate}</TableCell>
                      <TableCell className="font-medium">{report.amount}</TableCell>
                      <TableCell>{report.accounts}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Generate report - Feature coming soon")}>Generate</Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("File report - Feature coming soon")}>File</Button>
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
