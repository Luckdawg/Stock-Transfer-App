import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRightLeft, 
  Calendar,
  User,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Hash
} from "lucide-react";

interface TransactionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  companyId: number;
}

export function TransactionViewDialog({
  open,
  onOpenChange,
  transaction,
  companyId,
}: TransactionViewDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {status === 'cancelled' ? 'Cancelled' : 'Rejected'}
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "transfer":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <ArrowRightLeft className="w-3 h-3 mr-1" />
            Transfer
          </Badge>
        );
      case "issue":
      case "issuance":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            Issuance
          </Badge>
        );
      case "redemption":
      case "cancellation":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            <TrendingDown className="w-3 h-3 mr-1" />
            Redemption
          </Badge>
        );
      case "gift":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-600">
            <FileText className="w-3 h-3 mr-1" />
            Gift
          </Badge>
        );
      case "inheritance":
        return (
          <Badge variant="outline" className="border-indigo-500 text-indigo-600">
            <FileText className="w-3 h-3 mr-1" />
            Inheritance
          </Badge>
        );
      default:
        return <Badge variant="outline" className="capitalize">{type?.replace('_', ' ')}</Badge>;
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowRightLeft className="w-5 h-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Header */}
          <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-lg text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono">{transaction.transactionNumber}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getTypeBadge(transaction.type)}
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{transaction.shares?.toLocaleString()}</p>
              <p className="text-slate-300">Shares</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Transaction Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Transaction #:</span>
                  <span className="font-mono font-medium">{transaction.transactionNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium">{transaction.transactionDate || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Share Class:</span>
                  <span className="font-medium">{transaction.shareClassName || 'Common Stock'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Price/Share:</span>
                  <span className="font-medium">{transaction.pricePerShare ? `$${transaction.pricePerShare}` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Total Value:</span>
                  <span className="font-medium">{transaction.totalValue ? `$${transaction.totalValue}` : 'N/A'}</span>
                </div>
                {transaction.settlementDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Settlement:</span>
                    <span className="font-medium">{transaction.settlementDate}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Parties Involved */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Parties Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    From (Seller/Transferor)
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium">{transaction.fromShareholderName || 'Treasury / New Issuance'}</p>
                    {transaction.fromShareholderAccountNumber && (
                      <p className="text-xs text-slate-500 font-mono">{transaction.fromShareholderAccountNumber}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    To (Buyer/Transferee)
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium">{transaction.toShareholderName || 'Treasury / Redemption'}</p>
                    {transaction.toShareholderAccountNumber && (
                      <p className="text-xs text-slate-500 font-mono">{transaction.toShareholderAccountNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {transaction.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{transaction.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated:</span>
                  <span>{transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
                {transaction.approvedBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approved By:</span>
                    <span>{transaction.approvedBy}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              Print Details
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
