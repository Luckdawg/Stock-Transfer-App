import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Building2 } from "lucide-react";

interface CompanySelectorProps {
  value?: number;
  onChange: (companyId: number) => void;
  className?: string;
}

export function CompanySelector({ value, onChange, className }: CompanySelectorProps) {
  const { data: companies, isLoading } = trpc.company.list.useQuery();
  
  // Auto-select first company if none selected
  useEffect(() => {
    if (companies && companies.length > 0 && !value) {
      onChange(companies[0].id);
    }
  }, [companies, value, onChange]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg ${className}`}>
        <Building2 className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    );
  }

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(parseInt(val))}
    >
      <SelectTrigger className={`bg-slate-700 border-slate-600 text-white ${className}`}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <SelectValue placeholder="Select company" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {companies?.map((company: any) => (
          <SelectItem key={company.id} value={company.id.toString()}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{company.name}</span>
              {company.ticker && (
                <span className="text-xs text-slate-500">({company.ticker})</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Hook to manage selected company state
export function useSelectedCompany() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);
  const { data: companies } = trpc.company.list.useQuery();
  
  useEffect(() => {
    // Try to restore from localStorage
    const stored = localStorage.getItem('selectedCompanyId');
    if (stored) {
      setSelectedCompanyId(parseInt(stored));
    } else if (companies && companies.length > 0) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies]);

  const setCompany = (id: number) => {
    setSelectedCompanyId(id);
    localStorage.setItem('selectedCompanyId', id.toString());
  };

  return {
    selectedCompanyId,
    setSelectedCompanyId: setCompany,
    companies,
  };
}
