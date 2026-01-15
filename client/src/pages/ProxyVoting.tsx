import StockDashboardLayout from "@/components/StockDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Vote, 
  Search, 
  Plus, 
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Video,
  Mail,
  BarChart3,
  Target
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSelectedCompany, CompanySelector } from "@/components/CompanySelector";

// Demo data
const meetings = [
  { 
    id: 1, 
    title: "Annual General Meeting 2025", 
    date: "2025-03-15", 
    time: "10:00 AM EST",
    type: "annual",
    status: "scheduled",
    quorumRequired: 50,
    quorumReached: 42,
    totalVoters: 40000,
    votesReceived: 16800,
    virtualEnabled: true
  },
  { 
    id: 2, 
    title: "Special Meeting - Merger Approval", 
    date: "2025-02-01", 
    time: "2:00 PM EST",
    type: "special",
    status: "upcoming",
    quorumRequired: 66.67,
    quorumReached: 0,
    totalVoters: 40000,
    votesReceived: 0,
    virtualEnabled: true
  },
];

const proposals = [
  { id: 1, meetingId: 1, number: "P-001", title: "Election of Directors", votesFor: 14280, votesAgainst: 1680, abstain: 840, status: "open" },
  { id: 2, meetingId: 1, number: "P-002", title: "Ratification of Auditors", votesFor: 15120, votesAgainst: 1260, abstain: 420, status: "open" },
  { id: 3, meetingId: 1, number: "P-003", title: "Executive Compensation Plan", votesFor: 12600, votesAgainst: 3360, abstain: 840, status: "open" },
  { id: 4, meetingId: 1, number: "P-004", title: "Stock Option Plan Amendment", votesFor: 13440, votesAgainst: 2520, abstain: 840, status: "open" },
];

const proxyMaterials = [
  { id: 1, title: "Proxy Statement 2025", type: "proxy_statement", sentDate: "2025-01-15", deliveryMethod: "E-Delivery", status: "sent" },
  { id: 2, title: "Annual Report 2024", type: "annual_report", sentDate: "2025-01-15", deliveryMethod: "E-Delivery", status: "sent" },
  { id: 3, title: "Notice of Meeting", type: "notice", sentDate: "2025-01-10", deliveryMethod: "Mail & E-Delivery", status: "sent" },
];

export default function ProxyVoting() {
  const [activeTab, setActiveTab] = useState<"meetings" | "proposals" | "materials">("meetings");
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(1);
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompany();
  
  // Fetch real proxy data
  const { data: proxyEvents } = trpc.proxy.events.useQuery(
    { companyId: selectedCompanyId! },
    { enabled: !!selectedCompanyId }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Clock className="w-3 h-3 mr-1" />Upcoming</Badge>;
      case "in_progress":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><Vote className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-slate-500/20 text-slate-600 border-slate-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "open":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Open</Badge>;
      case "sent":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Sent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const currentMeeting = meetings.find(m => m.id === selectedMeeting);

  return (
    <StockDashboardLayout 
      title="PROXY & MEETING MANAGEMENT"
      headerRight={
        <CompanySelector
          value={selectedCompanyId}
          onChange={setSelectedCompanyId}
          className="w-64"
        />
      }
    >
      <div className="space-y-6">
        {/* Meeting Summary Card */}
        {currentMeeting && (
          <Card className="bg-[#1e3a5f] border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">{currentMeeting.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {currentMeeting.date} at {currentMeeting.time}
                    </span>
                    {currentMeeting.virtualEnabled && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Video className="w-4 h-4" />
                        Virtual Platform Ready
                      </span>
                    )}
                  </div>
                </div>
                {getStatusBadge(currentMeeting.status)}
              </div>
              
              <div className="grid grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Quorum Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={currentMeeting.quorumReached} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{currentMeeting.quorumReached}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Required: {currentMeeting.quorumRequired}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Votes Received</p>
                  <p className="text-2xl font-bold">{currentMeeting.votesReceived.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">of {currentMeeting.totalVoters.toLocaleString()} eligible</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Proxy Materials</p>
                  <p className="text-lg font-medium">Distributed via E-Delivery & Mail</p>
                </div>
                <div className="flex items-center justify-end">
                  <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => toast.info("Initiate action - Feature coming soon")}>
                    INITIATE ACTION
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Votes For</p>
                  <p className="text-xl font-bold text-green-600">85%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Votes Against</p>
                  <p className="text-xl font-bold text-red-600">10%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Abstain</p>
                  <p className="text-xl font-bold text-slate-600">5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Participation</p>
                  <p className="text-xl font-bold text-cyan-600">42%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant={activeTab === "meetings" ? "default" : "outline"}
                  onClick={() => setActiveTab("meetings")}
                  className={activeTab === "meetings" ? "bg-[#1e3a5f]" : ""}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Meetings
                </Button>
                <Button 
                  variant={activeTab === "proposals" ? "default" : "outline"}
                  onClick={() => setActiveTab("proposals")}
                  className={activeTab === "proposals" ? "bg-[#1e3a5f]" : ""}
                >
                  <Vote className="w-4 h-4 mr-2" />
                  Proposals & Voting
                </Button>
                <Button 
                  variant={activeTab === "materials" ? "default" : "outline"}
                  onClick={() => setActiveTab("materials")}
                  className={activeTab === "materials" ? "bg-[#1e3a5f]" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Proxy Materials
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  {activeTab === "meetings" ? "Schedule Meeting" : activeTab === "proposals" ? "Add Proposal" : "Upload Material"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === "meetings" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quorum</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Virtual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow 
                      key={meeting.id} 
                      className={selectedMeeting === meeting.id ? "bg-slate-50" : ""}
                      onClick={() => setSelectedMeeting(meeting.id)}
                    >
                      <TableCell className="font-medium">{meeting.title}</TableCell>
                      <TableCell>{meeting.date}<br /><span className="text-slate-500 text-sm">{meeting.time}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{meeting.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={meeting.quorumReached} className="w-16 h-2" />
                          <span className="text-sm">{meeting.quorumReached}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{meeting.votesReceived.toLocaleString()}</TableCell>
                      <TableCell>
                        {meeting.virtualEnabled ? (
                          <Badge className="bg-green-500/20 text-green-600"><Video className="w-3 h-3 mr-1" />Ready</Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Manage meeting - Feature coming soon")}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {activeTab === "proposals" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Votes For</TableHead>
                    <TableHead>Votes Against</TableHead>
                    <TableHead>Abstain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => {
                    const total = proposal.votesFor + proposal.votesAgainst + proposal.abstain;
                    const forPct = ((proposal.votesFor / total) * 100).toFixed(1);
                    const againstPct = ((proposal.votesAgainst / total) * 100).toFixed(1);
                    const abstainPct = ((proposal.abstain / total) * 100).toFixed(1);
                    return (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-mono">{proposal.number}</TableCell>
                        <TableCell className="font-medium">{proposal.title}</TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">{proposal.votesFor.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm ml-1">({forPct}%)</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-medium">{proposal.votesAgainst.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm ml-1">({againstPct}%)</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 font-medium">{proposal.abstain.toLocaleString()}</span>
                          <span className="text-slate-400 text-sm ml-1">({abstainPct}%)</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View details - Feature coming soon")}>Details</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {activeTab === "materials" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Delivery Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proxyMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{material.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{material.sentDate}</TableCell>
                      <TableCell>{material.deliveryMethod}</TableCell>
                      <TableCell>{getStatusBadge(material.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("View document - Feature coming soon")}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Resend - Feature coming soon")}>Resend</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </StockDashboardLayout>
  );
}
