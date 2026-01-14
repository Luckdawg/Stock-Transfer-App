import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CheckCircle, XCircle, Ban, X, Loader2 } from "lucide-react";
import { useState } from "react";

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onCancel?: () => Promise<void>;
  onUpdateStatus?: (status: string) => Promise<void>;
  entityType: "transaction" | "certificate" | "drs";
  isLoading?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  onApprove,
  onReject,
  onCancel,
  onUpdateStatus,
  entityType,
  isLoading = false,
}: BulkActionToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "cancel" | null>(null);

  if (selectedCount === 0) return null;

  const handleConfirm = async () => {
    if (confirmAction === "approve" && onApprove) {
      await onApprove();
    } else if (confirmAction === "reject" && onReject) {
      await onReject();
    } else if (confirmAction === "cancel" && onCancel) {
      await onCancel();
    }
    setConfirmAction(null);
  };

  const getActionLabel = () => {
    switch (confirmAction) {
      case "approve":
        return "Approve";
      case "reject":
        return "Reject";
      case "cancel":
        return "Cancel";
      default:
        return "";
    }
  };

  const getActionDescription = () => {
    const entityName = entityType === "transaction" ? "transactions" : entityType === "certificate" ? "certificates" : "DRS requests";
    switch (confirmAction) {
      case "approve":
        return `Are you sure you want to approve ${selectedCount} ${entityName}? This action cannot be undone.`;
      case "reject":
        return `Are you sure you want to reject ${selectedCount} ${entityName}? This action cannot be undone.`;
      case "cancel":
        return `Are you sure you want to cancel ${selectedCount} ${entityName}? This action cannot be undone.`;
      default:
        return "";
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-500 text-white">
            {selectedCount} selected
          </Badge>
          
          <div className="h-6 w-px bg-slate-600" />
          
          {entityType === "transaction" && (
            <>
              {onApprove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmAction("approve")}
                  disabled={isLoading}
                  className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve All
                </Button>
              )}
              {onReject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmAction("reject")}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject All
                </Button>
              )}
            </>
          )}
          
          {entityType === "certificate" && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAction("cancel")}
              disabled={isLoading}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
              Cancel All
            </Button>
          )}
          
          {entityType === "drs" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus?.("completed")}
                disabled={isLoading}
                className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Mark Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateStatus?.("rejected")}
                disabled={isLoading}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Reject
              </Button>
            </>
          )}
          
          <div className="h-6 w-px bg-slate-600" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {getActionLabel()}</AlertDialogTitle>
            <AlertDialogDescription>{getActionDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {getActionLabel()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
