import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  UserPlus, 
  Shield,
  User,
  UserCog,
  UserCheck,
  LogIn,
  Building
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const { data: invitation, isLoading, error } = trpc.invitation.getByToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  const acceptInvitation = trpc.invitation.accept.useMutation({
    onSuccess: (data) => {
      if (data.requiresLogin) {
        // Store token in session storage for after login
        sessionStorage.setItem('pendingInvitationToken', token || '');
        // Redirect to login
        window.location.href = getLoginUrl();
      } else {
        // Success - redirect to dashboard
        setTimeout(() => {
          setLocation('/');
        }, 2000);
      }
    },
    onError: (error) => {
      setAcceptError(error.message);
    },
  });

  // Check for pending invitation after login
  useEffect(() => {
    const pendingToken = sessionStorage.getItem('pendingInvitationToken');
    if (pendingToken && user && !authLoading) {
      sessionStorage.removeItem('pendingInvitationToken');
      // Auto-accept the invitation
      acceptInvitation.mutate({ token: pendingToken });
    }
  }, [user, authLoading]);

  const handleAccept = () => {
    if (!token) return;
    acceptInvitation.mutate({ token });
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

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-[#1e3a5f] animate-spin mb-4" />
            <p className="text-slate-600">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Invitation</h2>
            <p className="text-slate-600 text-center mb-6">
              This invitation link is invalid or has been removed.
            </p>
            <Button onClick={() => setLocation('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invitation Expired</h2>
            <p className="text-slate-600 text-center mb-6">
              This invitation has expired. Please contact the administrator for a new invitation.
            </p>
            <Button onClick={() => setLocation('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === 'revoked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invitation Revoked</h2>
            <p className="text-slate-600 text-center mb-6">
              This invitation has been revoked. Please contact the administrator if you believe this is an error.
            </p>
            <Button onClick={() => setLocation('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Already Accepted</h2>
            <p className="text-slate-600 text-center mb-6">
              This invitation has already been accepted.
            </p>
            <Button onClick={() => setLocation('/')} className="bg-[#1e3a5f]">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptInvitation.isSuccess && !acceptInvitation.data?.requiresLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome!</h2>
            <p className="text-slate-600 text-center mb-6">
              Your invitation has been accepted. Redirecting to dashboard...
            </p>
            <Loader2 className="w-6 h-6 text-[#1e3a5f] animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[#1e3a5f]" />
          </div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            You've been invited to join the Stock Transfer Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Invited Email</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Assigned Role</span>
              {getRoleBadge(invitation.role)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Expires</span>
              <span className="text-sm">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Personal Message */}
          {invitation.message && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-slate-600 italic">"{invitation.message}"</p>
            </div>
          )}

          {/* Error Message */}
          {acceptError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-sm text-red-600">{acceptError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {user ? (
              <Button 
                onClick={handleAccept} 
                className="w-full bg-[#1e3a5f]"
                disabled={acceptInvitation.isPending}
              >
                {acceptInvitation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  sessionStorage.setItem('pendingInvitationToken', token || '');
                  window.location.href = getLoginUrl();
                }} 
                className="w-full bg-[#1e3a5f]"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Accept
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation('/')}
            >
              Decline
            </Button>
          </div>

          {!user && (
            <p className="text-xs text-center text-slate-500">
              You need to sign in to accept this invitation. If you don't have an account, 
              one will be created for you.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
