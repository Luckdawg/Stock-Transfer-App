import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NewCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onSuccess?: () => void;
}

export function NewCertificateDialog({ open, onOpenChange, companyId, onSuccess }: NewCertificateDialogProps) {
  const [formData, setFormData] = useState({
    shareholderId: 0,
    shareClassId: 0,
    shares: 0,
    issueDate: new Date().toISOString().split('T')[0],
  });

  const { data: shareClasses } = trpc.capTable.shareClasses.useQuery({ companyId });
  const { data: shareholdersList } = trpc.shareholder.list.useQuery({ companyId });

  const issueCertificate = trpc.certificate.issue.useMutation({
    onSuccess: () => {
      toast.success("Certificate issued successfully");
      onOpenChange(false);
      setFormData({
        shareholderId: 0,
        shareClassId: 0,
        shares: 0,
        issueDate: new Date().toISOString().split('T')[0],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to issue certificate: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shareholderId || !formData.shareClassId) {
      toast.error("Please select shareholder and share class");
      return;
    }
    issueCertificate.mutate({
      shareholderId: formData.shareholderId,
      shareClassId: formData.shareClassId,
      shares: formData.shares,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Issue New Certificate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareholder">Shareholder *</Label>
            <Select
              value={formData.shareholderId.toString()}
              onValueChange={(value) => setFormData({ ...formData, shareholderId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shareholder" />
              </SelectTrigger>
              <SelectContent>
                {shareholdersList?.map((sh: any) => (
                  <SelectItem key={sh.id} value={sh.id.toString()}>
                    {sh.name} ({sh.accountNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shareClass">Share Class *</Label>
            <Select
              value={formData.shareClassId.toString()}
              onValueChange={(value) => setFormData({ ...formData, shareClassId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select share class" />
              </SelectTrigger>
              <SelectContent>
                {shareClasses?.map((sc: any) => (
                  <SelectItem key={sc.id} value={sc.id.toString()}>
                    {sc.name} ({sc.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares *</Label>
            <Input
              id="shares"
              type="number"
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) || 0 })}
              required
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={issueCertificate.isPending}>
              {issueCertificate.isPending ? "Issuing..." : "Issue Certificate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
