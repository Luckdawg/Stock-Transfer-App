import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Filter,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Demo data
const certificates = [
  { id: 1, number: "CERT-001234", holder: "John Smith", shares: 10000, class: "Common", status: "active", issueDate: "2024-01-15" },
  { id: 2, number: "CERT-001235", holder: "Jane Doe", shares: 5000, class: "Common", status: "active", issueDate: "2024-02-20" },
  { id: 3, number: "CERT-001236", holder: "Acme Corp", shares: 50000, class: "Preferred A", status: "active", issueDate: "2024-03-10" },
  { id: 4, number: "CERT-001237", holder: "Bob Wilson", shares: 2500, class: "Common", status: "lost", issueDate: "2023-11-05" },
  { id: 5, number: "CERT-001238", holder: "Tech Ventures LLC", shares: 25000, class: "Preferred B", status: "transferred", issueDate: "2024-01-30" },
];

const bookEntries = [
  { id: 1, account: "SH-A001234", holder: "John Smith", shares: 15000, class: "Common", type: "book_entry", lastActivity: "2024-12-01" },
  { id: 2, account: "SH-A001235", holder: "Jane Doe", shares: 8000, class: "Common", type: "drs", lastActivity: "2024-11-28" },
  { id: 3, account: "SH-A001236", holder: "Acme Corp", shares: 75000, class: "Preferred A", type: "book_entry", lastActivity: "2024-12-05" },
  { id: 4, account: "SH-A001237", holder: "Investment Fund I", shares: 100000, class: "Common", type: "dtc", lastActivity: "2024-12-10" },
];

const drsRequests = [
  { id: 1, requestNumber: "DRS-2024-001", holder: "John Smith", shares: 5000, type: "deposit", status: "processing", submitted: "2024-12-10" },
  { id: 2, requestNumber: "DRS-2024-002", holder: "Jane Doe", shares: 2000, type: "withdrawal", status: "pending", submitted: "2024-12-12" },
  { id: 3, requestNumber: "DRS-2024-003", holder: "Bob Wilson", shares: 10000, type: "deposit", status: "completed", submitted: "2024-12-08" },
];

export default function Recordkeeping() {
  const [activeTab, setActiveTab] = useState<"certificates" | "book_entry" | "drs">("certificates");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "lost":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Lost</Badge>;
      case "transferred":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Transferred</Badge>;
      case "processing":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Processing</Badge>;
      case "pending":
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <StockDashboardLayout title="RECORDKEEPING – ELECTRONIC BOOK-ENTRY SYSTEM">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12,450</p>
                  <p className="text-sm text-slate-400">Book-Entry Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-slate-400">Active Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-slate-400">DRS Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-slate-400">Lost Certificates</p>
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
                  variant={activeTab === "certificates" ? "default" : "outline"}
                  onClick={() => setActiveTab("certificates")}
                  className={activeTab === "certificates" ? "bg-[#1e3a5f]" : ""}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Certificates
                </Button>
                <Button 
                  variant={activeTab === "book_entry" ? "default" : "outline"}
                  onClick={() => setActiveTab("book_entry")}
                  className={activeTab === "book_entry" ? "bg-[#1e3a5f]" : ""}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Book-Entry Records
                </Button>
                <Button 
                  variant={activeTab === "drs" ? "default" : "outline"}
                  onClick={() => setActiveTab("drs")}
                  className={activeTab === "drs" ? "bg-[#1e3a5f]" : ""}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  DRS Requests
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search records..." 
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
                  New Record
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "certificates" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Holder</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Share Class</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono">{cert.number}</TableCell>
                      <TableCell>{cert.holder}</TableCell>
                      <TableCell>{cert.shares.toLocaleString()}</TableCell>
                      <TableCell>{cert.class}</TableCell>
                      <TableCell>{cert.issueDate}</TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View certificate details - Feature coming soon")}>View</Button>
                          {cert.status === "lost" && (
                            <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => toast.info("Replace certificate - Feature coming soon")}>Replace</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "book_entry" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account #</TableHead>
                    <TableHead>Holder</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Share Class</TableHead>
                    <TableHead>Holding Type</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.account}</TableCell>
                      <TableCell>{entry.holder}</TableCell>
                      <TableCell>{entry.shares.toLocaleString()}</TableCell>
                      <TableCell>{entry.class}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">{entry.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{entry.lastActivity}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toast.info("View account details - Feature coming soon")}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "drs" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Holder</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drsRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono">{req.requestNumber}</TableCell>
                      <TableCell>{req.holder}</TableCell>
                      <TableCell>{req.shares.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{req.type}</Badge>
                      </TableCell>
                      <TableCell>{req.submitted}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View request details - Feature coming soon")}>View</Button>
                          {req.status === "pending" && (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toast.info("Process request - Feature coming soon")}>Process</Button>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Lost Certificate Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Report and manage lost or stolen certificates. Initiate replacement process with indemnity bond requirements.
              </p>
              <Button variant="outline" className="w-full" onClick={() => toast.info("Report lost certificate - Feature coming soon")}>
                Report Lost Certificate
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Export Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Generate and download comprehensive reports of all recordkeeping activities and holdings.
              </p>
              <Button variant="outline" className="w-full" onClick={() => toast.info("Export records - Feature coming soon")}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-500" />
                DTC/DWAC Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Process DTC deposits, withdrawals, and FAST transfers with automated settlement tracking.
              </p>
              <Button variant="outline" className="w-full" onClick={() => toast.info("New DTC request - Feature coming soon")}>
                New DTC Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StockDashboardLayout>
  );
}
