import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExportButtonProps {
  onExport: () => Promise<{ csv: string; filename: string }>;
  label?: string;
  disabled?: boolean;
}

export function ExportButton({ onExport, label = "Export", disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { csv, filename } = await onExport();
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Export completed', {
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: 'Unable to generate export file. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}

interface MultiExportButtonProps {
  exports: {
    label: string;
    onExport: () => Promise<{ csv: string; filename: string }>;
  }[];
  disabled?: boolean;
}

export function MultiExportButton({ exports, disabled }: MultiExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingLabel, setExportingLabel] = useState<string | null>(null);

  const handleExport = async (exportItem: { label: string; onExport: () => Promise<{ csv: string; filename: string }> }) => {
    setIsExporting(true);
    setExportingLabel(exportItem.label);
    try {
      const { csv, filename } = await exportItem.onExport();
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Export completed', {
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: 'Unable to generate export file. Please try again.',
      });
    } finally {
      setIsExporting(false);
      setExportingLabel(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting {exportingLabel}...
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {exports.map((exportItem, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => handleExport(exportItem)}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exportItem.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
