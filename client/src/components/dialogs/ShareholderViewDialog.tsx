import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ShareholderViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareholderId: number | null;
  companyId: number;
}

export function ShareholderViewDialog({
  open,
  onOpenChange,
  shareholderId,
  companyId,
}: ShareholderViewDialogProps) {
  // Fetch shareholder details
  const { data: shareholder, isLoading: loadingShareholder } = trpc.shareholder.getById.useQuery(
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

  // Filter data for this shareholder
  const transactions = allTransactions?.filter(
    (t: any) => t.fromShareholderId === shareholderId || t.toShareholderId === shareholderId
  ) || [];
  const certificates = allCertificates?.filter((c: any) => c.shareholderId === shareholderId) || [];

  // Calculate total shares
  const totalShares = (holdings || []).reduce((sum: number, h: any) => sum + (h.shares || 0), 0);

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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5" />
            Shareholder Details
          </DialogTitle>
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

            {/* Tabs for Holdings, Transactions, Certificates */}
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => toast.info("Export shareholder data - Feature coming soon")}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={() => toast.info("Print statement - Feature coming soon")}>
                <Printer className="w-4 h-4 mr-2" />
                Print Statement
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
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
