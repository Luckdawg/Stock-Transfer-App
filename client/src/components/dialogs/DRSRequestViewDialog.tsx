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
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar,
  User,
  Building2,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface DRSRequestViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drsRequest: any;
  companyId: number;
}

export function DRSRequestViewDialog({
  open,
  onOpenChange,
  drsRequest,
  companyId,
}: DRSRequestViewDialogProps) {
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
      case "processing":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "rejected":
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            {status === 'rejected' ? 'Rejected' : 'Failed'}
          </Badge>
        );
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "dwac_deposit":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            DWAC Deposit
          </Badge>
        );
      case "dwac_withdrawal":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            DWAC Withdrawal
          </Badge>
        );
      case "drs_in":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            DRS In
          </Badge>
        );
      case "drs_out":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-600">
            DRS Out
          </Badge>
        );
      default:
        return <Badge variant="outline" className="capitalize">{type?.replace('_', ' ')}</Badge>;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case "pending": return 25;
      case "processing": return 60;
      case "completed": return 100;
      case "rejected":
      case "failed": return 100;
      default: return 0;
    }
  };

  if (!drsRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            DRS/DWAC Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Header */}
          <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-lg text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono">{drsRequest.requestNumber || `DRS-${drsRequest.id}`}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getTypeBadge(drsRequest.type)}
                  {getStatusBadge(drsRequest.status)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{drsRequest.shares?.toLocaleString()}</p>
              <p className="text-slate-300">Shares</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Processing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={getProgressValue(drsRequest.status)} className="h-2" />
              <div className="flex justify-between text-xs text-slate-500">
                <span className={drsRequest.status !== 'pending' ? 'text-green-600 font-medium' : ''}>
                  Submitted
                </span>
                <span className={['processing', 'completed'].includes(drsRequest.status) ? 'text-green-600 font-medium' : ''}>
                  Processing
                </span>
                <span className={drsRequest.status === 'completed' ? 'text-green-600 font-medium' : ''}>
                  Completed
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Request #:</span>
                  <span className="font-mono font-medium">{drsRequest.requestNumber || `DRS-${drsRequest.id}`}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Request Date:</span>
                  <span className="font-medium">{drsRequest.requestDate || 'N/A'}</span>
                </div>
                {drsRequest.dtcNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">DTC #:</span>
                    <span className="font-mono font-medium">{drsRequest.dtcNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Broker Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {drsRequest.brokerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Broker:</span>
                    <span className="font-medium">{drsRequest.brokerName}</span>
                  </div>
                )}
                {drsRequest.brokerAccountNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Account #:</span>
                    <span className="font-mono font-medium">{drsRequest.brokerAccountNumber}</span>
                  </div>
                )}
                {drsRequest.participantNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Participant #:</span>
                    <span className="font-mono font-medium">{drsRequest.participantNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shareholder Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Shareholder Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium">{drsRequest.shareholderName || 'N/A'}</p>
                  <p className="text-sm text-slate-500 font-mono">{drsRequest.shareholderAccountNumber || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Flow */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Transfer Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg flex-1">
                  <p className="text-xs text-slate-500 mb-1">From</p>
                  <p className="font-medium">
                    {drsRequest.type?.includes('deposit') || drsRequest.type === 'drs_in' 
                      ? (drsRequest.brokerName || 'Broker') 
                      : 'Transfer Agent'}
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400" />
                <div className="text-center p-4 bg-slate-50 rounded-lg flex-1">
                  <p className="text-xs text-slate-500 mb-1">To</p>
                  <p className="font-medium">
                    {drsRequest.type?.includes('withdrawal') || drsRequest.type === 'drs_out' 
                      ? (drsRequest.brokerName || 'Broker') 
                      : 'Transfer Agent'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {drsRequest.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{drsRequest.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Rejection Reason */}
          {(drsRequest.status === 'rejected' || drsRequest.status === 'failed') && drsRequest.rejectionReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Rejection Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800">{drsRequest.rejectionReason}</p>
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
                  <span>{drsRequest.createdAt ? new Date(drsRequest.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated:</span>
                  <span>{drsRequest.updatedAt ? new Date(drsRequest.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
                {drsRequest.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed:</span>
                    <span>{drsRequest.completedDate}</span>
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
