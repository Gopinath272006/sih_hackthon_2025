// FacultyDashboard_with_OD_token.tsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  QrCode,
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  UserX,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react";

type OdStatus =
  | "none"
  | "requested"
  | "accepted"
  | "token_entered"
  | "certificate_submitted"
  | "pass"
  | "pending"
  | "fail";

type Student = {
  id: number;
  name: string;
  status: "verified" | "pending" | "blocked";
  time: string;
  confidence: number;
  odStatus?: OdStatus;
  odToken?: string | null;
  certificateSubmitted?: boolean;
};

export function FacultyDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionActive, setSessionActive] = useState(false);
  const [qrRotation, setQrRotation] = useState(0);
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    total: 45,
    pending: 0,
    verified: 0,
  });

  const [mockStudents, setMockStudents] = useState<Student[]>([
    { id: 1, name: "gopinath", status: "verified", time: "09:02:15", confidence: 0.92, odStatus: "none", odToken: null },
    { id: 2, name: "deepak", status: "verified", time: "09:01:43", confidence: 0.89, odStatus: "none", odToken: null },
    { id: 3, name: "ashvath", status: "pending", time: "09:03:01", confidence: 0.87, odStatus: "requested", odToken: null },
    { id: 4, name: "aravindhan", status: "verified", time: "08:59:32", confidence: 0.94, odStatus: "none", odToken: null },
    { id: 5, name: "hariram", status: "pending", time: "09:02:58", confidence: 0.91, odStatus: "none", odToken: null },
    { id: 6, name: "arun", status: "pending", time: "09:02:58", confidence: 0.91, odStatus: "requested", odToken: null },
    { id: 7, name: "anbu", status: "pending", time: "09:02:58", confidence: 0.91, odStatus: "none", odToken: null },
    { id: 8, name: "arunath", status: "pending", time: "09:02:58", confidence: 0.91, odStatus: "none", odToken: null },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (!sessionActive) return;
    const qrInterval = setInterval(() => {
      setQrRotation((prev) => prev + 1);
      setAttendanceData((prev) => {
        const add = Math.floor(Math.random() * 3); // 0..2
        const newPresent = Math.min(prev.total, prev.present + add);
        const verifiedAdd = Math.floor(Math.random() * (add + 1));
        const newVerified = Math.min(newPresent, prev.verified + verifiedAdd);
        return {
          ...prev,
          present: newPresent,
          verified: newVerified,
          pending: Math.max(0, newPresent - newVerified),
        };
      });

      setMockStudents((prev) => {
        const pendingIndices = prev.map((s, i) => (s.status === "pending" ? i : -1)).filter((i) => i >= 0);
        if (pendingIndices.length === 0) return prev;
        const pick = pendingIndices[Math.floor(Math.random() * pendingIndices.length)];
        const copy = prev.slice();
        // do not flip students that are blocked for OD flow
        if (copy[pick].status !== "blocked") {
          copy[pick] = { ...copy[pick], status: "verified", confidence: Math.min(0.995, copy[pick].confidence + 0.03) };
        }
        return copy;
      });
    }, 3000);

    return () => clearInterval(qrInterval);
  }, [sessionActive]);

  // helper - generate QR token string (mock)
  const generateQRCode = () => {
    const timestamp = Date.now();
    const token = `ATTEND_${timestamp}_${qrRotation}`;
    return token;
  };

  // --- OD helpers + localStorage sync (demo bridge between student <-> faculty pages) ---
  const generateODToken = (studentId: number) => {
    const ts = Date.now().toString().slice(-6);
    return `OD_${studentId}_${ts}`;
  };

  // Accept OD: generate token, block attendance, write token to localStorage for student to pick up.
  const acceptODRequest = (studentId: number) => {
    setMockStudents((prev) => {
      const copy = prev.map((s) => ({ ...s }));
      const idx = copy.findIndex((s) => s.id === studentId);
      if (idx === -1) return prev;
      const token = generateODToken(studentId);
      copy[idx].odStatus = "accepted";
      copy[idx].odToken = token;
      // block normal attendance until certificate verified
      copy[idx].status = "blocked";
      // persist issued token to localStorage so student app can find it (demo only)
      try {
        localStorage.setItem(`od_issued_${studentId}`, token);
      } catch {}
      return copy;
    });
    setToastMessage("OD request accepted — token generated.");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Revoke token
  const revokeODToken = (studentId: number) => {
    setMockStudents((prev) => prev.map(s => s.id === studentId ? { ...s, odStatus: "none", odToken: null, status: "pending" } : s));
    try {
      localStorage.removeItem(`od_issued_${studentId}`);
    } catch {}
    setToastMessage("OD token revoked");
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Simulate student entering token (faculty could also trigger this manually in UI)
  const studentEnterODToken = (studentId: number) => {
    setMockStudents((prev) => {
      const copy = prev.map((s) => ({ ...s }));
      const idx = copy.findIndex((s) => s.id === studentId);
      if (idx === -1) return prev;
      if (copy[idx].odStatus !== "accepted") return prev;
      copy[idx].odStatus = "token_entered";
      copy[idx].status = "blocked";
      return copy;
    });
    setToastMessage("Student entered OD token (simulated).");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Student uploads certificate (simulated by faculty action here) — but we have polling (below) to pick up student submissions.
  const studentSubmitCertificate = (studentId: number) => {
    setMockStudents((prev) => {
      const copy = prev.map((s) => ({ ...s }));
      const idx = copy.findIndex((s) => s.id === studentId);
      if (idx === -1) return prev;
      if (![ "token_entered", "accepted" ].includes(copy[idx].odStatus || "")) return prev;
      copy[idx].odStatus = "certificate_submitted";
      copy[idx].certificateSubmitted = true;
      return copy;
    });
    setToastMessage("Certificate submitted by student (simulated).");
    setTimeout(() => setToastMessage(null), 2000);
  };

  const verifyCertificate = (studentId: number, result: "pass" | "pending" | "fail") => {
    setMockStudents((prev) => {
      const copy = prev.map((s) => ({ ...s }));
      const idx = copy.findIndex((s) => s.id === studentId);
      if (idx === -1) return prev;
      copy[idx].odStatus = result;
      copy[idx].certificateSubmitted = !!(copy[idx].certificateSubmitted);
      if (result === "pass") {
        copy[idx].status = "verified";
        setAttendanceData((ad) => ({ ...ad, present: Math.min(ad.total, ad.present + 1), verified: Math.min(ad.total, ad.verified + 1) }));
      } else if (result === "pending") {
        copy[idx].status = "pending";
      } else {
        copy[idx].status = "pending";
      }
      // cleanup issued token entry after verification
      try {
        localStorage.removeItem(`od_issued_${studentId}`);
      } catch {}
      return copy;
    });
    setToastMessage(`Certificate verification: ${result.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // localStorage polling to pick up student-side actions (demo only)
  useEffect(() => {
    let mounted = true;
    const syncFromStorage = () => {
      if (!mounted) return;
      try {
        // 1) OD requests list
        const raw = localStorage.getItem("od_requests");
        const requests = raw ? JSON.parse(raw) : [];
        if (Array.isArray(requests) && requests.length > 0) {
          setMockStudents((prev) => {
            const copy = prev.map(s => ({ ...s }));
            for (const req of requests) {
              const idx = copy.findIndex(x => x.id === req.studentId);
              if (idx >= 0 && copy[idx].odStatus !== "requested" && copy[idx].odStatus !== "accepted" && copy[idx].odStatus !== "certificate_submitted") {
                copy[idx].odStatus = "requested";
              }
            }
            return copy;
          });
        }

        // 2) OD token entries by students
        const rawEntries = localStorage.getItem("od_token_entries");
        const entries = rawEntries ? JSON.parse(rawEntries) : [];
        if (Array.isArray(entries) && entries.length > 0) {
          setMockStudents((prev) => {
            const copy = prev.map(s => ({ ...s }));
            for (const e of entries) {
              const idx = copy.findIndex(x => x.id === e.studentId);
              if (idx >= 0) {
                // If an issued token exists and matches, mark token_entered
                const issued = localStorage.getItem(`od_issued_${e.studentId}`);
                if (issued && issued === e.token) {
                  copy[idx].odStatus = "token_entered";
                  copy[idx].odToken = issued;
                } else {
                  // if token doesn't match (demo) — still mark token_entered for manual review
                  copy[idx].odStatus = "token_entered";
                  copy[idx].odToken = e.token;
                }
                copy[idx].status = "blocked";
              }
            }
            return copy;
          });
        }

        // 3) Certificates uploaded by student
        const rawCerts = localStorage.getItem("od_certificates");
        const certs = rawCerts ? JSON.parse(rawCerts) : [];
        if (Array.isArray(certs) && certs.length > 0) {
          setMockStudents((prev) => {
            const copy = prev.map(s => ({ ...s }));
            for (const c of certs) {
              const idx = copy.findIndex(x => x.id === c.studentId);
              if (idx >= 0) {
                copy[idx].odStatus = "certificate_submitted";
                copy[idx].certificateSubmitted = true;
              }
            }
            return copy;
          });
        }
      } catch (err) {
        // ignore parse errors
      }
    };

    // initial sync and polling
    syncFromStorage();
    const iv = setInterval(syncFromStorage, 1500);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  // --- Utilities for file download + CSV ---
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

  const toCSV = (rows: string[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    return "\uFEFF" + csv;
  };

  // Export Excel => CSV file (includes OD fields)
  const exportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const rows: string[][] = [
        ["ID", "Name", "Status", "Check-in Time", "Confidence", "OD Status", "OD Token"],
        ...mockStudents.map((s) => [s.id.toString(), s.name, s.status, s.time, (s.confidence * 100).toFixed(0) + "%", s.odStatus || "none", s.odToken || ""]),
      ];
      const csv = toCSV(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const fileName = `attendance_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.csv`;
      downloadBlob(blob, fileName);
      setToastMessage("CSV exported — opens in Excel.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Export Excel failed", err);
      setToastMessage("Failed to export CSV.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export PDF => open printable window and trigger print dialog so user can Save as PDF. Includes OD fields.
  const exportPDF = async () => {
    try {
      setIsExportingPDF(true);

      const html = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 6px; }
            .meta { font-size: 12px; color: #555; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f7f7f7; }
            .summary { margin-top: 12px; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>Attendance Report — ${new Date().toLocaleString()}</h1>
          <div class="meta">Course: CS-301 • Generated by Faculty Dashboard</div>
          <div class="summary">
            Present: ${attendanceData.present} • Verified: ${attendanceData.verified} • Pending: ${attendanceData.pending} • Total: ${attendanceData.total}
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Status</th><th>Check-in</th><th>Confidence</th><th>OD Status</th><th>OD Token</th>
              </tr>
            </thead>
            <tbody>
              ${mockStudents.map(s => `
                <tr>
                  <td>${s.id}</td>
                  <td>${s.name}</td>
                  <td>${s.status}</td>
                  <td>${s.time}</td>
                  <td>${(s.confidence*100).toFixed(0)}%</td>
                  <td>${s.odStatus || "none"}</td>
                  <td>${s.odToken || ""}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function(){ window.print(); }, 300);
            };
            window.onafterprint = function() { setTimeout(function(){ window.close(); }, 200); };
          </script>
        </body>
      </html>`;

      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) throw new Error("Popup blocked");
      w.document.open();
      w.document.write(html);
      w.document.close();

      setToastMessage("Printable report opened. Use Save as PDF in print dialog.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Export PDF failed", err);
      setToastMessage("Failed to open printable report (popup blocked?).");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Refresh data => simulate fetch and randomize attendance
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await new Promise((res) => setTimeout(res, 900));

      setAttendanceData((prev) => {
        const present = Math.min(prev.total, Math.max(0, prev.present + (Math.floor(Math.random() * 5) - 1)));
        const verified = Math.min(prev.total, Math.max(0, prev.verified + (Math.floor(Math.random() * 3) - 1)));
        return {
          ...prev,
          present,
          verified: Math.min(present, verified),
          pending: Math.max(0, present - Math.min(present, verified)),
        };
      });

      setMockStudents((prev) => {
        const copy = prev.map(s => ({ ...s }));
        for (let i = 0; i < 2; i++) {
          const pending = copy.filter(c => c.status === "pending");
          if (pending.length === 0) break;
          const pick = pending[Math.floor(Math.random() * pending.length)];
          const idx = copy.findIndex(x => x.id === pick.id);
          if (idx >= 0 && Math.random() > 0.4) {
            if (copy[idx].odStatus && ["accepted", "token_entered", "certificate_submitted"].includes(copy[idx].odStatus!)) continue;
            copy[idx].status = "verified";
            copy[idx].confidence = Math.min(0.99, copy[idx].confidence + 0.04);
            copy[idx].time = new Date().toLocaleTimeString();
          }
        }
        if (Math.random() > 0.7 && copy.length < attendanceData.total) {
          const id = copy.length + 1;
          copy.push({
            id,
            name: `Student ${id}`,
            status: Math.random() > 0.6 ? "verified" : "pending",
            time: new Date().toLocaleTimeString(),
            confidence: 0.75 + Math.random() * 0.25,
            odStatus: "none",
            odToken: null,
          });
        }
        return copy;
      });

      setToastMessage("Data refreshed.");
      setTimeout(() => setToastMessage(null), 2000);
    } catch (err) {
      console.error("Refresh failed", err);
      setToastMessage("Failed to refresh.");
      setTimeout(() => setToastMessage(null), 2000);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Send alerts => simulate sending notifications to all pending students
  const sendAlerts = async () => {
    try {
      setIsSendingAlerts(true);
      const pending = mockStudents.filter(s => s.status === "pending");
      await new Promise((res) => setTimeout(res, 700 + pending.length * 120));
      console.info("Alerts sent to:", pending.map(p => p.name));
      setToastMessage(`Alerts sent to ${pending.length} pending students.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Send alerts failed", err);
      setToastMessage("Failed to send alerts.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSendingAlerts(false);
    }
  };

  const presentPct = attendanceData.total > 0 ? (attendanceData.present / attendanceData.total) * 100 : 0;
  const verifiedPct = attendanceData.present > 0 ? (attendanceData.verified / Math.max(1, attendanceData.present)) * 100 : 0;
  const pendingPct = attendanceData.total > 0 ? (attendanceData.pending / attendanceData.total) * 100 : 0;
  const absentPct = attendanceData.total > 0 ? ((attendanceData.total - attendanceData.present) / attendanceData.total) * 100 : 0;

  const odRequests = mockStudents.filter((s) => s.odStatus && s.odStatus !== "none" && s.odStatus !== "pass" && s.odStatus !== "fail");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground">CS-301: Advanced Algorithms</p>
          <p className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={sessionActive ? "destructive" : "default"}
            onClick={() => setSessionActive(!sessionActive)}
            className="shadow-medium"
          >
            {sessionActive ? <Pause className="mr-2 w-4 h-4" /> : <Play className="mr-2 w-4 h-4" />}
            {sessionActive ? "End Session" : "Start Session"}
          </Button>
          <Badge variant={sessionActive ? "default" : "secondary"}>
            {sessionActive ? "Live Session" : "Session Inactive"}
          </Badge>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{attendanceData.present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
            <Progress value={presentPct} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{attendanceData.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <Progress value={verifiedPct} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{attendanceData.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <Progress value={pendingPct} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="data-stream">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-muted-foreground">{attendanceData.total - attendanceData.present}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
              <UserX className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress value={absentPct} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* QR Code Generator */}
        <div className="lg:col-span-1">
          <Card className={`${sessionActive ? "border-primary shadow-glow" : ""} transition-all duration-smooth`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Live QR Code</span>
              </CardTitle>
              <CardDescription>{sessionActive ? "Rotating every 3 seconds" : "Start session to generate QR"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionActive ? (
                <div className="space-y-4">
                  <div className={`w-full h-48 bg-gradient-scan rounded-lg flex items-center justify-center ${sessionActive ? "qr-rotate scan-animation" : ""}`}>
                    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-primary" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-mono text-sm bg-muted p-2 rounded">{generateQRCode()}</p>
                    <Badge variant="outline" className="text-xs">Rotation #{qrRotation}</Badge>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <QrCode className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">QR Code Inactive</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  setQrRotation(r => r + 1);
                  setToastMessage("QR rotated.");
                  setTimeout(() => setToastMessage(null), 1500);
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>

                <Button variant="outline" size="sm" className="flex-1" onClick={exportExcel} disabled={isExportingExcel}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Attendance Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Live Attendance Feed</span>
              </CardTitle>
              <CardDescription>Real-time verification status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {mockStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-lg border transition-all duration-smooth ${
                      student.status === "verified"
                        ? "bg-success-light border-success verify-success"
                        : student.status === "blocked"
                        ? "bg-slate-100 border-muted"
                        : "bg-warning-light border-warning"
                    }`}
                  >
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <div className={`w-2 h-2 rounded-full ${student.status === "verified" ? "bg-success animate-pulse" : student.status === "blocked" ? "bg-gray-500" : "bg-warning"}`} />
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Confidence: {(student.confidence * 100).toFixed(0)}%</p>
                        {student.odStatus && student.odStatus !== "none" && (
                          <p className="text-xs text-muted-foreground">OD: {student.odStatus} {student.odToken ? `• token: ${student.odToken}` : ""}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 md:mt-0 flex items-center space-x-3">
                      {/* Show small attendance badges: P / F / OD */}
                      <div className="flex items-center space-x-1">
                        <Badge variant={student.status === "verified" ? "default" : "secondary"} className="text-xs">P</Badge>
                        <Badge variant={student.odStatus === "fail" ? "destructive" : "outline"} className="text-xs">F</Badge>
                        <Badge variant={student.odStatus && student.odStatus !== "none" ? "default" : "secondary"} className="text-xs">OD</Badge>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mt-1">{student.time}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {sessionActive && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>Monitoring for new check-ins...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OD Requests Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>OD Requests</span>
          </CardTitle>
          <CardDescription>Approve requests, generate token, verify certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {odRequests.length === 0 && <p className="text-sm text-muted-foreground">No active OD requests.</p>}

            {odRequests.map((r) => (
              <div key={r.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-lg border bg-white">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">OD status: {r.odStatus}</p>
                </div>

                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  {r.odStatus === "requested" && (
                    <>
                      <Button size="sm" onClick={() => acceptODRequest(r.id)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => { setMockStudents((prev) => prev.map(s => s.id === r.id ? { ...s, odStatus: 'none', odToken: null } : s)); setToastMessage('OD request rejected'); setTimeout(() => setToastMessage(null), 1800); }}>Reject</Button>
                    </>
                  )}

                  {r.odStatus === "accepted" && (
                    <>
                      <Button size="sm" onClick={() => studentEnterODToken(r.id)}>Simulate Token Entered</Button>
                      <Button size="sm" variant="outline" onClick={() => revokeODToken(r.id)}>Revoke</Button>
                    </>
                  )}

                  {r.odStatus === "token_entered" && (
                    <>
                      <Button size="sm" onClick={() => studentSubmitCertificate(r.id)}>Simulate Certificate</Button>
                    </>
                  )}

                  {r.odStatus === "certificate_submitted" && (
                    <>
                      <Button size="sm" onClick={() => verifyCertificate(r.id, 'pass')}>Pass</Button>
                      <Button size="sm" variant="outline" onClick={() => verifyCertificate(r.id, 'pending')}>Pending</Button>
                      <Button size="sm" variant="destructive" onClick={() => verifyCertificate(r.id, 'fail')}>Fail</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Session Management</span>
          </CardTitle>
          <CardDescription>Control attendance session and export data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={exportExcel} disabled={isExportingExcel}>
              <Download className="w-4 h-4 mr-2" />
              {isExportingExcel ? "Exporting..." : "Export Excel"}
            </Button>

            <Button variant="outline" onClick={exportPDF} disabled={isExportingPDF}>
              <Download className="w-4 h-4 mr-2" />
              {isExportingPDF ? "Preparing..." : "Export PDF"}
            </Button>

            <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>

            <Button variant="outline" onClick={sendAlerts} disabled={isSendingAlerts}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              {isSendingAlerts ? "Sending..." : "Send Alerts"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple toast / status message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-foreground text-white px-4 py-2 rounded shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;

