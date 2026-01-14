import { useState } from "react";
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
  Award, 
  Calendar,
  User,
  Building2,
  FileText,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CertificateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: any;
  companyId: number;
}

export function CertificateViewDialog({
  open,
  onOpenChange,
  certificate,
  companyId,
}: CertificateViewDialogProps) {
  // PDF generation mutation
  const generateCertificatePdf = trpc.pdf.generateCertificate.useMutation({
    onSuccess: (data) => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success("Certificate generated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to generate certificate: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "issued":
        return (
          <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-700 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "transferred":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
            <FileText className="w-3 h-3 mr-1" />
            Transferred
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "lost":
        return (
          <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Lost/Stolen
          </Badge>
        );
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  if (!certificate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Award className="w-5 h-5" />
            Certificate Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Header */}
          <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-lg text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-mono">{certificate.certificateNumber}</h2>
                <p className="text-slate-300">{certificate.shareClassName || 'Common Stock'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(certificate.status)}
                  {certificate.isRestricted && (
                    <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Restricted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{certificate.shares?.toLocaleString()}</p>
              <p className="text-slate-300">Shares</p>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Certificate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Certificate #:</span>
                  <span className="font-mono font-medium">{certificate.certificateNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Share Class:</span>
                  <span className="font-medium">{certificate.shareClassName || 'Common Stock'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-medium">{certificate.issueDate || 'N/A'}</span>
                </div>
                {certificate.cancelDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-slate-500">Cancel Date:</span>
                    <span className="font-medium text-red-600">{certificate.cancelDate}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Shareholder Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Holder:</span>
                  <span className="font-medium">{certificate.shareholderName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Account #:</span>
                  <span className="font-mono font-medium">{certificate.shareholderAccountNumber || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restriction Legend */}
          {certificate.isRestricted && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Restriction Legend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-amber-800">
                  {certificate.restrictionLegend || 
                    'THE SHARES REPRESENTED BY THIS CERTIFICATE HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED, OR APPLICABLE STATE SECURITIES LAWS. THESE SHARES MAY NOT BE SOLD, TRANSFERRED, PLEDGED OR HYPOTHECATED UNLESS REGISTERED UNDER SUCH ACT AND LAWS OR UNLESS AN EXEMPTION FROM REGISTRATION IS AVAILABLE.'}
                </p>
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
                  <span>{certificate.createdAt ? new Date(certificate.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated:</span>
                  <span>{certificate.updatedAt ? new Date(certificate.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (certificate.id) {
                  generateCertificatePdf.mutate({ certificateId: certificate.id });
                }
              }}
              disabled={generateCertificatePdf.isPending || certificate.status === 'cancelled'}
            >
              <Download className="w-4 h-4 mr-2" />
              {generateCertificatePdf.isPending ? "Generating..." : "Download PDF"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (certificate.id) {
                  generateCertificatePdf.mutate({ certificateId: certificate.id });
                }
              }}
              disabled={generateCertificatePdf.isPending || certificate.status === 'cancelled'}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Certificate
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
