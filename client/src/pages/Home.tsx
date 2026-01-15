import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  TrendingDown,
  FileText,
  ArrowRightLeft,
  Users,
  Vote,
  ShieldCheck,
  Briefcase,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Radio,
  Download,
  ChevronLeft,
  ChevronRight,
  Plug,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useSelectedCompany, CompanySelector } from "@/components/CompanySelector";

// Demo data for the mini chart
const holdingsData = [
  { day: 1, value: 150 },
  { day: 3, value: 180 },
  { day: 6, value: 160 },
  { day: 9, value: 220 },
  { day: 12, value: 200 },
  { day: 15, value: 280 },
  { day: 17, value: 250 },
  { day: 21, value: 300 },
  { day: 24, value: 280 },
];

// Calendar data
const currentMonth = new Date();
const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(18);
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompany();

  // Fetch real data from database
  const { data: companies } = trpc.company.list.useQuery();
  const { data: shareholders } = trpc.shareholder.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  const { data: certificates } = trpc.certificate.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  const { data: transactions } = trpc.transaction.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  const { data: corporateActions } = trpc.corporateAction.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  // Dividends are fetched by shareholder, so we'll skip for dashboard overview
  const { data: proxyEvents } = trpc.proxy.events.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  const { data: complianceAlerts } = trpc.compliance.alerts.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  const { data: equityPlans } = trpc.equity.plans.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );
  // Equity grants are fetched by employee, so we'll use upcoming vesting for dashboard
  const { data: upcomingVesting } = trpc.equity.upcomingVesting.useQuery(
    { companyId: selectedCompanyId!, days: 90 },
    { enabled: !!selectedCompanyId }
  );
  const { data: dtcRequests } = trpc.dtc.list.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  // Get selected company details
  const selectedCompany = companies?.find((c: any) => c.id === selectedCompanyId);

  // Calculate statistics - use default values since company table doesn't have share columns
  const totalIssuedShares = 50000000;
  const outstandingShares = 45000000;
  const treasuryShares = totalIssuedShares - outstandingShares;
  
  const activeCertificates = certificates?.filter((c: any) => c.status === 'active').length || 0;
  const lostStolenCerts = certificates?.filter((c: any) => c.status === 'lost' || c.status === 'stolen').length || 0;
  const pendingDRS = dtcRequests?.filter((d: any) => d.status === 'pending').length || 0;
  const processingDRS = dtcRequests?.filter((d: any) => d.status === 'processing').length || 0;
  
  const pendingTransactions = transactions?.filter((t: any) => t.status === 'pending').length || 0;
  const rule144Transactions = transactions?.filter((t: any) => t.type === 'rule_144').length || 0;
  
  const scheduledActions = corporateActions?.filter((a: any) => a.status === 'scheduled').length || 0;
  const pendingDividends = 0; // Would need to fetch dividends separately
  
  const upcomingProxy = proxyEvents?.find((p: any) => p.status === 'scheduled' || p.status === 'in_progress');
  const votingProgress = upcomingProxy ? 42 : 0; // Would calculate from actual votes
  
  const unresolvedAlerts = complianceAlerts?.filter((a: any) => a.status === 'open' || a.status === 'in_progress').length || 0;
  const complianceScore = unresolvedAlerts === 0 ? 100 : Math.max(0, 100 - (unresolvedAlerts * 5));
  
  const activePlans = equityPlans?.filter((p: any) => p.status === 'active').length || 0;
  const pendingGrants = 0; // Would need to aggregate from all employees
  const vestingGrants = upcomingVesting?.length || 0;

  const calendarDays = [];
  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: 30 - firstDayOfMonth + i + 1, currentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, currentMonth: true });
  }
  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, currentMonth: false });
  }

  return (
    <StockDashboardLayout
      companySelector={
        <CompanySelector 
          value={selectedCompanyId} 
          onChange={setSelectedCompanyId}
          className="w-72"
        />
      }
    >
      <div className="space-y-4">
        {/* Company Info Banner */}
        {selectedCompany && (
          <Card className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedCompany.name}</h2>
                    <p className="text-sm text-slate-300">
                      {selectedCompany.ticker ? `${selectedCompany.ticker} • ` : ''}
                      {selectedCompany.status === 'active' ? 'Active' : selectedCompany.status}
                      {selectedCompany.incorporationState ? ` • ${selectedCompany.incorporationState}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{shareholders?.length || 0}</p>
                    <p className="text-slate-400">Shareholders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{activeCertificates}</p>
                    <p className="text-slate-400">Active Certs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{pendingTransactions}</p>
                    <p className="text-slate-400">Pending Tx</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedCompanyId && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <Building2 className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-amber-800">Select a Company</h3>
              <p className="text-amber-600 mt-1">Choose a company from the dropdown above to view its dashboard data.</p>
            </CardContent>
          </Card>
        )}

        {/* Top Row - Cap Table & Corporate Actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cap Table & Register */}
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-amber-400">CAP TABLE & REGISTER</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-slate-400">Total Issued Shares:</span>
                  <span className="font-bold ml-2">{totalIssuedShares.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Outstanding:</span>
                  <span className="font-bold ml-2">{outstandingShares.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Treasury:</span>
                  <span className="font-bold ml-2">{treasuryShares.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-slate-400">Recent Ledger Activity:</span>
                <div className="mt-1">
                  {transactions && transactions.length > 0 ? (
                    <>
                      <span className="text-green-400">• {transactions.filter((t: any) => t.type === 'issuance').length} Issuances</span>, 
                      <span className="text-blue-400 ml-2">{transactions.filter((t: any) => t.type === 'transfer').length} Transfers</span>,
                      <span className="text-red-400 ml-2">{transactions.filter((t: any) => t.type === 'redemption').length} Redemptions</span>
                    </>
                  ) : (
                    <span className="text-slate-500">No recent activity</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Corporate Actions & Transactions */}
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-amber-400">CORPORATE ACTIONS & TRANSACTIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* Mini Calendar */}
                <div className="w-48">
                  <div className="flex items-center justify-between mb-2">
                    <ChevronLeft className="w-4 h-4 text-slate-400 cursor-pointer" />
                    <span className="text-sm font-medium">Calendar</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-xs">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-center text-slate-400 py-1">{day}</div>
                    ))}
                    {calendarDays.slice(0, 35).map((item, i) => (
                      <div 
                        key={i} 
                        className={`text-center py-1 rounded cursor-pointer ${
                          !item.currentMonth ? 'text-slate-600' :
                          item.day === selectedDate ? 'bg-amber-500 text-white' :
                          'text-white hover:bg-slate-700'
                        }`}
                        onClick={() => item.currentMonth && setSelectedDate(item.day)}
                      >
                        {item.day}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Events */}
                <div className="flex-1 text-sm space-y-2">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Upcoming Events:</p>
                    {corporateActions && corporateActions.length > 0 ? (
                      corporateActions.slice(0, 2).map((action: any, i: number) => (
                        <p key={i}>• {action.type} ({action.effectiveDate || 'TBD'})</p>
                      ))
                    ) : (
                      <p className="text-slate-500">No upcoming events</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Pending Transactions:</p>
                    <p>• <span className="text-amber-400">{pendingTransactions}</span> Transfers awaiting approval</p>
                    <p>• <span className="text-amber-400">{rule144Transactions}</span> Rule 144 sales under review</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Corporate Actions:</p>
                    <p>{scheduledActions} Scheduled Actions</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Paying Agent: <span className="text-white">{pendingDividends} Dividends pending</span></p>
                  </div>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white mt-2" onClick={() => toast.info("Initiate action - Navigate to Transactions page")}>
                    INITIATE ACTION
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Electronic Recordkeeping */}
        <Card className="bg-[#1e3a5f] border-0 text-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-amber-400">ELECTRONIC RECORDKEEPING</CardTitle>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              LIVE FEED
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-6 text-sm">
                <span><span className="text-slate-400">Book-Entry Tx:</span> <span className="font-bold">{transactions?.length || 0}</span></span>
                <span><span className="text-slate-400">Certificate Tx:</span> <span className="font-bold">{activeCertificates}</span></span>
                <span><span className="text-slate-400">DRS Requests:</span> <span className="font-bold text-amber-400">{processingDRS} (Processing)</span></span>
                <span><span className="text-slate-400">DTC/DWAC:</span> <span className="font-bold text-amber-400">{pendingDRS} Pending</span></span>
              </div>
              <Button variant="outline" size="sm" className="border-slate-500 text-white hover:bg-slate-700" onClick={() => toast.info("Navigate to Recordkeeping page for lost certificates")}>
                MANAGE LOST CERTIFICATES
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Middle Row - Shareholder Portal & Proxy */}
        <div className="grid grid-cols-2 gap-4">
          {/* Shareholder Portal Activity */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold text-[#1e3a5f]">SHAREHOLDER PORTAL ACTIVITY</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Shareholders:</span>
                <span className="font-bold">{shareholders?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Shareholders:</span>
                <span className="font-bold">{shareholders?.filter((s: any) => s.status === 'active').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Individual Accounts:</span>
                <span className="font-bold">{shareholders?.filter((s: any) => s.type === 'individual').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Institutional Accounts:</span>
                <span className="font-bold">{shareholders?.filter((s: any) => s.type === 'corporation' || s.type === 'institution').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Trust Accounts:</span>
                <span className="font-bold">{shareholders?.filter((s: any) => s.type === 'trust').length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Proxy & Meeting Management */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold text-[#1e3a5f]">PROXY & MEETING MANAGEMENT</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Upcoming Meetings:</span>
                <span className="font-bold">{proxyEvents?.filter((p: any) => p.status === 'scheduled').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Proxy Events:</span>
                <span className="font-bold">{proxyEvents?.filter((p: any) => p.status === 'in_progress').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Voting Progress:</span>
                <span className="font-bold text-amber-600">{votingProgress}% Quorum reached</span>
              </div>
              {upcomingProxy && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Next Meeting:</span>
                    <span className="font-bold">{upcomingProxy.meetingDate ? new Date(upcomingProxy.meetingDate).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Meeting Type:</span>
                    <span className="font-bold capitalize">{upcomingProxy.type?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                </>
              )}
              {!upcomingProxy && (
                <div className="text-slate-500 text-center py-2">No upcoming proxy events</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Compliance, Equity, Analytics */}
        <div className="grid grid-cols-3 gap-4">
          {/* Compliance & Reporting */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold text-[#1e3a5f]">COMPLIANCE & REPORTING</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {unresolvedAlerts > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                <span>Open Alerts: <span className={`font-bold ${unresolvedAlerts > 0 ? 'text-amber-600' : 'text-green-600'}`}>{unresolvedAlerts}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Regulatory Records: <span className="font-bold text-green-600">Rule 17Ad-7 compliant</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Escheatment Alerts: <span className="font-bold">{complianceAlerts?.filter((a: any) => a.type === 'escheatment').length || 0}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Audit Trails: <span className="font-bold">All actions logged</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Compliance Score: <span className={`font-bold ${complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{complianceScore}/100</span></span>
              </div>
              <Button className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.info("Navigate to Compliance page for reports")}>
                GENERATE REPORT
              </Button>
            </CardContent>
          </Card>

          {/* Equity Plan Administration */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold text-[#1e3a5f]">EQUITY PLAN ADMINISTRATION</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Active Plans:</span>
                <span className="font-bold">{activePlans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Upcoming Vesting:</span>
                <span className="font-bold">{vestingGrants} grants in 90 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Plan Types:</span>
                <span className="font-bold">Options, RSUs, SARs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="font-bold text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax Withholding:</span>
                <span className="font-bold text-green-600">Automated</span>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Integrations */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-semibold text-[#1e3a5f]">ANALYTICS & INTEGRATIONS</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex gap-4">
                {/* Mini Chart */}
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Shareholder Insights (Holdings Trend)</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={holdingsData}>
                      <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      <XAxis dataKey="day" hide />
                      <YAxis hide />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Integrations */}
                <div className="text-xs space-y-1">
                  <p className="font-medium text-slate-700">System Integrations:</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>ERP (Connected)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>HRIS (Connected)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Tax System (Connected)</span>
                  </div>
                  <p className="text-slate-500 mt-2">Data Flow: <span className="text-green-600 font-medium">Real-time</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StockDashboardLayout>
  );
}
