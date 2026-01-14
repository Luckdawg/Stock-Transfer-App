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
  ArrowRightLeft, 
  Search, 
  Plus, 
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Demo data
const transactions = [
  { id: 1, number: "TX-2024120001", type: "transfer", from: "John Smith", to: "Jane Doe", shares: 5000, class: "Common", status: "completed", date: "2024-12-10", value: "$125,000" },
  { id: 2, number: "TX-2024120002", type: "issuance", from: "Treasury", to: "Tech Ventures LLC", shares: 25000, class: "Preferred A", status: "pending", date: "2024-12-11", value: "$625,000" },
  { id: 3, number: "TX-2024120003", type: "transfer", from: "Acme Corp", to: "Investment Fund I", shares: 10000, class: "Common", status: "approved", date: "2024-12-12", value: "$250,000" },
  { id: 4, number: "TX-2024120004", type: "cancellation", from: "Bob Wilson", to: "-", shares: 2500, class: "Common", status: "processing", date: "2024-12-12", value: "$62,500" },
  { id: 5, number: "TX-2024120005", type: "dtc_deposit", from: "Jane Doe", to: "DTC", shares: 3000, class: "Common", status: "completed", date: "2024-12-09", value: "$75,000" },
];

const corporateActions = [
  { id: 1, number: "CA-2024-001", type: "split", title: "2-for-1 Stock Split", status: "scheduled", recordDate: "2024-12-20", effectiveDate: "2024-12-22" },
  { id: 2, number: "CA-2024-002", type: "dividend_cash", title: "Q4 Cash Dividend", status: "announced", recordDate: "2024-12-15", paymentDate: "2024-12-30" },
  { id: 3, number: "CA-2024-003", type: "merger", title: "Merger with XYZ Corp", status: "pending", recordDate: "2025-01-15", effectiveDate: "2025-02-01" },
];

const rule144Sales = [
  { id: 1, holder: "John Smith (Insider)", shares: 10000, holdingPeriod: "18 months", volumeLimit: "25,000", status: "eligible", requestDate: "2024-12-10" },
  { id: 2, holder: "Jane Doe (Affiliate)", shares: 5000, holdingPeriod: "8 months", volumeLimit: "15,000", status: "under_review", requestDate: "2024-12-11" },
];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<"transactions" | "corporate_actions" | "rule_144">("transactions");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "processing":
        return <Badge className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "scheduled":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "announced":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><FileText className="w-3 h-3 mr-1" />Announced</Badge>;
      case "eligible":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Eligible</Badge>;
      case "under_review":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "transfer":
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><ArrowRightLeft className="w-3 h-3 mr-1" />Transfer</Badge>;
      case "issuance":
        return <Badge variant="outline" className="border-green-500 text-green-600"><TrendingUp className="w-3 h-3 mr-1" />Issuance</Badge>;
      case "cancellation":
        return <Badge variant="outline" className="border-red-500 text-red-600"><TrendingDown className="w-3 h-3 mr-1" />Cancellation</Badge>;
      case "dtc_deposit":
        return <Badge variant="outline" className="border-purple-500 text-purple-600">DTC Deposit</Badge>;
      case "split":
        return <Badge variant="outline" className="border-cyan-500 text-cyan-600">Stock Split</Badge>;
      case "dividend_cash":
        return <Badge variant="outline" className="border-green-500 text-green-600">Cash Dividend</Badge>;
      case "merger":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Merger</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <StockDashboardLayout title="TRANSACTIONS & CORPORATE ACTIONS">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-slate-400">Pending Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">248</p>
                  <p className="text-sm text-slate-400">Completed This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-slate-400">Upcoming Corp Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-slate-400">Rule 144 Reviews</p>
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
                  variant={activeTab === "transactions" ? "default" : "outline"}
                  onClick={() => setActiveTab("transactions")}
                  className={activeTab === "transactions" ? "bg-[#1e3a5f]" : ""}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transactions
                </Button>
                <Button 
                  variant={activeTab === "corporate_actions" ? "default" : "outline"}
                  onClick={() => setActiveTab("corporate_actions")}
                  className={activeTab === "corporate_actions" ? "bg-[#1e3a5f]" : ""}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Corporate Actions
                </Button>
                <Button 
                  variant={activeTab === "rule_144" ? "default" : "outline"}
                  onClick={() => setActiveTab("rule_144")}
                  className={activeTab === "rule_144" ? "bg-[#1e3a5f]" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rule 144 Sales
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
                  {activeTab === "transactions" ? "New Transaction" : activeTab === "corporate_actions" ? "New Action" : "New Request"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "transactions" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono">{tx.number}</TableCell>
                      <TableCell>{getTypeBadge(tx.type)}</TableCell>
                      <TableCell>{tx.from}</TableCell>
                      <TableCell>{tx.to}</TableCell>
                      <TableCell>{tx.shares.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{tx.value}</TableCell>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View transaction - Feature coming soon")}>View</Button>
                          {tx.status === "pending" && (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toast.info("Approve transaction - Feature coming soon")}>Approve</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "corporate_actions" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Record Date</TableHead>
                    <TableHead>Effective/Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corporateActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-mono">{action.number}</TableCell>
                      <TableCell>{getTypeBadge(action.type)}</TableCell>
                      <TableCell className="font-medium">{action.title}</TableCell>
                      <TableCell>{action.recordDate}</TableCell>
                      <TableCell>{action.effectiveDate || action.paymentDate}</TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View action details - Feature coming soon")}>View</Button>
                          <Button variant="ghost" size="sm" className="text-cyan-600" onClick={() => toast.info("Process action - Feature coming soon")}>Process</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "rule_144" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holder</TableHead>
                    <TableHead>Shares Requested</TableHead>
                    <TableHead>Holding Period</TableHead>
                    <TableHead>Volume Limit</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rule144Sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.holder}</TableCell>
                      <TableCell>{sale.shares.toLocaleString()}</TableCell>
                      <TableCell>{sale.holdingPeriod}</TableCell>
                      <TableCell>{sale.volumeLimit}</TableCell>
                      <TableCell>{sale.requestDate}</TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View details - Feature coming soon")}>View</Button>
                          {sale.status === "under_review" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toast.info("Approve sale - Feature coming soon")}>Approve</Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => toast.info("Reject sale - Feature coming soon")}>Reject</Button>
                            </>
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
