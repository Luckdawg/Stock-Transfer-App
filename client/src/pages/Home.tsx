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
  Plug
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";

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
    <StockDashboardLayout>
      <div className="space-y-4">
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
                  <span className="font-bold ml-2">50,000,000</span>
                </div>
                <div>
                  <span className="text-slate-400">Outstanding:</span>
                  <span className="font-bold ml-2">45,000,000</span>
                </div>
                <div>
                  <span className="text-slate-400">Treasury:</span>
                  <span className="font-bold ml-2">5,000,000</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-slate-400">Recent Ledger Activity:</span>
                <div className="mt-1">
                  <span className="text-green-400">• +2,000</span> Issued (Grant ID 2024-A), 
                  <span className="text-red-400 ml-2">-500</span> Redeemed
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
                    <p>• Merger Record Date (11/15)</p>
                    <p>• Dividend Payment (12/01)</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Pending Transactions:</p>
                    <p>• <span className="text-amber-400">15</span> Transfers awaiting approval</p>
                    <p>• <span className="text-amber-400">2</span> Rule 144 sales under review</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Corporate Actions:</p>
                    <p>Split (2-for-1) – Status: <span className="text-green-400">Scheduled</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Paying Agent: <span className="text-white">Dividend Batch #402 – Ready for processing</span></p>
                  </div>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white mt-2" onClick={() => toast.info("Initiate action - Feature coming soon")}>
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
                <span><span className="text-slate-400">Book-Entry Tx:</span> <span className="font-bold">12,450</span></span>
                <span><span className="text-slate-400">Certificate Tx:</span> <span className="font-bold">3</span></span>
                <span><span className="text-slate-400">DRS Requests:</span> <span className="font-bold text-amber-400">15 (Processing)</span></span>
                <span><span className="text-slate-400">DTC/DWAC:</span> <span className="font-bold text-amber-400">8 Pending</span></span>
              </div>
              <Button variant="outline" size="sm" className="border-slate-500 text-white hover:bg-slate-700" onClick={() => toast.info("Manage lost certificates - Feature coming soon")}>
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
                <span className="text-slate-600">Active Users:</span>
                <span className="font-bold">18,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Mobile App Logins:</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Self-Service Requests:</span>
                <span className="font-bold">120 (Address Updates, Statement Views)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Recent Communications:</span>
                <span className="font-bold">"Q3 Report" sent to 40,000 shareholders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Notifications:</span>
                <span className="font-bold text-amber-600">35 Secure Messages unread</span>
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
                <span className="text-slate-600">AGM Status:</span>
                <span className="font-bold">Scheduled (03/15/2025)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Proxy Materials:</span>
                <span className="font-bold">Distributed via E-Delivery & Mail</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Voting Progress:</span>
                <span className="font-bold text-amber-600">42% Quorum reached</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Votes Cast:</span>
                <span className="font-bold">For: <span className="text-green-600">85%</span>, Against: <span className="text-red-600">10%</span>, Abstain: 5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Meeting Tech:</span>
                <span className="font-bold text-green-600">Virtual Platform Ready</span>
              </div>
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
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Tax Filings Due: <span className="font-bold">1099-DIV (01/31)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Regulatory Records: <span className="font-bold text-green-600">Rule 17Ad-7 compliant</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Escheatment: <span className="font-bold">State Reports due in 30 days</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Audit Trails: <span className="font-bold">All actions logged</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Compliance Score: <span className="font-bold text-green-600">98/100</span></span>
              </div>
              <Button className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700" onClick={() => toast.info("Generate report - Feature coming soon")}>
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
                <span className="font-bold">3 (Options, RSUs, SARs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Vesting Schedule:</span>
                <span className="font-bold">Next batch vests 12/01 (1,200 participants)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Grant Management:</span>
                <span className="font-bold text-amber-600">New Awards pending CEO approval</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax Withholding:</span>
                <span className="font-bold text-green-600">Automated calculations enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Employee Portal:</span>
                <span className="font-bold">85% engagement</span>
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
