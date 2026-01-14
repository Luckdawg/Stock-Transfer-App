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
  FileText, 
  Search, 
  Plus, 
  Download, 
  Filter,
  BookOpen,
  Award,
  AlertTriangle,
  RefreshCw,
  Printer,
  Eye
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSelectedCompany, CompanySelector } from "@/components/CompanySelector";
import { NewShareholderDialog, NewCertificateDialog, ShareholderViewDialog } from "@/components/dialogs";

export default function Recordkeeping() {
  const [activeTab, setActiveTab] = useState<"certificates" | "book_entry" | "drs">("certificates");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewShareholderDialog, setShowNewShareholderDialog] = useState(false);
  const [showNewCertificateDialog, setShowNewCertificateDialog] = useState(false);
  const [showShareholderViewDialog, setShowShareholderViewDialog] = useState(false);
  const [selectedShareholderId, setSelectedShareholderId] = useState<number | null>(null);
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompany();

  // Fetch real data
  const { data: shareholders, refetch: refetchShareholders } = trpc.shareholder.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const { data: certificates, refetch: refetchCertificates } = trpc.certificate.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const { data: dtcRequests } = trpc.dtc.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const generateCertificatePdf = trpc.pdf.generateCertificate.useMutation({
    onSuccess: (data) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success(`Certificate ${data.certificateNumber} generated`);
    },
    onError: (error) => {
      toast.error(`Failed to generate certificate: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
      case "lost":
      case "stolen":
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">{status}</Badge>;
      case "transferred":
      case "cancelled":
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">{status}</Badge>;
      case "processing":
        return <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">Processing</Badge>;
      case "pending":
        return <Badge className="bg-slate-500/20 text-slate-700 border-slate-500/30">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Completed</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const filteredShareholders = shareholders?.filter((sh: any) =>
    sh.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sh.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCertificates = certificates?.filter((cert: any) =>
    cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.shareholderName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleNewRecord = () => {
    if (activeTab === "certificates") {
      setShowNewCertificateDialog(true);
    } else if (activeTab === "book_entry") {
      setShowNewShareholderDialog(true);
    } else {
      toast.info("New DRS request - Feature coming soon");
    }
  };

  const handleViewShareholder = (shareholderId: number) => {
    setSelectedShareholderId(shareholderId);
    setShowShareholderViewDialog(true);
  };

  return (
    <StockDashboardLayout 
      title="RECORDKEEPING – ELECTRONIC BOOK-ENTRY SYSTEM"
      companySelector={
        <CompanySelector 
          value={selectedCompanyId} 
          onChange={setSelectedCompanyId}
          className="w-64"
        />
      }
    >
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
                  <p className="text-2xl font-bold">{shareholders?.length || 0}</p>
                  <p className="text-sm text-slate-400">Shareholder Accounts</p>
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
                  <p className="text-2xl font-bold">
                    {certificates?.filter((c: any) => c.status === 'active').length || 0}
                  </p>
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
                  <p className="text-2xl font-bold">{dtcRequests?.length || 0}</p>
                  <p className="text-sm text-slate-400">DRS/DTC Requests</p>
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
                  <p className="text-2xl font-bold">
                    {certificates?.filter((c: any) => c.status === 'lost' || c.status === 'stolen').length || 0}
                  </p>
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
                  Shareholders
                </Button>
                <Button 
                  variant={activeTab === "drs" ? "default" : "outline"}
                  onClick={() => setActiveTab("drs")}
                  className={activeTab === "drs" ? "bg-[#1e3a5f]" : ""}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  DRS/DTC Requests
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
                <Button variant="outline" onClick={() => toast.info("Filter feature coming soon")}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleNewRecord}>
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
                  {!selectedCompanyId ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        Select a company to view certificates
                      </TableCell>
                    </TableRow>
                  ) : filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No certificates found. Click "New Record" to issue a certificate.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertificates.map((cert: any) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono">{cert.certificateNumber}</TableCell>
                        <TableCell className="font-medium">{cert.shareholderName}</TableCell>
                        <TableCell>{cert.shares?.toLocaleString()}</TableCell>
                        <TableCell>{cert.shareClassName || 'Common'}</TableCell>
                        <TableCell>{cert.issueDate || '-'}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (cert.shareholderId) {
                                  handleViewShareholder(cert.shareholderId);
                                } else {
                                  toast.info("View certificate details - Feature coming soon");
                                }
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => generateCertificatePdf.mutate({ certificateId: cert.id })}
                              disabled={generateCertificatePdf.isPending}
                            >
                              <Printer className="w-4 h-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "book_entry" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedCompanyId ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Select a company to view shareholders
                      </TableCell>
                    </TableRow>
                  ) : filteredShareholders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No shareholders found. Click "New Record" to add a shareholder.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredShareholders.map((sh: any) => (
                      <TableRow key={sh.id}>
                        <TableCell className="font-mono">{sh.accountNumber}</TableCell>
                        <TableCell className="font-medium">{sh.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{sh.type}</Badge>
                        </TableCell>
                        <TableCell>{sh.email || '-'}</TableCell>
                        <TableCell>{getStatusBadge(sh.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewShareholder(sh.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "drs" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedCompanyId ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        Select a company to view DRS/DTC requests
                      </TableCell>
                    </TableRow>
                  ) : !dtcRequests || dtcRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No DRS/DTC requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    dtcRequests.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono">{req.requestNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{req.type}</Badge>
                        </TableCell>
                        <TableCell>{req.shares?.toLocaleString()}</TableCell>
                        <TableCell>{req.brokerName || '-'}</TableCell>
                        <TableCell>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toast.info("View request details - Feature coming soon")}
                            >
                              View
                            </Button>
                            {req.status === "pending" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600"
                                onClick={() => toast.info("Process request - Feature coming soon")}
                              >
                                Process
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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

      {/* Dialogs */}
      {selectedCompanyId && (
        <>
          <NewShareholderDialog
            open={showNewShareholderDialog}
            onOpenChange={setShowNewShareholderDialog}
            companyId={selectedCompanyId}
            onSuccess={() => refetchShareholders()}
          />
          <NewCertificateDialog
            open={showNewCertificateDialog}
            onOpenChange={setShowNewCertificateDialog}
            companyId={selectedCompanyId}
            onSuccess={() => refetchCertificates()}
          />
          <ShareholderViewDialog
            open={showShareholderViewDialog}
            onOpenChange={setShowShareholderViewDialog}
            shareholderId={selectedShareholderId}
            companyId={selectedCompanyId}
          />
        </>
      )}
    </StockDashboardLayout>
  );
}
