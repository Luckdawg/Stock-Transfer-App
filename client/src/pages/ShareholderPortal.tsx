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
  Users, 
  Search, 
  Plus, 
  Filter,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Eye,
  Edit,
  Activity,
  MessageSquare,
  Bell
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Demo data
const shareholders = [
  { id: 1, name: "John Smith", accountNumber: "SH-A001234", email: "john.smith@email.com", phone: "(555) 123-4567", totalShares: 25000, shareClasses: ["Common"], status: "active", lastLogin: "2024-12-10" },
  { id: 2, name: "Jane Doe", accountNumber: "SH-A001235", email: "jane.doe@email.com", phone: "(555) 234-5678", totalShares: 13000, shareClasses: ["Common"], status: "active", lastLogin: "2024-12-12" },
  { id: 3, name: "Acme Corporation", accountNumber: "SH-A001236", email: "investor@acme.com", phone: "(555) 345-6789", totalShares: 125000, shareClasses: ["Common", "Preferred A"], status: "active", lastLogin: "2024-12-11" },
  { id: 4, name: "Tech Ventures LLC", accountNumber: "SH-A001237", email: "holdings@techventures.com", phone: "(555) 456-7890", totalShares: 50000, shareClasses: ["Preferred B"], status: "active", lastLogin: "2024-12-09" },
  { id: 5, name: "Bob Wilson", accountNumber: "SH-A001238", email: "bob.wilson@email.com", phone: "(555) 567-8901", totalShares: 7500, shareClasses: ["Common"], status: "inactive", lastLogin: "2024-11-15" },
];

const recentActivity = [
  { id: 1, shareholder: "John Smith", action: "Address Update", date: "2024-12-10 14:32", status: "completed" },
  { id: 2, shareholder: "Jane Doe", action: "Statement View", date: "2024-12-12 09:15", status: "completed" },
  { id: 3, shareholder: "Acme Corporation", action: "Tax Form Download", date: "2024-12-11 16:45", status: "completed" },
  { id: 4, shareholder: "Tech Ventures LLC", action: "Direct Deposit Setup", date: "2024-12-09 11:20", status: "pending" },
];

const communications = [
  { id: 1, title: "Q3 Report Distribution", recipients: 40000, sentDate: "2024-12-01", openRate: "68%", status: "delivered" },
  { id: 2, title: "Annual Meeting Notice", recipients: 40000, sentDate: "2024-11-15", openRate: "72%", status: "delivered" },
  { id: 3, title: "Dividend Announcement", recipients: 40000, sentDate: "2024-11-01", openRate: "85%", status: "delivered" },
];

export default function ShareholderPortal() {
  const [activeTab, setActiveTab] = useState<"shareholders" | "activity" | "communications">("shareholders");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <StockDashboardLayout title="SHAREHOLDER PORTAL MANAGEMENT">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">18,450</p>
                  <p className="text-sm text-slate-400">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">65%</p>
                  <p className="text-sm text-slate-400">Mobile App Logins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">120</p>
                  <p className="text-sm text-slate-400">Self-Service Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">35</p>
                  <p className="text-sm text-slate-400">Unread Messages</p>
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
                  variant={activeTab === "shareholders" ? "default" : "outline"}
                  onClick={() => setActiveTab("shareholders")}
                  className={activeTab === "shareholders" ? "bg-[#1e3a5f]" : ""}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Shareholders
                </Button>
                <Button 
                  variant={activeTab === "activity" ? "default" : "outline"}
                  onClick={() => setActiveTab("activity")}
                  className={activeTab === "activity" ? "bg-[#1e3a5f]" : ""}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Portal Activity
                </Button>
                <Button 
                  variant={activeTab === "communications" ? "default" : "outline"}
                  onClick={() => setActiveTab("communications")}
                  className={activeTab === "communications" ? "bg-[#1e3a5f]" : ""}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Communications
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="Search shareholders..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                {activeTab === "communications" && (
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Communication
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "shareholders" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Account #</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Shares</TableHead>
                    <TableHead>Share Classes</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareholders.map((sh) => (
                    <TableRow key={sh.id}>
                      <TableCell className="font-medium">{sh.name}</TableCell>
                      <TableCell className="font-mono text-sm">{sh.accountNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Mail className="w-3 h-3" />{sh.email}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3" />{sh.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{sh.totalShares.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {sh.shareClasses.map((cls) => (
                            <Badge key={cls} variant="outline" className="text-xs">{cls}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{sh.lastLogin}</TableCell>
                      <TableCell>
                        <Badge className={sh.status === "active" ? "bg-green-500/20 text-green-600" : "bg-slate-500/20 text-slate-600"}>
                          {sh.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View shareholder - Feature coming soon")}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Edit shareholder - Feature coming soon")}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Send message - Feature coming soon")}>
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "activity" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shareholder</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.shareholder}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>
                        <Badge className={activity.status === "completed" ? "bg-green-500/20 text-green-600" : "bg-amber-500/20 text-amber-600"}>
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "communications" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell className="font-medium">{comm.title}</TableCell>
                      <TableCell>{comm.recipients.toLocaleString()}</TableCell>
                      <TableCell>{comm.sentDate}</TableCell>
                      <TableCell>{comm.openRate}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-600">{comm.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View communication - Feature coming soon")}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Resend - Feature coming soon")}>Resend</Button>
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
