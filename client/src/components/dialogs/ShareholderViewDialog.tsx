import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  Wallet,
  FileText,
  ArrowRightLeft,
  Award,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  Edit,
  Save,
  X
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ShareholderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareholderId: number | null;
  companyId: number;
  onUpdate?: () => void;
}

export function ShareholderViewDialog({
  open,
  onOpenChange,
  shareholderId,
  companyId,
  onUpdate,
}: ShareholderViewDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "individual" as "individual" | "joint" | "trust" | "corporation" | "partnership" | "ira" | "custodian",
    email: "",
    phone: "",
    taxId: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    status: "active" as "active" | "inactive" | "suspended" | "deceased" | "escheated",
  });

  // Fetch shareholder details
  const { data: shareholder, isLoading: loadingShareholder, refetch } = trpc.shareholder.getById.useQuery(
    { id: shareholderId! },
    { enabled: !!shareholderId && open }
  );

  // Fetch holdings for this shareholder
  const { data: holdings } = trpc.shareholder.holdings.useQuery(
    { shareholderId: shareholderId! },
    { enabled: !!shareholderId && open }
  );

  // Fetch transactions for this shareholder
  const { data: allTransactions } = trpc.transaction.list.useQuery(
    { companyId },
    { enabled: !!companyId && open }
  );

  // Fetch certificates for this shareholder
  const { data: allCertificates } = trpc.certificate.list.useQuery(
    { companyId },
    { enabled: !!companyId && open }
  );

  // Update mutation
  const updateShareholder = trpc.shareholder.update.useMutation({
    onSuccess: () => {
      toast.success("Shareholder updated successfully");
      setIsEditing(false);
      refetch();
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // PDF generation mutation
  const generateStatement = trpc.pdf.generateShareholderStatement.useMutation({
    onSuccess: (data) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success("Statement generated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to generate statement: ${error.message}`);
    },
  });

  // Initialize edit form when shareholder data loads
  useEffect(() => {
    if (shareholder) {
      setEditForm({
        name: shareholder.name || "",
        type: shareholder.type || "individual",
        email: shareholder.email || "",
        phone: shareholder.phone || "",
        taxId: shareholder.taxId || "",
        address1: shareholder.address1 || "",
        address2: shareholder.address2 || "",
        city: shareholder.city || "",
        state: shareholder.state || "",
        postalCode: shareholder.postalCode || "",
        country: shareholder.country || "USA",
        status: shareholder.status || "active",
      });
    }
  }, [shareholder]);

  // Filter data for this shareholder
  const transactions = allTransactions?.filter(
    (t: any) => t.fromShareholderId === shareholderId || t.toShareholderId === shareholderId
  ) || [];
  const certificates = allCertificates?.filter((c: any) => c.shareholderId === shareholderId) || [];

  // Calculate total shares
  const totalShares = (holdings || []).reduce((sum: number, h: any) => sum + (h.shares || 0), 0);

  const handleSave = () => {
    if (!shareholderId) return;
    
    updateShareholder.mutate({
      id: shareholderId,
      name: editForm.name || undefined,
      type: editForm.type,
      email: editForm.email || null,
      phone: editForm.phone || null,
      taxId: editForm.taxId || null,
      address1: editForm.address1 || null,
      address2: editForm.address2 || null,
      city: editForm.city || null,
      state: editForm.state || null,
      postalCode: editForm.postalCode || null,
      country: editForm.country || undefined,
      status: editForm.status,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (shareholder) {
      setEditForm({
        name: shareholder.name || "",
        type: shareholder.type || "individual",
        email: shareholder.email || "",
        phone: shareholder.phone || "",
        taxId: shareholder.taxId || "",
        address1: shareholder.address1 || "",
        address2: shareholder.address2 || "",
        city: shareholder.city || "",
        state: shareholder.state || "",
        postalCode: shareholder.postalCode || "",
        country: shareholder.country || "USA",
        status: shareholder.status || "active",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
      case "inactive":
        return <Badge className="bg-slate-500/20 text-slate-700 border-slate-500/30">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Suspended</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">Pending</Badge>;
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
      default:
        return <Badge variant="outline" className="capitalize">{type?.replace('_', ' ')}</Badge>;
    }
  };

  if (!shareholderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" />
              Shareholder Details
            </DialogTitle>
            {!isEditing && shareholder && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {loadingShareholder ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        ) : shareholder ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-lg text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  {shareholder.type === 'individual' ? (
                    <User className="w-8 h-8" />
                  ) : (
                    <Building2 className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{shareholder.name}</h2>
                  <p className="text-slate-300 font-mono">{shareholder.accountNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-white/20 text-white capitalize">{shareholder.type}</Badge>
                    {getStatusBadge(shareholder.status || 'active')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{totalShares.toLocaleString()}</p>
                <p className="text-slate-300">Total Shares</p>
              </div>
            </div>

            {/* Edit Mode */}
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Edit Shareholder Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Account Type</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value: any) => setEditForm({ ...editForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="joint">Joint</SelectItem>
                          <SelectItem value="trust">Trust</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="ira">IRA</SelectItem>
                          <SelectItem value="custodian">Custodian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={editForm.taxId}
                        onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      value={editForm.address1}
                      onChange={(e) => setEditForm({ ...editForm, address1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={editForm.address2}
                      onChange={(e) => setEditForm({ ...editForm, address2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={editForm.postalCode}
                        onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateShareholder.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {updateShareholder.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {shareholder.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{shareholder.email}</span>
                        </div>
                      )}
                      {shareholder.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{shareholder.phone}</span>
                        </div>
                      )}
                      {shareholder.address1 && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                          <span>{shareholder.address1}{shareholder.city ? `, ${shareholder.city}` : ''}{shareholder.state ? `, ${shareholder.state}` : ''} {shareholder.postalCode || ''}</span>
                        </div>
                      )}
                      {!shareholder.email && !shareholder.phone && !shareholder.address1 && (
                        <p className="text-sm text-slate-400">No contact information available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {shareholder.taxId && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Tax ID: {shareholder.taxId}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Created: {shareholder.createdAt ? new Date(shareholder.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>Holdings: {(holdings || []).length} position(s)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Tabs for Holdings, Transactions, Certificates */}
            {!isEditing && (
              <Tabs defaultValue="holdings" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="holdings">
                    <Wallet className="w-4 h-4 mr-2" />
                    Holdings ({(holdings || []).length})
                  </TabsTrigger>
                  <TabsTrigger value="transactions">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transactions ({transactions.length})
                  </TabsTrigger>
                  <TabsTrigger value="certificates">
                    <Award className="w-4 h-4 mr-2" />
                    Certificates ({certificates.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="holdings" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Share Class</TableHead>
                            <TableHead className="text-right">Shares</TableHead>
                            <TableHead className="text-right">Cost Basis</TableHead>
                            <TableHead>Acquired Date</TableHead>
                            <TableHead>Restricted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(holdings || []).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                No holdings found for this shareholder
                              </TableCell>
                            </TableRow>
                          ) : (
                            (holdings || []).map((holding: any) => (
                              <TableRow key={holding.id}>
                                <TableCell className="font-medium">{holding.shareClassName || 'Common'}</TableCell>
                                <TableCell className="text-right font-mono">{holding.shares?.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{holding.costBasis ? `$${holding.costBasis}` : '-'}</TableCell>
                                <TableCell>{holding.acquiredDate || '-'}</TableCell>
                                <TableCell>
                                  {holding.isRestricted ? (
                                    <Badge className="bg-amber-500/20 text-amber-700">Restricted</Badge>
                                  ) : (
                                    <Badge variant="outline">Unrestricted</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction #</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Direction</TableHead>
                            <TableHead className="text-right">Shares</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                No transactions found for this shareholder
                              </TableCell>
                            </TableRow>
                          ) : (
                            transactions.map((tx: any) => (
                              <TableRow key={tx.id}>
                                <TableCell className="font-mono">{tx.transactionNumber}</TableCell>
                                <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                <TableCell>
                                  {tx.fromShareholderId === shareholderId ? (
                                    <Badge className="bg-red-500/20 text-red-700">
                                      <TrendingDown className="w-3 h-3 mr-1" />
                                      Outgoing
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-green-500/20 text-green-700">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Incoming
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono">{tx.shares?.toLocaleString()}</TableCell>
                                <TableCell>{tx.transactionDate || '-'}</TableCell>
                                <TableCell>{getStatusBadge(tx.status)}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="certificates" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Certificate #</TableHead>
                            <TableHead>Share Class</TableHead>
                            <TableHead className="text-right">Shares</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {certificates.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                No certificates found for this shareholder
                              </TableCell>
                            </TableRow>
                          ) : (
                            certificates.map((cert: any) => (
                              <TableRow key={cert.id}>
                                <TableCell className="font-mono">{cert.certificateNumber}</TableCell>
                                <TableCell>{cert.shareClassName || 'Common'}</TableCell>
                                <TableCell className="text-right font-mono">{cert.shares?.toLocaleString()}</TableCell>
                                <TableCell>{cert.issueDate || '-'}</TableCell>
                                <TableCell>{getStatusBadge(cert.status)}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => toast.info("Print certificate - Feature coming soon")}
                                  >
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (shareholderId) {
                      generateStatement.mutate({ shareholderId });
                    }
                  }}
                  disabled={generateStatement.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {generateStatement.isPending ? "Generating..." : "Download Statement"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (shareholderId) {
                      generateStatement.mutate({ shareholderId });
                    }
                  }}
                  disabled={generateStatement.isPending}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Statement
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Shareholder not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
