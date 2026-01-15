import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Eye,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSelectedCompany, CompanySelector } from "@/components/CompanySelector";
import { 
  NewShareholderDialog, 
  NewCertificateDialog, 
  ShareholderViewDialog,
  CertificateViewDialog,
  DRSRequestViewDialog
} from "@/components/dialogs";
import { BulkActionToolbar } from "@/components/BulkActionToolbar";
import { MultiExportButton } from "@/components/ExportButton";

export default function Recordkeeping() {
  const [activeTab, setActiveTab] = useState<"certificates" | "book_entry" | "drs">("certificates");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewShareholderDialog, setShowNewShareholderDialog] = useState(false);
  const [showNewCertificateDialog, setShowNewCertificateDialog] = useState(false);
  const [showShareholderViewDialog, setShowShareholderViewDialog] = useState(false);
  const [showCertificateViewDialog, setShowCertificateViewDialog] = useState(false);
  const [showDRSViewDialog, setShowDRSViewDialog] = useState(false);
  const [selectedShareholderId, setSelectedShareholderId] = useState<number | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [selectedDRSRequest, setSelectedDRSRequest] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareholderToDelete, setShareholderToDelete] = useState<any>(null);
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompany();
  
  // Bulk selection state
  const [selectedCertificateIds, setSelectedCertificateIds] = useState<number[]>([]);
  const [selectedDRSIds, setSelectedDRSIds] = useState<number[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Fetch real data
  const { data: shareholders, refetch: refetchShareholders } = trpc.shareholder.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const { data: certificates, refetch: refetchCertificates } = trpc.certificate.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const { data: dtcRequests, refetch: refetchDtc } = trpc.dtc.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const deleteShareholder = trpc.shareholder.delete.useMutation({
    onSuccess: () => {
      toast.success("Shareholder deleted successfully");
      setShowDeleteConfirm(false);
      setShareholderToDelete(null);
      refetchShareholders();
    },
    onError: (error) => {
      toast.error(`Failed to delete shareholder: ${error.message}`);
    },
  });

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

  // Bulk operations mutations
  const bulkCancelCertificates = trpc.certificate.bulkCancel.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} certificates cancelled`);
      setSelectedCertificateIds([]);
      refetchCertificates();
    },
    onError: (error) => {
      toast.error(`Failed to cancel certificates: ${error.message}`);
    },
  });

  const bulkUpdateDRSStatus = trpc.dtc.bulkUpdateStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} DRS requests updated`);
      setSelectedDRSIds([]);
      refetchDtc();
    },
    onError: (error) => {
      toast.error(`Failed to update DRS requests: ${error.message}`);
    },
  });

  // Export mutations
  const exportShareholders = trpc.export.shareholders.useMutation();
  const exportCertificates = trpc.export.certificates.useMutation();
  const exportHoldings = trpc.export.holdings.useMutation();

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

  const filteredDRSRequests = dtcRequests?.filter((req: any) =>
    req.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteShareholder = (shareholder: any) => {
    setShareholderToDelete(shareholder);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteShareholder = () => {
    if (shareholderToDelete) {
      deleteShareholder.mutate({ id: shareholderToDelete.id });
    }
  };

  const handleViewCertificate = (certificate: any) => {
    setSelectedCertificate(certificate);
    setShowCertificateViewDialog(true);
  };

  const handleViewDRSRequest = (drsRequest: any) => {
    setSelectedDRSRequest(drsRequest);
    setShowDRSViewDialog(true);
  };

  // Bulk selection handlers
  const handleCertificateSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedCertificateIds([...selectedCertificateIds, id]);
    } else {
      setSelectedCertificateIds(selectedCertificateIds.filter(i => i !== id));
    }
  };

  const handleSelectAllCertificates = (checked: boolean) => {
    if (checked) {
      const activeIds = filteredCertificates
        .filter((c: any) => c.status === 'active')
        .map((c: any) => c.id);
      setSelectedCertificateIds(activeIds);
    } else {
      setSelectedCertificateIds([]);
    }
  };

  const handleDRSSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedDRSIds([...selectedDRSIds, id]);
    } else {
      setSelectedDRSIds(selectedDRSIds.filter(i => i !== id));
    }
  };

  const handleSelectAllDRS = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredDRSRequests
        .filter((r: any) => r.status === 'pending' || r.status === 'processing')
        .map((r: any) => r.id);
      setSelectedDRSIds(pendingIds);
    } else {
      setSelectedDRSIds([]);
    }
  };

  const handleBulkCancelCertificates = async () => {
    setIsBulkLoading(true);
    try {
      await bulkCancelCertificates.mutateAsync({ ids: selectedCertificateIds });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkUpdateDRSStatus = async (status: string) => {
    setIsBulkLoading(true);
    try {
      await bulkUpdateDRSStatus.mutateAsync({ 
        ids: selectedDRSIds, 
        status: status as "pending" | "processing" | "completed" | "rejected"
      });
    } finally {
      setIsBulkLoading(false);
    }
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
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {certificates?.filter((c: any) => c.status === 'lost' || c.status === 'stolen').length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Lost/Stolen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dtcRequests?.filter((r: any) => r.status === 'pending').length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Pending DRS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Button
                  variant={activeTab === "certificates" ? "default" : "ghost"}
                  onClick={() => { setActiveTab("certificates"); setSelectedCertificateIds([]); }}
                  className={activeTab === "certificates" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Certificates
                </Button>
                <Button
                  variant={activeTab === "book_entry" ? "default" : "ghost"}
                  onClick={() => setActiveTab("book_entry")}
                  className={activeTab === "book_entry" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Book Entry
                </Button>
                <Button
                  variant={activeTab === "drs" ? "default" : "ghost"}
                  onClick={() => { setActiveTab("drs"); setSelectedDRSIds([]); }}
                  className={activeTab === "drs" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
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
                <Button variant="outline" onClick={() => toast.info("Filter feature coming soon")}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <MultiExportButton
                  disabled={!selectedCompanyId}
                  exports={[
                    {
                      label: "Export Shareholders",
                      onExport: async () => exportShareholders.mutateAsync({ companyId: selectedCompanyId! }),
                    },
                    {
                      label: "Export Certificates",
                      onExport: async () => exportCertificates.mutateAsync({ companyId: selectedCompanyId! }),
                    },
                    {
                      label: "Export Holdings",
                      onExport: async () => exportHoldings.mutateAsync({ companyId: selectedCompanyId! }),
                    },
                  ]}
                />
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCertificateIds.length > 0 && 
                          selectedCertificateIds.length === filteredCertificates.filter((c: any) => c.status === 'active').length}
                        onCheckedChange={handleSelectAllCertificates}
                      />
                    </TableHead>
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
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        Select a company to view certificates
                      </TableCell>
                    </TableRow>
                  ) : filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No certificates found. Click "New Record" to issue a certificate.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertificates.map((cert: any) => (
                      <TableRow key={cert.id} className={selectedCertificateIds.includes(cert.id) ? "bg-cyan-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCertificateIds.includes(cert.id)}
                            onCheckedChange={(checked) => handleCertificateSelect(cert.id, checked as boolean)}
                            disabled={cert.status !== 'active'}
                          />
                        </TableCell>
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
                              onClick={() => handleViewCertificate(cert)}
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
                        <TableCell className="capitalize">{sh.type}</TableCell>
                        <TableCell>{sh.email || '-'}</TableCell>
                        <TableCell>{getStatusBadge(sh.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewShareholder(sh.id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteShareholder(sh)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDRSIds.length > 0 && 
                          selectedDRSIds.length === filteredDRSRequests.filter((r: any) => r.status === 'pending' || r.status === 'processing').length}
                        onCheckedChange={handleSelectAllDRS}
                      />
                    </TableHead>
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>DTC Participant</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedCompanyId ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        Select a company to view DRS requests
                      </TableCell>
                    </TableRow>
                  ) : filteredDRSRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No DRS requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDRSRequests.map((req: any) => (
                      <TableRow key={req.id} className={selectedDRSIds.includes(req.id) ? "bg-cyan-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDRSIds.includes(req.id)}
                            onCheckedChange={(checked) => handleDRSSelect(req.id, checked as boolean)}
                            disabled={req.status === 'completed' || req.status === 'rejected'}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{req.requestNumber}</TableCell>
                        <TableCell className="capitalize">{req.type?.replace('_', ' ')}</TableCell>
                        <TableCell>{req.dtcParticipantNumber}</TableCell>
                        <TableCell>{req.brokerName || '-'}</TableCell>
                        <TableCell>{req.shares?.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDRSRequest(req)}
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
          </CardContent>
        </Card>
      </div>

      {/* Bulk Action Toolbars */}
      {activeTab === "certificates" && (
        <BulkActionToolbar
          selectedCount={selectedCertificateIds.length}
          onClearSelection={() => setSelectedCertificateIds([])}
          onCancel={handleBulkCancelCertificates}
          entityType="certificate"
          isLoading={isBulkLoading}
        />
      )}

      {activeTab === "drs" && (
        <BulkActionToolbar
          selectedCount={selectedDRSIds.length}
          onClearSelection={() => setSelectedDRSIds([])}
          onUpdateStatus={handleBulkUpdateDRSStatus}
          entityType="drs"
          isLoading={isBulkLoading}
        />
      )}

      {/* Dialogs */}
      <NewShareholderDialog
        open={showNewShareholderDialog}
        onOpenChange={setShowNewShareholderDialog}
        companyId={selectedCompanyId!}
        onSuccess={() => {
          refetchShareholders();
          setShowNewShareholderDialog(false);
        }}
      />

      <NewCertificateDialog
        open={showNewCertificateDialog}
        onOpenChange={setShowNewCertificateDialog}
        companyId={selectedCompanyId!}
        onSuccess={() => {
          refetchCertificates();
          setShowNewCertificateDialog(false);
        }}
      />

      <ShareholderViewDialog
        open={showShareholderViewDialog}
        onOpenChange={setShowShareholderViewDialog}
        shareholderId={selectedShareholderId}
        companyId={selectedCompanyId!}
        onUpdate={() => refetchShareholders()}
      />

      <CertificateViewDialog
        open={showCertificateViewDialog}
        onOpenChange={setShowCertificateViewDialog}
        certificate={selectedCertificate}
        companyId={selectedCompanyId!}
      />

      <DRSRequestViewDialog
        open={showDRSViewDialog}
        onOpenChange={setShowDRSViewDialog}
        drsRequest={selectedDRSRequest}
        companyId={selectedCompanyId!}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shareholder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {shareholderToDelete?.name}? 
              This action cannot be undone. Note: Shareholders with active holdings cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteShareholder}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StockDashboardLayout>
  );
}
