import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onSuccess?: () => void;
}

const transactionTypes = [
  { value: "issuance", label: "Issuance" },
  { value: "transfer", label: "Transfer" },
  { value: "cancellation", label: "Cancellation" },
  { value: "split", label: "Stock Split" },
  { value: "reverse_split", label: "Reverse Split" },
  { value: "dividend", label: "Dividend" },
  { value: "conversion", label: "Conversion" },
  { value: "redemption", label: "Redemption" },
  { value: "repurchase", label: "Repurchase" },
  { value: "gift", label: "Gift" },
  { value: "inheritance", label: "Inheritance" },
  { value: "dtc_deposit", label: "DTC Deposit" },
  { value: "dtc_withdrawal", label: "DTC Withdrawal" },
  { value: "drs_transfer", label: "DRS Transfer" },
];

export function NewTransactionDialog({ open, onOpenChange, companyId, onSuccess }: NewTransactionDialogProps) {
  const [formData, setFormData] = useState({
    type: "transfer" as string,
    shareClassId: 0,
    fromShareholderId: undefined as number | undefined,
    toShareholderId: undefined as number | undefined,
    shares: 0,
    pricePerShare: "",
    notes: "",
  });

  const { data: shareClasses } = trpc.capTable.shareClasses.useQuery({ companyId });
  const { data: shareholdersList } = trpc.shareholder.list.useQuery({ companyId });

  const createTransaction = trpc.transaction.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction created successfully");
      onOpenChange(false);
      setFormData({
        type: "transfer",
        shareClassId: 0,
        fromShareholderId: undefined,
        toShareholderId: undefined,
        shares: 0,
        pricePerShare: "",
        notes: "",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shareClassId) {
      toast.error("Please select a share class");
      return;
    }
    createTransaction.mutate({
      companyId,
      type: formData.type as any,
      shareClassId: formData.shareClassId,
      fromShareholderId: formData.fromShareholderId,
      toShareholderId: formData.toShareholderId,
      shares: formData.shares,
      pricePerShare: formData.pricePerShare || undefined,
      notes: formData.notes || undefined,
    });
  };

  const needsFromShareholder = ["transfer", "cancellation", "redemption", "repurchase", "gift", "inheritance", "dtc_deposit", "drs_transfer"].includes(formData.type);
  const needsToShareholder = ["issuance", "transfer", "gift", "inheritance", "dtc_withdrawal", "drs_transfer"].includes(formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
          </div>

          {needsFromShareholder && (
            <div className="space-y-2">
              <Label htmlFor="fromShareholder">From Shareholder</Label>
              <Select
                value={formData.fromShareholderId?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, fromShareholderId: value ? parseInt(value) : undefined })}
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
          )}

          {needsToShareholder && (
            <div className="space-y-2">
              <Label htmlFor="toShareholder">To Shareholder</Label>
              <Select
                value={formData.toShareholderId?.toString() || ""}
                onValueChange={(value) => setFormData({ ...formData, toShareholderId: value ? parseInt(value) : undefined })}
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
          )}

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="pricePerShare">Price Per Share</Label>
              <Input
                id="pricePerShare"
                type="number"
                step="0.0001"
                value={formData.pricePerShare}
                onChange={(e) => setFormData({ ...formData, pricePerShare: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional transaction details..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Creating..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
