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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
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
  Calendar,
  Eye,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSelectedCompany, CompanySelector } from "@/components/CompanySelector";
import { NewTransactionDialog, TransactionViewDialog } from "@/components/dialogs";
import { ExportButton } from "@/components/ExportButton";
import { formatDate } from "@/lib/formatDate";

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<"transactions" | "corporate_actions" | "rule_144">("transactions");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [showCorporateActionDialog, setShowCorporateActionDialog] = useState(false);
  const [showTransactionViewDialog, setShowTransactionViewDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [corporateActionForm, setCorporateActionForm] = useState({
    type: "dividend_cash" as "dividend_cash" | "dividend_stock" | "split" | "reverse_split" | "merger" | "acquisition" | "spin_off" | "rights_offering" | "tender_offer" | "consolidation" | "name_change" | "symbol_change",
    title: "",
    description: "",
    recordDate: "",
    effectiveDate: "",
  });
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompany();

  // Fetch real data
  const { data: transactions, refetch: refetchTransactions } = trpc.transaction.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const { data: corporateActions, refetch: refetchCorporateActions } = trpc.corporateAction.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const createCorporateAction = trpc.corporateAction.create.useMutation({
    onSuccess: () => {
      toast.success("Corporate action created successfully");
      setShowCorporateActionDialog(false);
      setCorporateActionForm({
        type: "dividend_cash",
        title: "",
        description: "",
        recordDate: "",
        effectiveDate: "",
      });
      refetchCorporateActions();
    },
    onError: (error) => {
      toast.error(`Failed to create corporate action: ${error.message}`);
    },
  });

  const approveTransaction = trpc.transaction.approve.useMutation({
    onSuccess: () => {
      toast.success("Transaction approved successfully");
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(`Failed to approve transaction: ${error.message}`);
    },
  });

  const deleteTransaction = trpc.transaction.delete.useMutation({
    onSuccess: () => {
      toast.success("Transaction deleted successfully");
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(`Failed to delete transaction: ${error.message}`);
    },
  });

  // Export mutation
  const exportTransactions = trpc.export.transactions.useMutation();

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
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case "scheduled":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "announced":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><FileText className="w-3 h-3 mr-1" />Announced</Badge>;
      case "eligible":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Eligible</Badge>;
      case "under_review":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Under Review</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "transfer":
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><ArrowRightLeft className="w-3 h-3 mr-1" />Transfer</Badge>;
      case "issue":
      case "issuance":
        return <Badge variant="outline" className="border-green-500 text-green-600"><TrendingUp className="w-3 h-3 mr-1" />Issuance</Badge>;
      case "redemption":
      case "cancellation":
        return <Badge variant="outline" className="border-red-500 text-red-600"><TrendingDown className="w-3 h-3 mr-1" />Redemption</Badge>;
      case "split":
        return <Badge variant="outline" className="border-cyan-500 text-cyan-600">Stock Split</Badge>;
      case "dividend":
        return <Badge variant="outline" className="border-green-500 text-green-600">Dividend</Badge>;
      case "merger":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Merger</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{type?.replace('_', ' ')}</Badge>;
    }
  };

  const handleNewRecord = () => {
    if (activeTab === "transactions") {
      setShowNewTransactionDialog(true);
    } else if (activeTab === "corporate_actions") {
      setShowCorporateActionDialog(true);
    } else {
      toast.info("Rule 144 request - Feature coming soon");
    }
  };

  const handleViewTransaction = (tx: any) => {
    setSelectedTransaction(tx);
    setShowTransactionViewDialog(true);
  };

  const handleDeleteTransaction = (tx: any) => {
    setTransactionToDelete(tx);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction.mutate({ id: transactionToDelete.id });
    }
  };

  const handleSubmitCorporateAction = () => {
    if (!selectedCompanyId) {
      toast.error("Please select a company first");
      return;
    }
    if (!corporateActionForm.title || !corporateActionForm.recordDate) {
      toast.error("Please fill in required fields");
      return;
    }
    createCorporateAction.mutate({
      companyId: selectedCompanyId,
      ...corporateActionForm,
    });
  };

  const filteredTransactions = transactions?.filter((tx: any) =>
    tx.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.fromShareholderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.toShareholderName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <StockDashboardLayout 
      title="TRANSACTIONS & CORPORATE ACTIONS"
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
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {transactions?.filter((t: any) => t.status === 'pending').length || 0}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {transactions?.filter((t: any) => t.status === 'completed').length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Completed</p>
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
                  <p className="text-2xl font-bold">{corporateActions?.length || 0}</p>
                  <p className="text-sm text-slate-400">Corporate Actions</p>
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
                  <p className="text-2xl font-bold">{transactions?.length || 0}</p>
                  <p className="text-sm text-slate-400">Total Transactions</p>
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
                  <FileText className="w-4 h-4 mr-2" />
                  Corporate Actions
                </Button>
                <Button 
                  variant={activeTab === "rule_144" ? "default" : "outline"}
                  onClick={() => setActiveTab("rule_144")}
                  className={activeTab === "rule_144" ? "bg-[#1e3a5f]" : ""}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Rule 144
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                {activeTab === "transactions" && (
                  <ExportButton
                    label="Export Transactions"
                    disabled={!selectedCompanyId}
                    onExport={async () => exportTransactions.mutateAsync({ companyId: selectedCompanyId! })}
                  />
                )}
                <Button onClick={handleNewRecord} className="bg-[#1e3a5f]">
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
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedCompanyId ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        Select a company to view transactions
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No transactions found. Click "New Transaction" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx: any) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono">{tx.transactionNumber}</TableCell>
                        <TableCell>{getTypeBadge(tx.type)}</TableCell>
                        <TableCell>{tx.fromShareholderName || '-'}</TableCell>
                        <TableCell>{tx.toShareholderName || '-'}</TableCell>
                        <TableCell>{tx.shares?.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(tx.transactionDate)}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewTransaction(tx)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {tx.status === "pending" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600"
                                onClick={() => approveTransaction.mutate({ id: tx.id })}
                              >
                                Approve
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDeleteTransaction(tx)}
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

            {activeTab === "corporate_actions" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Record Date</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedCompanyId ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Select a company to view corporate actions
                      </TableCell>
                    </TableRow>
                  ) : !corporateActions || corporateActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No corporate actions found. Click "New Action" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    corporateActions.map((action: any) => (
                      <TableRow key={action.id}>
                        <TableCell className="font-medium">{action.title}</TableCell>
                        <TableCell>{getTypeBadge(action.type)}</TableCell>
                        <TableCell>{formatDate(action.recordDate)}</TableCell>
                        <TableCell>{formatDate(action.effectiveDate)}</TableCell>
                        <TableCell>{getStatusBadge(action.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toast.info("View action details - Feature coming soon")}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-cyan-600"
                              onClick={() => toast.info("Process action - Feature coming soon")}
                            >
                              Process
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "rule_144" && (
              <div className="p-8 text-center text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Rule 144 Requests</p>
                <p className="text-sm">Track restricted stock sales and compliance with SEC Rule 144</p>
                <Button className="mt-4 bg-[#1e3a5f]" onClick={handleNewRecord}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Rule 144 Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Transaction Dialog */}
      <NewTransactionDialog
        open={showNewTransactionDialog}
        onOpenChange={setShowNewTransactionDialog}
        companyId={selectedCompanyId || 0}
        onSuccess={() => refetchTransactions()}
      />

      {/* Transaction View Dialog */}
      {selectedTransaction && (
        <TransactionViewDialog
          open={showTransactionViewDialog}
          onOpenChange={setShowTransactionViewDialog}
          transaction={selectedTransaction}
          companyId={selectedCompanyId || 0}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete transaction {transactionToDelete?.transactionNumber}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Corporate Action Dialog */}
      <Dialog open={showCorporateActionDialog} onOpenChange={setShowCorporateActionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Corporate Action</DialogTitle>
            <DialogDescription>
              Create a new corporate action for the selected company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select
                value={corporateActionForm.type}
                onValueChange={(value: any) => setCorporateActionForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dividend_cash">Cash Dividend</SelectItem>
                  <SelectItem value="dividend_stock">Stock Dividend</SelectItem>
                  <SelectItem value="split">Stock Split</SelectItem>
                  <SelectItem value="reverse_split">Reverse Split</SelectItem>
                  <SelectItem value="merger">Merger</SelectItem>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                  <SelectItem value="spin_off">Spin-Off</SelectItem>
                  <SelectItem value="rights_offering">Rights Offering</SelectItem>
                  <SelectItem value="tender_offer">Tender Offer</SelectItem>
                  <SelectItem value="consolidation">Consolidation</SelectItem>
                  <SelectItem value="name_change">Name Change</SelectItem>
                  <SelectItem value="symbol_change">Symbol Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={corporateActionForm.title}
                onChange={(e) => setCorporateActionForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Q4 2024 Cash Dividend"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={corporateActionForm.description}
                onChange={(e) => setCorporateActionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Record Date *</Label>
                <Input
                  type="date"
                  value={corporateActionForm.recordDate}
                  onChange={(e) => setCorporateActionForm(prev => ({ ...prev, recordDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={corporateActionForm.effectiveDate}
                  onChange={(e) => setCorporateActionForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorporateActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitCorporateAction}
              disabled={createCorporateAction.isPending}
              className="bg-[#1e3a5f]"
            >
              {createCorporateAction.isPending ? "Creating..." : "Create Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StockDashboardLayout>
  );
}
