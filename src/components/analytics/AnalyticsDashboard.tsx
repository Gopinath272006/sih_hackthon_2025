import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  Download,
  Shield,
} from "lucide-react";

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "semester" | "year">("week");
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Data sets for each period (mock)
  const dataByPeriod = useMemo(() => {
    return {
      week: {
        attendanceTrends: [
          { date: "Mon", present: 42, total: 45, percentage: 93.3 },
          { date: "Tue", present: 40, total: 45, percentage: 88.9 },
          { date: "Wed", present: 44, total: 45, percentage: 97.8 },
          { date: "Thu", present: 38, total: 45, percentage: 84.4 },
          { date: "Fri", present: 41, total: 45, percentage: 91.1 },
          { date: "Sat", present: 35, total: 45, percentage: 77.8 },
          { date: "Sun", present: 39, total: 45, percentage: 86.7 },
        ],
        verificationData: [
          { method: "Face Recognition", success: 98.5, failed: 1.5, count: 1200 },
          { method: "Fingerprint", success: 99.2, failed: 0.8, count: 1150 },
          { method: "NFC Presence", success: 99.8, failed: 0.2, count: 1180 },
        ],
        riskStudents: [
          { name: "gopinath", attendance: 99, trend: "up", risk: "low" },
          { name: "deepak", attendance: 72, trend: "down", risk: "medium" },
          { name: "ashvath", attendance: 68, trend: "up", risk: "medium" },
          { name: "hari ram", attendance: 74, trend: "stable", risk: "low" },
        ],
        timeDistribution: [
          { time: "8:00-9:00", count: 12, color: "#3b82f6" },
          { time: "9:00-10:00", count: 28, color: "#06b6d4" },
          { time: "10:00-11:00", count: 35, color: "#10b981" },
          { time: "11:00-12:00", count: 15, color: "#f59e0b" },
        ],
        securityMetrics: [
          { month: "Mon", incidents: 2, threats: 5, resolved: 7 },
          { month: "Tue", incidents: 1, threats: 3, resolved: 4 },
          { month: "Wed", incidents: 0, threats: 2, resolved: 2 },
          { month: "Thu", incidents: 1, threats: 4, resolved: 5 },
        ],
      },
      month: {
        attendanceTrends: Array.from({ length: 4 }).map((_, i) => ({
          date: `W${i + 1}`,
          present: 40 + Math.round(Math.random() * 5),
          total: 45,
          percentage: 88 + Math.round(Math.random() * 9),
        })),
        verificationData: [
          { method: "Face Recognition", success: 98.2, failed: 1.8, count: 4800 },
          { method: "Fingerprint", success: 99.0, failed: 1.0, count: 4600 },
          { method: "NFC Presence", success: 99.7, failed: 0.3, count: 4700 },
        ],
        riskStudents: [
          { name: "anbu", attendance: 62, trend: "down", risk: "high" },
          { name: "arun", attendance: 70, trend: "down", risk: "medium" },
          { name: "surya", attendance: 69, trend: "down", risk: "medium" },
        ],
        timeDistribution: [
          { time: "8-9", count: 40, color: "#3b82f6" },
          { time: "9-10", count: 80, color: "#06b6d4" },
          { time: "10-11", count: 120, color: "#10b981" },
          { time: "11-12", count: 60, color: "#f59e0b" },
        ],
        securityMetrics: [
          { month: "Week1", incidents: 2, threats: 5, resolved: 6 },
          { month: "Week2", incidents: 1, threats: 2, resolved: 3 },
          { month: "Week3", incidents: 0, threats: 1, resolved: 1 },
          { month: "Week4", incidents: 2, threats: 3, resolved: 4 },
        ],
      },
      semester: {
        attendanceTrends: Array.from({ length: 12 }).map((_, i) => ({
          date: `S${i + 1}`,
          present: 38 + Math.round(Math.random() * 8),
          total: 45,
          percentage: 80 + Math.round(Math.random() * 18),
        })),
        verificationData: [
          { method: "Face Recognition", success: 97.8, failed: 2.2, count: 15000 },
          { method: "Fingerprint", success: 98.9, failed: 1.1, count: 14800 },
          { method: "NFC Presence", success: 99.5, failed: 0.5, count: 14950 },
        ],
        riskStudents: [
          { name: "gopinath", attendance: 60, trend: "down", risk: "high" },
          { name: "deepak", attendance: 68, trend: "down", risk: "medium" },
          { name: "ashvath", attendance: 71, trend: "stable", risk: "medium" },
          { name: "hari ram", attendance: 76, trend: "up", risk: "low" },
        ],
        timeDistribution: [
          { time: "8-9", count: 180, color: "#3b82f6" },
          { time: "9-10", count: 420, color: "#06b6d4" },
          { time: "10-11", count: 520, color: "#10b981" },
          { time: "11-12", count: 240, color: "#f59e0b" },
        ],
        securityMetrics: [
          { month: "Jan", incidents: 5, threats: 8, resolved: 10 },
          { month: "Feb", incidents: 3, threats: 6, resolved: 7 },
          { month: "Mar", incidents: 2, threats: 4, resolved: 5 },
          { month: "Apr", incidents: 4, threats: 7, resolved: 8 },
        ],
      },
      year: {
        attendanceTrends: [
          { date: "Jan", present: 39, total: 45, percentage: 86.7 },
          { date: "Feb", present: 41, total: 45, percentage: 91.1 },
          { date: "Mar", present: 43, total: 45, percentage: 95.6 },
          { date: "Apr", present: 38, total: 45, percentage: 84.4 },
          { date: "May", present: 42, total: 45, percentage: 93.3 },
          { date: "Jun", present: 40, total: 45, percentage: 88.9 },
          { date: "Jul", present: 44, total: 45, percentage: 97.8 },
          { date: "Aug", present: 37, total: 45, percentage: 82.2 },
          { date: "Sep", present: 41, total: 45, percentage: 91.1 },
          { date: "Oct", present: 43, total: 45, percentage: 95.6 },
          { date: "Nov", present: 40, total: 45, percentage: 88.9 },
          { date: "Dec", present: 42, total: 45, percentage: 93.3 },
        ],
        verificationData: [
          { method: "Face Recognition", success: 98.0, failed: 2.0, count: 60000 },
          { method: "Fingerprint", success: 99.1, failed: 0.9, count: 59000 },
          { method: "NFC Presence", success: 99.6, failed: 0.4, count: 59500 },
        ],
        riskStudents: [
          { name: "Annual Risk Group", attendance: 66, trend: "down", risk: "high" },
          { name: "Quarterly Watch", attendance: 70, trend: "down", risk: "medium" },
        ],
        timeDistribution: [
          { time: "8-9", count: 2200, color: "#3b82f6" },
          { time: "9-10", count: 4300, color: "#06b6d4" },
          { time: "10-11", count: 5200, color: "#10b981" },
          { time: "11-12", count: 2100, color: "#f59e0b" },
        ],
        securityMetrics: [
          { month: "Q1", incidents: 10, threats: 18, resolved: 20 },
          { month: "Q2", incidents: 8, threats: 12, resolved: 15 },
          { month: "Q3", incidents: 6, threats: 10, resolved: 12 },
          { month: "Q4", incidents: 9, threats: 14, resolved: 16 },
        ],
      },
    };
  }, []);

  const {
    attendanceTrends,
    verificationData,
    riskStudents,
    timeDistribution,
    securityMetrics,
  } = dataByPeriod[selectedPeriod];

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const buildCSVForCurrentPeriod = () => {
    const rows: string[][] = [];

    rows.push([`Report for:`, selectedPeriod.toUpperCase()]);
    rows.push([]);
    rows.push(["Attendance Trends"]);
    rows.push(["Label", "Present", "Total", "Percentage"]);
    attendanceTrends.forEach((r) => rows.push([String(r.date), String(r.present), String(r.total), String(r.percentage)]));

    rows.push([]);
    rows.push(["Verification Performance"]);
    rows.push(["Method", "Success%", "Failed%", "Count"]);
    verificationData.forEach((v) => rows.push([v.method, String(v.success), String(v.failed), String(v.count)]));

    rows.push([]);
    rows.push(["At-Risk Students"]);
    rows.push(["Name", "Attendance%", "Trend", "Risk"]);
    riskStudents.forEach((s) => rows.push([s.name, String(s.attendance), s.trend, s.risk]));

    rows.push([]);
    rows.push(["Check-in Time Distribution"]);
    rows.push(["Time", "Count"]);
    timeDistribution.forEach((t) => rows.push([t.time, String(t.count)]));

    rows.push([]);
    rows.push(["Security Metrics"]);
    rows.push(["Label", "Incidents", "Threats", "Resolved"]);
    securityMetrics.forEach((m) => rows.push([m.month, String(m.incidents), String(m.threats), String(m.resolved)]));

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    return "\uFEFF" + csv;
  };

  // Export printable HTML and CSV (used for Export Report and Generate Report)
  const exportReport = async () => {
    try {
      setIsExporting(true);

      const html = `
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Attendance Report — ${selectedPeriod}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; padding: 20px; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin-top: 18px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; text-align: left; }
            th { background: #f7f7f7; }
            .meta { color: #666; font-size: 12px; margin-bottom: 8px; }
            .section { margin-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Attendance & Verification Report</h1>
          <div class="meta">Period: ${selectedPeriod.toUpperCase()} • Generated: ${new Date().toLocaleString()}</div>

          <h2>Attendance Trends</h2>
          <table>
            <thead><tr><th>Label</th><th>Present</th><th>Total</th><th>Percentage</th></tr></thead>
            <tbody>
              ${attendanceTrends.map(r => `<tr><td>${r.date}</td><td>${r.present}</td><td>${r.total}</td><td>${r.percentage}</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Verification Performance</h2>
          <table>
            <thead><tr><th>Method</th><th>Success%</th><th>Failed%</th><th>Count</th></tr></thead>
            <tbody>
              ${verificationData.map(v => `<tr><td>${v.method}</td><td>${v.success}</td><td>${v.failed}</td><td>${v.count}</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>At-Risk Students</h2>
          <table>
            <thead><tr><th>Name</th><th>Attendance%</th><th>Trend</th><th>Risk</th></tr></thead>
            <tbody>
              ${riskStudents.map(s => `<tr><td>${s.name}</td><td>${s.attendance}</td><td>${s.trend}</td><td>${s.risk}</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Check-in Time Distribution</h2>
          <table>
            <thead><tr><th>Time</th><th>Count</th></tr></thead>
            <tbody>
              ${timeDistribution.map(t => `<tr><td>${t.time}</td><td>${t.count}</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Security Metrics</h2>
          <table>
            <thead><tr><th>Label</th><th>Incidents</th><th>Threats</th><th>Resolved</th></tr></thead>
            <tbody>
              ${securityMetrics.map(m => `<tr><td>${m.month}</td><td>${m.incidents}</td><td>${m.threats}</td><td>${m.resolved}</td></tr>`).join("")}
            </tbody>
          </table>

          <script>
            window.onload = function() { setTimeout(() => { window.print(); }, 200); }
            window.onafterprint = function() { setTimeout(() => window.close(), 200); }
          </script>
        </body>
        </html>
      `;

      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) throw new Error("Popup blocked");
      w.document.open();
      w.document.write(html);
      w.document.close();

      const csv = buildCSVForCurrentPeriod();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const filename = `report_${selectedPeriod}_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.csv`;
      setTimeout(() => downloadBlob(blob, filename), 600);

      setToastMessage("Report prepared.");
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export report (popup blocked?).");
    } finally {
      setIsExporting(false);
    }
  };

  // New: send alerts to risk students for the selected period (demo)
  const sendAlertsForRisk = async () => {
    try {
      setIsSendingAlerts(true);
      const recipients = riskStudents.slice(); // shallow copy

      // simulate sending latency proportional to recipients
      await new Promise((res) => setTimeout(res, 600 + recipients.length * 220));

      // For demo, we just log and show toast
      console.info(`Alerts sent for period=${selectedPeriod} to:`, recipients.map(r => r.name));
      setToastMessage(`Alerts sent to ${recipients.length} students.`);
    } catch (err) {
      console.error("Send alerts failed", err);
      setToastMessage("Failed to send alerts.");
    } finally {
      setIsSendingAlerts(false);
    }
  };

  // generate risk report -> reuse exportReport but show a toast specifically
  const generateRiskReport = async () => {
    setToastMessage("Generating risk report...");
    await exportReport();
    setToastMessage("Risk report generated.");
  };

  // UI: metrics derived from current data
  const avgAttendance = useMemo(() => {
    const avg = attendanceTrends.reduce((s, r) => s + (r.percentage || 0), 0) / attendanceTrends.length;
    return avg.toFixed(1);
  }, [attendanceTrends]);

  const verificationSuccessAvg = useMemo(() => {
    const avg = verificationData.reduce((s, v) => s + (v.success || 0), 0) / verificationData.length;
    return avg.toFixed(1);
  }, [verificationData]);

  const atRiskCount = riskStudents.length;
  const avgVerifyTime = selectedPeriod === "week" ? "1.8s" : selectedPeriod === "month" ? "1.9s" : "2.0s";

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive attendance insights and security metrics</p>
        </div>

        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">Semester</SelectItem>
              <SelectItem value="year">Academic Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportReport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Preparing..." : `Export Report (${selectedPeriod})`}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{avgAttendance}%</p>
                <p className="text-sm text-muted-foreground">Average Attendance</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <Badge variant="outline" className="mt-2 text-success border-success">
              {Number(avgAttendance) >= 90 ? "+2.3% from prev" : "+0.5%"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{verificationSuccessAvg}%</p>
                <p className="text-sm text-muted-foreground">Verification Success</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="outline" className="mt-2 text-primary border-primary">
              Security Status
            </Badge>
          </CardContent>
        </Card>

        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{atRiskCount}</p>
                <p className="text-sm text-muted-foreground">At-Risk Students</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
            <Badge variant="outline" className="mt-2 text-warning border-warning">
              Needs Attention
            </Badge>
          </CardContent>
        </Card>

        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-secondary">{avgVerifyTime}</p>
                <p className="text-sm text-muted-foreground">Avg Verification Time</p>
              </div>
              <Clock className="w-8 h-8 text-secondary" />
            </div>
            <Badge variant="outline" className="mt-2 text-secondary border-secondary">
              Fast Processing
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Attendance Trends</TabsTrigger>
          <TabsTrigger value="verification">Verification Analytics</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="security">Security Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>Daily/Weekly/Monthly attendance percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceTrends as any}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="percentage" stroke="#0ea5e9" fill="#0ea5e91f" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-in Time Distribution</CardTitle>
                <CardDescription>When students typically arrive</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={timeDistribution as any} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="count" label>
                      {(timeDistribution as any).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>3-Phase Verification Performance</CardTitle>
              <CardDescription>Success rates for each verification method</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={verificationData as any}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="method" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" fill="#10b981" name="Success Rate %" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failure Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {(verificationData as any).map((method: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-foreground">{method.method}</h3>
                    <div className="text-2xl font-bold text-success">{method.success}%</div>
                    <p className="text-sm text-muted-foreground">{method.count} total verifications</p>
                    <Badge variant="outline" className="text-success border-success">High Reliability</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Students Alert System</CardTitle>
              <CardDescription>Students below threshold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskStudents.map((student, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                    student.risk === "high" ? "bg-destructive-light border-destructive" :
                    student.risk === "medium" ? "bg-warning-light border-warning" : "bg-success-light border-success"
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        student.risk === "high" ? "bg-destructive" :
                        student.risk === "medium" ? "bg-warning" : "bg-success"
                      }`} />
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Attendance: {student.attendance}%</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={student.risk === "high" ? "destructive" : student.risk === "medium" ? "secondary" : "default"}>
                        {student.risk.charAt(0).toUpperCase() + student.risk.slice(1)} Risk
                      </Badge>
                      {student.trend === "down" ? <TrendingDown className="w-4 h-4 text-destructive" /> :
                        student.trend === "up" ? <TrendingUp className="w-4 h-4 text-success" /> :
                        <div className="w-4 h-4 bg-muted rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-4">
                <Button onClick={sendAlertsForRisk} disabled={isSendingAlerts}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {isSendingAlerts ? "Sending..." : "Send Alerts"}
                </Button>
                <Button variant="outline" onClick={generateRiskReport} disabled={isExporting}>
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Incident Tracking</CardTitle>
              <CardDescription>Monthly security metrics and threat analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={securityMetrics as any}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="incidents" stroke="#ef4444" name="Security Incidents" />
                  <Line type="monotone" dataKey="threats" stroke="#f59e0b" name="Threats Detected" />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Issues Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-8 h-8 text-success mx-auto" />
                <div className="text-2xl font-bold text-success">99.8%</div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <Badge variant="outline" className="text-success border-success">Excellent</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="w-8 h-8 text-warning mx-auto" />
                <div className="text-2xl font-bold text-warning">14</div>
                <p className="text-sm text-muted-foreground">Threats Blocked</p>
                <Badge variant="outline" className="text-warning border-warning">Active Defense</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">A+</div>
                <p className="text-sm text-muted-foreground">Security Rating</p>
                <Badge variant="outline" className="text-primary border-primary">Top Tier</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-foreground text-white px-4 py-2 rounded shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
