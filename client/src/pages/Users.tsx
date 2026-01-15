import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Loader2,
  UserCog,
  UserCheck,
  UserX
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const { user: currentUser } = useAuth();

  const { data: users, refetch } = trpc.user.list.useQuery();
  const { data: companies } = trpc.company.list.useQuery();
  
  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setShowDeleteConfirm(false);
      setShowViewDialog(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setIsEditing(false);
    setShowViewDialog(true);
  };

  const handleEditUser = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    updateUser.mutate({
      id: selectedUser.id,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      companyId: editForm.companyId || null,
      securityLevel: editForm.securityLevel,
      mfaEnabled: editForm.mfaEnabled,
    });
  };

  const handleCancelEdit = () => {
    setEditForm({ ...selectedUser });
    setIsEditing(false);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    deleteUser.mutate({ id: selectedUser.id });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case "issuer":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><UserCog className="w-3 h-3 mr-1" />Issuer</Badge>;
      case "shareholder":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><UserCheck className="w-3 h-3 mr-1" />Shareholder</Badge>;
      case "employee":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><User className="w-3 h-3 mr-1" />Employee</Badge>;
      default:
        return <Badge variant="outline"><User className="w-3 h-3 mr-1" />User</Badge>;
    }
  };

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Low</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredUsers = users?.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <StockDashboardLayout title="USER MANAGEMENT">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users?.length || 0}</p>
                  <p className="text-sm text-slate-400">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users?.filter((u: any) => u.role === 'admin').length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users?.filter((u: any) => u.mfaEnabled).length || 0}
                  </p>
                  <p className="text-sm text-slate-400">MFA Enabled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users?.filter((u: any) => u.role === 'issuer').length || 0}
                  </p>
                  <p className="text-sm text-slate-400">Issuers</p>
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
                <UsersIcon className="w-5 h-5" />
                Users
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button onClick={() => toast.info("New users are added via OAuth login. To invite a user, share the platform URL with them.")} className="bg-[#1e3a5f]">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#1e3a5f] text-white text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {companies?.find((c: any) => c.id === user.companyId)?.name || '-'}
                      </TableCell>
                      <TableCell>{getSecurityBadge(user.securityLevel)}</TableCell>
                      <TableCell>
                        {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
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

      {/* View/Edit User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {isEditing ? "Edit User" : "User Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-lg text-white">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-white/20 text-white text-xl">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {isEditing ? (
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-xl font-bold bg-white/10 border-white/30 text-white"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{selectedUser.name || 'Unknown User'}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      {selectedUser.mfaEnabled && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <Shield className="w-3 h-3 mr-1" />
                          MFA
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentUser?.role === 'admin' && (
                    <>
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600" disabled={updateUser.isPending}>
                            {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={handleEditUser} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {selectedUser.id !== currentUser?.id && (
                            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                        <span className="font-medium">{selectedUser.email || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Role:</span>
                      {isEditing ? (
                        <Select
                          value={editForm.role || "user"}
                          onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                        >
                          <SelectTrigger className="h-7 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="issuer">Issuer</SelectItem>
                            <SelectItem value="shareholder">Shareholder</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-medium capitalize">{selectedUser.role}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Login Method:</span>
                      <span className="font-medium">{selectedUser.loginMethod || 'OAuth'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Security Level:</span>
                      {isEditing ? (
                        <Select
                          value={editForm.securityLevel || "medium"}
                          onValueChange={(value) => setEditForm({ ...editForm, securityLevel: value })}
                        >
                          <SelectTrigger className="h-7 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getSecurityBadge(selectedUser.securityLevel)
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">MFA Enabled:</span>
                      <span className="font-medium">{selectedUser.mfaEnabled ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Last Sign In:</span>
                      <span className="font-medium">
                        {selectedUser.lastSignedIn ? new Date(selectedUser.lastSignedIn).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Company Association */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Company Association</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Select
                      value={editForm.companyId?.toString() || "none"}
                      onValueChange={(value) => setEditForm({ ...editForm, companyId: value === "none" ? null : parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Company</SelectItem>
                        {companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm">
                      {companies?.find((c: any) => c.id === selectedUser.companyId)?.name || 'Not associated with any company'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Audit Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Audit Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Created:</span>
                      <span className="font-medium ml-2">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Updated:</span>
                      <span className="font-medium ml-2">
                        {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Open ID:</span>
                      <span className="font-medium ml-2 font-mono text-xs">
                        {selectedUser.openId}
                      </span>
                    </div>
                  </div>
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedUser?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUser.isPending ? (
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
