import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Search, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Financial Services", "Manufacturing", "Retail",
  "Energy", "Real Estate", "Telecommunications", "Consumer Goods", "Transportation",
  "Media & Entertainment", "Pharmaceuticals", "Biotechnology", "Aerospace & Defense",
  "Agriculture", "Construction", "Education", "Hospitality", "Mining", "Utilities"
];

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: "",
    ticker: "",
    cik: "",
    ein: "",
    incorporationState: "",
    incorporationDate: "",
    fiscalYearEnd: "",
    industry: "",
    sector: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    phone: "",
    email: "",
    website: "",
    description: "",
  });

  const { data: companies, refetch } = trpc.company.list.useQuery();
  
  const createCompany = trpc.company.create.useMutation({
    onSuccess: () => {
      toast.success("Company created successfully");
      setShowNewCompanyDialog(false);
      setNewCompanyForm({
        name: "", ticker: "", cik: "", ein: "", incorporationState: "",
        incorporationDate: "", fiscalYearEnd: "", industry: "", sector: "",
        address1: "", address2: "", city: "", state: "", postalCode: "",
        country: "USA", phone: "", email: "", website: "", description: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create company: ${error.message}`);
    },
  });

  const updateCompany = trpc.company.update.useMutation({
    onSuccess: () => {
      toast.success("Company updated successfully");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update company: ${error.message}`);
    },
  });

  const deleteCompany = trpc.company.delete.useMutation({
    onSuccess: () => {
      toast.success("Company deleted successfully");
      setShowDeleteConfirm(false);
      setShowViewDialog(false);
      setSelectedCompany(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete company: ${error.message}`);
    },
  });

  const handleViewCompany = (company: any) => {
    setSelectedCompany(company);
    setEditForm({ ...company });
    setIsEditing(false);
    setShowViewDialog(true);
  };

  const handleEditCompany = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedCompany) return;
    updateCompany.mutate({
      id: selectedCompany.id,
      ...editForm,
    });
  };

  const handleCancelEdit = () => {
    setEditForm({ ...selectedCompany });
    setIsEditing(false);
  };

  const handleDeleteCompany = () => {
    if (!selectedCompany) return;
    deleteCompany.mutate({ id: selectedCompany.id });
  };

  const handleCreateCompany = () => {
    if (!newCompanyForm.name) {
      toast.error("Company name is required");
      return;
    }
    createCompany.mutate(newCompanyForm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Active</Badge>;
      case "inactive":
        return <Badge className="bg-slate-500/20 text-slate-600 border-slate-500/30">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCompanies = companies?.filter((company: any) =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <StockDashboardLayout title="COMPANY MANAGEMENT">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{companies?.length || 0}</p>
                  <p className="text-sm text-slate-400">Total Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {companies?.filter((c: any) => c.status === 'active').length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {companies?.filter((c: any) => c.ticker).length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Public (with Ticker)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {companies?.filter((c: any) => !c.ticker).length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Private</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Companies
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button onClick={() => setShowNewCompanyDialog(true)} className="bg-[#1e3a5f]">
                  <Plus className="w-4 h-4 mr-2" />
                  New Company
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No companies found. Click "New Company" to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company: any) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="font-mono">{company.ticker || '-'}</TableCell>
                      <TableCell>{company.industry || '-'}</TableCell>
                      <TableCell>{company.incorporationState || '-'}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewCompany(company)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowDeleteConfirm(true);
                            }}
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
          </CardContent>
        </Card>
      </div>

      {/* New Company Dialog */}
      <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Add New Company
            </DialogTitle>
            <DialogDescription>
              Enter the company details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={newCompanyForm.name}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="ticker">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    value={newCompanyForm.ticker}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, ticker: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="cik">CIK Number</Label>
                  <Input
                    id="cik"
                    value={newCompanyForm.cik}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, cik: e.target.value })}
                    placeholder="SEC CIK number"
                  />
                </div>
                <div>
                  <Label htmlFor="ein">EIN</Label>
                  <Input
                    id="ein"
                    value={newCompanyForm.ein}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, ein: e.target.value })}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="incorporationState">Incorporation State</Label>
                  <Select
                    value={newCompanyForm.incorporationState}
                    onValueChange={(value) => setNewCompanyForm({ ...newCompanyForm, incorporationState: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="incorporationDate">Incorporation Date</Label>
                  <Input
                    id="incorporationDate"
                    type="date"
                    value={newCompanyForm.incorporationDate}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, incorporationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                  <Input
                    id="fiscalYearEnd"
                    value={newCompanyForm.fiscalYearEnd}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, fiscalYearEnd: e.target.value })}
                    placeholder="e.g., 12/31"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={newCompanyForm.address1}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, address1: e.target.value })}
                    placeholder="Street address"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    value={newCompanyForm.address2}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, address2: e.target.value })}
                    placeholder="Suite, floor, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newCompanyForm.city}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={newCompanyForm.state}
                    onValueChange={(value) => setNewCompanyForm({ ...newCompanyForm, state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={newCompanyForm.postalCode}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, postalCode: e.target.value })}
                    placeholder="ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newCompanyForm.country}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCompanyForm.phone}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCompanyForm.email}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={newCompanyForm.website}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={newCompanyForm.industry}
                    onValueChange={(value) => setNewCompanyForm({ ...newCompanyForm, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={newCompanyForm.sector}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, sector: e.target.value })}
                    placeholder="e.g., Software"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCompanyForm.description}
                    onChange={(e) => setNewCompanyForm({ ...newCompanyForm, description: e.target.value })}
                    placeholder="Brief description of the company..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCompanyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCompany} 
              className="bg-[#1e3a5f]"
              disabled={createCompany.isPending}
            >
              {createCompany.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Company
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Company Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {isEditing ? "Edit Company" : "Company Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCompany && (
            <div className="space-y-6">
              {/* Company Header */}
              <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-lg text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    {isEditing ? (
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-xl font-bold bg-white/10 border-white/30 text-white"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {selectedCompany.ticker && (
                        <Badge className="bg-white/20 text-white border-white/30">
                          {selectedCompany.ticker}
                        </Badge>
                      )}
                      {getStatusBadge(selectedCompany.status)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600" disabled={updateCompany.isPending}>
                        {updateCompany.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleEditCompany} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Corporate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">CIK:</span>
                      {isEditing ? (
                        <Input
                          value={editForm.cik || ""}
                          onChange={(e) => setEditForm({ ...editForm, cik: e.target.value })}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span className="font-medium">{selectedCompany.cik || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">EIN:</span>
                      {isEditing ? (
                        <Input
                          value={editForm.ein || ""}
                          onChange={(e) => setEditForm({ ...editForm, ein: e.target.value })}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span className="font-medium">{selectedCompany.ein || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Inc. State:</span>
                      {isEditing ? (
                        <Select
                          value={editForm.incorporationState || ""}
                          onValueChange={(value) => setEditForm({ ...editForm, incorporationState: value })}
                        >
                          <SelectTrigger className="h-7 text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-medium">{selectedCompany.incorporationState || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Inc. Date:</span>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editForm.incorporationDate || ""}
                          onChange={(e) => setEditForm({ ...editForm, incorporationDate: e.target.value })}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span className="font-medium">{selectedCompany.incorporationDate || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Fiscal Year End:</span>
                      {isEditing ? (
                        <Input
                          value={editForm.fiscalYearEnd || ""}
                          onChange={(e) => setEditForm({ ...editForm, fiscalYearEnd: e.target.value })}
                          className="h-7 text-sm"
                          placeholder="MM/DD"
                        />
                      ) : (
                        <span className="font-medium">{selectedCompany.fiscalYearEnd || 'N/A'}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Industry:</span>
                      {isEditing ? (
                        <Select
                          value={editForm.industry || ""}
                          onValueChange={(value) => setEditForm({ ...editForm, industry: value })}
                        >
                          <SelectTrigger className="h-7 text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-medium">{selectedCompany.industry || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Sector:</span>
                      {isEditing ? (
                        <Input
                          value={editForm.sector || ""}
                          onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span className="font-medium">{selectedCompany.sector || 'N/A'}</span>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Status:</span>
                        <Select
                          value={editForm.status || "active"}
                          onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                        >
                          <SelectTrigger className="h-7 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-slate-500 block">Address:</span>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={editForm.address1 || ""}
                                onChange={(e) => setEditForm({ ...editForm, address1: e.target.value })}
                                placeholder="Street address"
                                className="h-7 text-sm"
                              />
                              <Input
                                value={editForm.address2 || ""}
                                onChange={(e) => setEditForm({ ...editForm, address2: e.target.value })}
                                placeholder="Suite, floor, etc."
                                className="h-7 text-sm"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={editForm.city || ""}
                                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                  placeholder="City"
                                  className="h-7 text-sm"
                                />
                                <Select
                                  value={editForm.state || ""}
                                  onValueChange={(value) => setEditForm({ ...editForm, state: value })}
                                >
                                  <SelectTrigger className="h-7 text-sm w-32">
                                    <SelectValue placeholder="State" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {US_STATES.map((state) => (
                                      <SelectItem key={state} value={state}>{state}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={editForm.postalCode || ""}
                                  onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                                  placeholder="ZIP"
                                  className="h-7 text-sm w-24"
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="font-medium">
                              {selectedCompany.address1 ? (
                                <>
                                  {selectedCompany.address1}
                                  {selectedCompany.address2 && <><br />{selectedCompany.address2}</>}
                                  <br />
                                  {selectedCompany.city}, {selectedCompany.state} {selectedCompany.postalCode}
                                </>
                              ) : 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Phone:</span>
                        {isEditing ? (
                          <Input
                            value={editForm.phone || ""}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="font-medium">{selectedCompany.phone || 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Email:</span>
                        {isEditing ? (
                          <Input
                            value={editForm.email || ""}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <span className="font-medium">{selectedCompany.email || 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Website:</span>
                        {isEditing ? (
                          <Input
                            value={editForm.website || ""}
                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          selectedCompany.website ? (
                            <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                              {selectedCompany.website}
                            </a>
                          ) : (
                            <span className="font-medium">N/A</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm">{selectedCompany.description || 'No description available.'}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCompany?.name}"? This action cannot be undone.
              Note: Companies with existing shareholders cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteCompany.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StockDashboardLayout>
  );
}
