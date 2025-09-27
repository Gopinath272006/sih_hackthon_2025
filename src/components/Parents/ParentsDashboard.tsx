// src/components/ParentsDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Users,
  Bell,
  Mail,
  Download,
  AlertTriangle,
  User,
  CheckCircle,
  Clock,
  Play,
  Pause,
  MessageCircle,
} from "lucide-react";

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
} from "recharts";

/**
 * ParentsDashboard
 * - Combines analytics + faculty UI patterns into a parent-facing dashboard
 * - Mobile-first responsive layout (cards keep consistent height)
 * - Mocked data and simulated actions so you can demo instantly
 */

type Child = {
  id: string;
  name: string;
  course?: string;
  avgAttendance: number; // percent
  lastSeen?: string;
  recentTrend: { label: string; percentage: number }[];
  contactEmail?: string;
  notificationsEnabled?: boolean;
};

const MOCK_CHILDREN: Child[] = [
  {
    id: "gopinath_1758468755980",
    name: "Gopinath",
    course: "CS-301",
    avgAttendance: 91.2,
    lastSeen: new Date().toLocaleTimeString(),
    recentTrend: [
      { label: "Mon", percentage: 93 },
      { label: "Tue", percentage: 89 },
      { label: "Wed", percentage: 98 },
      { label: "Thu", percentage: 84 },
      { label: "Fri", percentage: 91 },
    ],
    contactEmail: "parent@example.com",
    notificationsEnabled: true,
  },
  {
    id: "deepak_001",
    name: "Deepak",
    course: "CS-301",
    avgAttendance: 68.5,
    lastSeen: new Date().toLocaleTimeString(),
    recentTrend: [
      { label: "Mon", percentage: 70 },
      { label: "Tue", percentage: 66 },
      { label: "Wed", percentage: 69 },
      { label: "Thu", percentage: 67 },
      { label: "Fri", percentage: 68 },
    ],
    contactEmail: "deepak.parent@example.com",
    notificationsEnabled: false,
  },
];

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function ParentsDashboard() {
  const [children] = useState<Child[]>(MOCK_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0].id);
  const selectedChild = useMemo(() => children.find(c => c.id === selectedChildId) || children[0], [children, selectedChildId]);

  const [period, setPeriod] = useState<"week" | "month" | "semester">("week");
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [subscribeAlerts, setSubscribeAlerts] = useState<boolean>(!!selectedChild.notificationsEnabled);

  useEffect(() => {
    setSubscribeAlerts(!!selectedChild.notificationsEnabled);
    // keep toast short
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast, selectedChild]);

  // rebuild chart data based on period (simple transform of recentTrend)
  const attendanceChartData = useMemo(() => {
    // For demo, map selectedChild.recentTrend to periods
    const base = selectedChild.recentTrend || [{ label: "Day", percentage: selectedChild.avgAttendance }];
    if (period === "week") return base;
    if (period === "month") {
      return Array.from({ length: 4 }).map((_, i) => ({
        label: `W${i + 1}`,
        percentage: Math.max(50, Math.round(selectedChild.avgAttendance + (Math.random() - 0.5) * 8)),
      }));
    }
    // semester
    return Array.from({ length: 6 }).map((_, i) => ({
      label: `M${i + 1}`,
      percentage: Math.max(45, Math.round(selectedChild.avgAttendance + (Math.random() - 0.5) * 10)),
    }));
  }, [selectedChild, period]);

  const verificationPie = useMemo(() => {
    // mock verification breakdown (face/fingerprint/nfc)
    return [
      { name: "Face", value: 65, color: COLORS[0] },
      { name: "Fingerprint", value: 25, color: COLORS[2] },
      { name: "NFC", value: 10, color: COLORS[1] },
    ];
  }, []);

  const lowAttendance = selectedChild.avgAttendance < 75;

  // Export CSV / printable report (simulate)
  const exportReport = async () => {
    try {
      setIsExporting(true);
      const rows: string[][] = [
        ["Parent Report", selectedChild.name],
        ["Generated", new Date().toLocaleString()],
        [],
        ["Attendance Trend"],
        ["Label", "Percentage"],
        ...attendanceChartData.map((r) => [r.label, String(r.percentage)]),
        [],
        ["Summary", `Average Attendance: ${selectedChild.avgAttendance}%`],
      ];
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parent_report_${selectedChild.name.replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast("Report exported");
    } catch (err) {
      console.error(err);
      setToast("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Send alert to parent (simulated)
  const sendAlertToParent = async (type: "email" | "push" = "email") => {
    try {
      setSendingAlert(true);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));
      setToast(type === "email" ? "Alert email sent to parent." : "Push notification triggered.");
    } catch (err) {
      console.error(err);
      setToast("Failed to send alert.");
    } finally {
      setSendingAlert(false);
    }
  };

  // Message teacher (simulated)
  const sendMessage = async () => {
    if (!message.trim()) return setToast("Type a message first");
    try {
      setSendingAlert(true);
      await new Promise((r) => setTimeout(r, 600));
      setMessage("");
      setToast("Message sent to faculty");
    } catch {
      setToast("Send failed");
    } finally {
      setSendingAlert(false);
    }
  };

  // Toggle local subscription (demo)
  const toggleSubscribe = () => {
    setSubscribeAlerts((v) => {
      const next = !v;
      setToast(next ? "Subscribed to low-attendance alerts" : "Unsubscribed from alerts");
      return next;
    });
  };

  // small components
  const SmallStat = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Parent Dashboard</h1>
              <p className="text-sm text-muted-foreground">Overview for your child’s attendance & verification</p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={selectedChildId} onValueChange={(v) => setSelectedChildId(v)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {c.course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportReport} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SmallStat label="Avg Attendance" value={`${selectedChild.avgAttendance.toFixed(1)}%`} icon={<Users className="w-6 h-6 text-indigo-600" />} />
        <SmallStat label="Last Seen" value={selectedChild.lastSeen || "—"} icon={<Clock className="w-6 h-6 text-emerald-600" />} />
        <SmallStat label="Alerts Subscribed" value={subscribeAlerts ? "Yes" : "No"} icon={<Bell className="w-6 h-6 text-yellow-600" />} />
        <SmallStat label="Verification Reliability" value="High" icon={<CheckCircle className="w-6 h-6 text-green-600" />} />
      </div>

      {/* Main content: charts + actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Card: Attendance Trend */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
              <CardDescription>Track attendance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="semester">This Semester</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant={lowAttendance ? "destructive" : "default"}>
                    {lowAttendance ? "Low Attendance" : "Good"}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">Avg: {selectedChild.avgAttendance}%</div>
              </div>

              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={attendanceChartData as any} margin={{ top: 0, right: 12, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="percentage" stroke="#0ea5e9" fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-1">
                  <p className="text-sm text-muted-foreground">This Period</p>
                  <p className="font-semibold">{attendanceChartData.map((d) => d.percentage).reduce((a, b) => a + b, 0) / attendanceChartData.length | 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="font-semibold">{Math.round((selectedChild.avgAttendance / 100) * 45)}/{45}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Missed</p>
                  <p className="font-semibold">{Math.max(0, 45 - Math.round((selectedChild.avgAttendance / 100) * 45))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className="font-semibold">{attendanceChartData.length > 1 && attendanceChartData[attendanceChartData.length - 1].percentage >= attendanceChartData[0].percentage ? "Up" : "Down"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Verification breakdown + actions */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Verification Breakdown</CardTitle>
              <CardDescription>How attendance was verified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={verificationPie as any} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                        {(verificationPie as any).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Quick Actions</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <Button onClick={() => sendAlertToParent("push")} disabled={sendingAlert}>
                      <Bell className="w-4 h-4 mr-2" /> Send Push Alert
                    </Button>
                    <Button variant="outline" onClick={() => sendAlertToParent("email")} disabled={sendingAlert}>
                      <Mail className="w-4 h-4 mr-2" /> Send Email Alert
                    </Button>

                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm">Low-attendance alerts</label>
                      <Button variant="ghost" onClick={toggleSubscribe} className="ml-auto">
                        {subscribeAlerts ? "Unsubscribe" : "Subscribe"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {verificationPie.map((v) => (
                  <div key={v.name} className="p-3 rounded border flex items-center gap-3">
                    <div className="w-3 h-8" style={{ background: v.color }} />
                    <div>
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: alerts, messages, recent sessions */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Alerts & Messages</CardTitle>
              <CardDescription>Communicate with school & manage alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">Quick message to faculty</div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a short message (e.g. 'My child is sick today')"
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={sendMessage} disabled={sendingAlert}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Send Message
                  </Button>
                  <Button variant="outline" onClick={() => { setMessage(""); }}>
                    Clear
                  </Button>
                </div>

                <div className="mt-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Custom Alerts</p>
                      <p className="text-xs text-muted-foreground">Send alert when attendance drops below threshold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{selectedChild.avgAttendance}%</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="destructive" onClick={() => sendAlertToParent("email")} disabled={sendingAlert || !lowAttendance}>
                      <AlertTriangle className="w-4 h-4 mr-2" /> Alert Now
                    </Button>
                    <Button variant="outline" onClick={() => setToast("Alert schedule set (demo)")}>
                      Schedule Alert
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest attendance checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceChartData.slice().reverse().map((r, i) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${r.percentage >= 75 ? "bg-green-500" : "bg-amber-500"}`} />
                      <div>
                        <div className="font-medium">{r.label}</div>
                        <div className="text-xs text-muted-foreground">Checked at {new Date().toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-right font-semibold">{r.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button onClick={() => setToast("Attendance history opened (demo)")}>View full history</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parental Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Notification Channel</p>
                    <p className="text-xs text-muted-foreground">Email: {selectedChild.contactEmail}</p>
                  </div>
                  <div>
                    <Button variant="outline" onClick={() => setToast("Notification preference updated (demo)")}>Edit</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-sm">Low Attendance Threshold</p>
                    <p className="text-xs text-muted-foreground">Alert if below 75%</p>
                  </div>
                  <div>
                    <Badge variant={lowAttendance ? "destructive" : "default"}>{lowAttendance ? "Triggered" : "OK"}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fixed right-6 bottom-6 bg-foreground text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </motion.div>
      )}
    </div>
  );
}

export default ParentsDashboard;
