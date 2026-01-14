import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NewShareholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onSuccess?: () => void;
}

export function NewShareholderDialog({ open, onOpenChange, companyId, onSuccess }: NewShareholderDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "individual" as "individual" | "corporation" | "trust" | "partnership" | "joint" | "ira" | "custodian",
    email: "",
    phone: "",
    taxId: "",
    taxIdType: "ssn" as "ssn" | "ein" | "itin" | "foreign",
    address1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    isInsider: false,
    isAffiliate: false,
  });

  const createShareholder = trpc.shareholder.create.useMutation({
    onSuccess: () => {
      toast.success("Shareholder created successfully");
      onOpenChange(false);
      setFormData({
        name: "",
        type: "individual",
        email: "",
        phone: "",
        taxId: "",
        taxIdType: "ssn",
        address1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "USA",
        isInsider: false,
        isAffiliate: false,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create shareholder: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShareholder.mutate({
      companyId,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Shareholder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name / Entity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Account Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: typeof formData.type) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="joint">Joint</SelectItem>
                  <SelectItem value="ira">IRA</SelectItem>
                  <SelectItem value="custodian">Custodian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="XXX-XX-XXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxIdType">Tax ID Type</Label>
              <Select
                value={formData.taxIdType}
                onValueChange={(value: typeof formData.taxIdType) => setFormData({ ...formData, taxIdType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssn">SSN</SelectItem>
                  <SelectItem value="ein">EIN</SelectItem>
                  <SelectItem value="itin">ITIN</SelectItem>
                  <SelectItem value="foreign">Foreign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1">Address</Label>
            <Input
              id="address1"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isInsider}
                onChange={(e) => setFormData({ ...formData, isInsider: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Insider (Section 16)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAffiliate}
                onChange={(e) => setFormData({ ...formData, isAffiliate: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Affiliate (Rule 144)</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createShareholder.isPending}>
              {createShareholder.isPending ? "Creating..." : "Create Shareholder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
