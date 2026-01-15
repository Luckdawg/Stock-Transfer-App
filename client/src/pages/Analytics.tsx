import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Globe,
  Plug,
  CheckCircle2,
  RefreshCw,
  Download,
  PieChart,
  LineChart
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSelectedCompany, CompanySelector } from "@/components/CompanySelector";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Demo data
const holdingsTrend = [
  { month: "Jan", institutional: 45, retail: 35, insider: 20 },
  { month: "Feb", institutional: 46, retail: 34, insider: 20 },
  { month: "Mar", institutional: 47, retail: 33, insider: 20 },
  { month: "Apr", institutional: 48, retail: 32, insider: 20 },
  { month: "May", institutional: 49, retail: 31, insider: 20 },
  { month: "Jun", institutional: 50, retail: 30, insider: 20 },
];

const tradingVolume = [
  { week: "W1", volume: 125000 },
  { week: "W2", volume: 180000 },
  { week: "W3", volume: 95000 },
  { week: "W4", volume: 220000 },
];

const shareholderDistribution = [
  { name: "Institutional", value: 50, color: "#0ea5e9" },
  { name: "Retail", value: 30, color: "#22c55e" },
  { name: "Insider", value: 20, color: "#f59e0b" },
];

const integrations = [
  { id: 1, name: "ERP System", type: "erp", status: "connected", lastSync: "2024-12-12 14:30", dataFlow: "real-time" },
  { id: 2, name: "HRIS Platform", type: "hris", status: "connected", lastSync: "2024-12-12 14:25", dataFlow: "real-time" },
  { id: 3, name: "Tax System", type: "tax", status: "connected", lastSync: "2024-12-12 12:00", dataFlow: "hourly" },
  { id: 4, name: "Banking API", type: "banking", status: "connected", lastSync: "2024-12-12 14:28", dataFlow: "real-time" },
];

const topShareholders = [
  { rank: 1, name: "Vanguard Group", shares: 5000000, percentage: "10.0%", change: "+0.5%" },
  { rank: 2, name: "BlackRock Inc.", shares: 4500000, percentage: "9.0%", change: "+0.2%" },
  { rank: 3, name: "State Street Corp", shares: 3500000, percentage: "7.0%", change: "-0.1%" },
  { rank: 4, name: "Fidelity Investments", shares: 2500000, percentage: "5.0%", change: "+0.3%" },
  { rank: 5, name: "T. Rowe Price", shares: 2000000, percentage: "4.0%", change: "0.0%" },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<"insights" | "integrations">("insights");
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompany();

  return (
    <StockDashboardLayout 
      title="ANALYTICS & INTEGRATIONS"
      headerRight={
        <CompanySelector
          value={selectedCompanyId}
          onChange={setSelectedCompanyId}
          className="w-64"
        />
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">40,000</p>
                  <p className="text-sm text-slate-400">Total Shareholders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+2.5%</p>
                  <p className="text-sm text-slate-400">Institutional Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">620K</p>
                  <p className="text-sm text-slate-400">Monthly Volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Plug className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-slate-400">Active Integrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button 
            variant={activeTab === "insights" ? "default" : "outline"}
            onClick={() => setActiveTab("insights")}
            className={activeTab === "insights" ? "bg-[#1e3a5f]" : ""}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Shareholder Insights
          </Button>
          <Button 
            variant={activeTab === "integrations" ? "default" : "outline"}
            onClick={() => setActiveTab("integrations")}
            className={activeTab === "integrations" ? "bg-[#1e3a5f]" : ""}
          >
            <Plug className="w-4 h-4 mr-2" />
            System Integrations
          </Button>
        </div>

        {activeTab === "insights" && (
          <>
            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Holdings Trend Chart */}
              <Card className="bg-white border-slate-200 col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-cyan-500" />
                    Shareholder Holdings Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={holdingsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line type="monotone" dataKey="institutional" stroke="#0ea5e9" strokeWidth={2} name="Institutional %" />
                      <Line type="monotone" dataKey="retail" stroke="#22c55e" strokeWidth={2} name="Retail %" />
                      <Line type="monotone" dataKey="insider" stroke="#f59e0b" strokeWidth={2} name="Insider %" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribution Pie Chart */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    Ownership Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={shareholderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {shareholderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Trading Volume & Top Shareholders */}
            <div className="grid grid-cols-2 gap-4">
              {/* Trading Volume */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Weekly Trading Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={tradingVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Shareholders */}
              <Card className="bg-white border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Top Shareholders
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Export data - Feature coming soon")}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topShareholders.map((sh) => (
                        <TableRow key={sh.rank}>
                          <TableCell className="font-medium">{sh.rank}</TableCell>
                          <TableCell>{sh.name}</TableCell>
                          <TableCell>{sh.shares.toLocaleString()}</TableCell>
                          <TableCell>{sh.percentage}</TableCell>
                          <TableCell>
                            <span className={sh.change.startsWith("+") ? "text-green-600" : sh.change.startsWith("-") ? "text-red-600" : "text-slate-600"}>
                              {sh.change}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "integrations" && (
          <div className="grid grid-cols-2 gap-6">
            {/* Integration Status */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plug className="w-5 h-5 text-purple-500" />
                  System Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Data Flow</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{integration.lastSync}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{integration.dataFlow}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Sync now - Feature coming soon")}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* API Access */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  RESTful API Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">API Endpoint</p>
                  <code className="text-sm bg-slate-200 px-2 py-1 rounded">https://api.stocktransfer.com/v1</code>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">API Calls Today</p>
                    <p className="text-2xl font-bold text-cyan-600">12,458</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">99.9%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Available Endpoints</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">/shareholders</Badge>
                    <Badge variant="outline">/transactions</Badge>
                    <Badge variant="outline">/certificates</Badge>
                    <Badge variant="outline">/dividends</Badge>
                    <Badge variant="outline">/proxy</Badge>
                    <Badge variant="outline">/compliance</Badge>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => toast.info("View API docs - Feature coming soon")}>
                  View API Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </StockDashboardLayout>
  );
}
