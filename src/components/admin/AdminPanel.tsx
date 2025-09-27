import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Users,
  Shield,
  Database,
  Bell,
  Trash2,
  Edit,
  Plus,
  Search,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus
} from "lucide-react";

export function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data (moved into state so actions can mutate them)
  const [students, setStudents] = useState([
    { id: 1, name: "gopinath", email: "720723104052@hicet.ac.in", status: "active", enrollment: "2021-09-01", attendance: 94 },
    { id: 2, name: "deepak", email: "720723104038@hicet.ac.in", status: "active", enrollment: "2021-09-01", attendance: 87 },
    { id: 3, name: "ahvath", email: "720723104024@hicet.ac.in", status: "inactive", enrollment: "2020-09-01", attendance: 72 },
    { id: 4, name: "anbu", email: "720723104012@hicet.ac.in", status: "active", enrollment: "2022-01-15", attendance: 96 },
    { id: 5, name: "hariram", email: "720723104058@hicet.ac.in", status: "active", enrollment: "2021-09-01", attendance: 89 },
  ]);

  const [faculty, setFaculty] = useState([
    { id: 1, name: "Dr. karthikeyan", email: "karthikeyancse.hiect.ac.in", department: "data structure", courses: 3, status: "active" },
    { id: 2, name: "Prof. magesh", email: "mageshcse.hicet.ac.in", department: "modern cryptograph and network", courses: 2, status: "active" },
    { id: 3, name: "Dr. priya", email: "priyacse.hicet.ac.in", department: "ML", courses: 4, status: "inactive" },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    attendance: {
      verificationThreshold: 0.85,
      livenessThreshold: 0.80,
      qrRotationInterval: 3,
      sessionTimeout: 120,
      antiSpoofingEnabled: true,
      realTimeUpdates: true
    },
    security: {
      encryptionLevel: "AES-256",
      tokenExpiry: 3,
      maxFailedAttempts: 3,
      ipWhitelisting: false,
      auditLogging: true,
      twoFactorAuth: true
    },
    notifications: {
      lowAttendanceAlerts: true,
      securityIncidents: true,
      systemMaintenance: true,
      weeklyReports: true
    }
  });

  // "Database" metrics (stateful so actions update UI)
  const [databaseSizeMB, setDatabaseSizeMB] = useState(2400); // 2400 MB ~ 2.4 GB
  const [recordCount, setRecordCount] = useState(45234);

  // Action states & toast
  const [isExportingLogs, setIsExportingLogs] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // filtered students for search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // helper to trigger download
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

  // ------------- Implementations -------------

  // Export Logs (creates sample logs and downloads as .log)
  const exportLogs = async () => {
    try {
      setIsExportingLogs(true);

      // Simulated logs — in real app you'd fetch logs from server
      const lines = [
        `[${new Date().toISOString()}] INFO: Attendance system health check ok`,
        `[${new Date().toISOString()}] INFO: Session started by faculty id=23`,
        `[${new Date().toISOString()}] WARN: 2 failed verifications detected`,
        `[${new Date().toISOString()}] INFO: Backup completed`,
      ];
      // add a line per student recent action (mock)
      students.slice(0, 10).forEach(s => {
        lines.push(`[${new Date().toISOString()}] CHECKIN: ${s.email} (${s.name}) status=${s.status}`);
      });

      const content = lines.join("\n");
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const filename = `system-logs-${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.log`;

      // small delay to mimic network or building logs
      await new Promise(res => setTimeout(res, 700));
      downloadBlob(blob, filename);
      setToastMessage("Logs exported.");
    } catch (err) {
      console.error("Export logs failed", err);
      setToastMessage("Failed to export logs.");
    } finally {
      setIsExportingLogs(false);
    }
  };

  // Backup Database (downloads a JSON snapshot)
  const backupDatabase = async () => {
    try {
      setIsBackingUp(true);

      // Create a snapshot object — real production should stream or request from server
      const snapshot = {
        meta: {
          createdAt: new Date().toISOString(),
          records: recordCount,
          sizeMB: databaseSizeMB,
        },
        students,
        faculty,
        settings: systemSettings,
      };

      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const filename = `backup-${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.json`;

      // simulate time to assemble/zip
      await new Promise(res => setTimeout(res, 900));
      downloadBlob(blob, filename);
      setToastMessage("Backup downloaded.");
    } catch (err) {
      console.error("Backup failed", err);
      setToastMessage("Backup failed.");
    } finally {
      setIsBackingUp(false);
    }
  };

  // Optimize Database (simulate reclaiming space and improving stats)
  const optimizeDatabase = async () => {
    try {
      setIsOptimizing(true);
      setToastMessage("Optimizing database...");

      // simulate multi-step optimization with progress
      await new Promise(res => setTimeout(res, 600));
      // simulate compression: reduce size by 5-18%
      const reductionPercent = 5 + Math.floor(Math.random() * 14); // 5..18
      const newSize = Math.max(50, Math.round(databaseSizeMB * (1 - reductionPercent / 100)));

      // simulate vacuum/reindex time
      await new Promise(res => setTimeout(res, 900));
      setDatabaseSizeMB(newSize);

      // also slightly reduce record fragmentation by rounding record count
      setRecordCount(prev => Math.max(0, prev - Math.floor(Math.random() * 20)));

      setToastMessage(`Optimization complete — reclaimed ${reductionPercent}%`);
    } catch (err) {
      console.error("Optimize failed", err);
      setToastMessage("Optimization failed.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Clear Old Records (asks confirm, then removes inactive and very old records)
  const clearOldRecords = async () => {
    const ok = confirm("This will permanently remove inactive and very old records. Proceed?");
    if (!ok) return;

    try {
      setIsCleaning(true);
      setToastMessage("Cleaning old records...");

      // simulate cleaning delay
      await new Promise(res => setTimeout(res, 900));

      // Define criteria: remove students with status 'inactive' OR enrollment older than 2019 (demo)
      const beforeCount = students.length;
      const cleaned = students.filter(s => {
        const enrollYear = new Date(s.enrollment).getFullYear();
        if (s.status === "inactive") return false;
        if (enrollYear < 2019) return false;
        return true;
      });
      const removed = beforeCount - cleaned.length;

      // Update dataset and recordCount & databaseSizeMB accordingly
      setStudents(cleaned);
      setRecordCount(prev => Math.max(0, prev - removed * 3)); // each removed student assumed to reduce ~3 records
      setDatabaseSizeMB(prev => Math.max(50, prev - removed * 2)); // each removal frees ~2 MB (demo)

      setToastMessage(`Clean complete — removed ${removed} records.`);
    } catch (err) {
      console.error("Clean failed", err);
      setToastMessage("Cleaning failed.");
    } finally {
      setIsCleaning(false);
    }
  };

  // Helpers to display formatted sizes
  const formatSize = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">System management and configuration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-success border-success bg-success-light">
            <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
            System Healthy
          </Badge>
          <Button variant="outline" onClick={exportLogs} disabled={isExportingLogs}>
            <Download className="w-4 h-4 mr-2" />
            {isExportingLogs ? "Exporting..." : "Export Logs"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Management */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Student Management</span>
                    </CardTitle>
                    <CardDescription>Manage student accounts and enrollments</CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Student List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Enrolled: {new Date(student.enrollment).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.attendance}%</p>
                          <p className="text-xs text-muted-foreground">Attendance</p>
                        </div>
                        <Badge
                          variant={student.status === 'active' ? 'default' : 'secondary'}
                        >
                          {student.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            // remove single student (demo)
                            if (!confirm(`Delete ${student.name}? This is a demo.`)) return;
                            setStudents(prev => prev.filter(s => s.id !== student.id));
                            setRecordCount(prev => Math.max(0, prev - 1));
                            setToastMessage("Student removed (demo).");
                          }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Faculty Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Faculty</span>
                </CardTitle>
                <CardDescription>Manage faculty accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faculty.map((member) => (
                    <div key={member.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{member.name}</p>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                      <p className="text-xs text-muted-foreground">{member.courses} courses</p>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => {
                    // demo add faculty
                    const id = faculty.length + 1;
                    const newFac = { id, name: `New Faculty ${id}`, email: `f${id}@university.edu`, department: "Unknown", courses: 0, status: "active" };
                    setFaculty(prev => [...prev, newFac]);
                    setToastMessage("Faculty added (demo).");
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Attendance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Attendance Settings</span>
                </CardTitle>
                <CardDescription>Configure verification parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Face Verification Threshold</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      value={systemSettings.attendance.verificationThreshold}
                      min="0.5"
                      max="1.0"
                      step="0.01"
                      className="flex-1"
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, attendance: { ...prev.attendance, verificationThreshold: Number(e.target.value) } }))}
                    />
                    <span className="text-sm text-muted-foreground">{Math.round(systemSettings.attendance.verificationThreshold * 100)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Liveness Detection Threshold</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="number"
                      value={systemSettings.attendance.livenessThreshold}
                      min="0.5"
                      max="1.0"
                      step="0.01"
                      className="flex-1"
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, attendance: { ...prev.attendance, livenessThreshold: Number(e.target.value) } }))}
                    />
                    <span className="text-sm text-muted-foreground">{Math.round(systemSettings.attendance.livenessThreshold * 100)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Rotation Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={systemSettings.attendance.qrRotationInterval}
                    min="1"
                    max="60"
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, attendance: { ...prev.attendance, qrRotationInterval: Number(e.target.value) } }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={systemSettings.attendance.sessionTimeout}
                    min="5"
                    max="300"
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, attendance: { ...prev.attendance, sessionTimeout: Number(e.target.value) } }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Anti-Spoofing Detection</Label>
                    <Switch checked={systemSettings.attendance.antiSpoofingEnabled} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, attendance: { ...prev.attendance, antiSpoofingEnabled: Boolean(v) } }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Real-time Updates</Label>
                    <Switch checked={systemSettings.attendance.realTimeUpdates} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, attendance: { ...prev.attendance, realTimeUpdates: Boolean(v) } }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Configure alert preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Attendance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify when attendance drops below 75%</p>
                    </div>
                    <Switch checked={systemSettings.notifications.lowAttendanceAlerts} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, notifications: { ...prev.notifications, lowAttendanceAlerts: Boolean(v) } }))} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Incidents</Label>
                      <p className="text-sm text-muted-foreground">Immediate alerts for security issues</p>
                    </div>
                    <Switch checked={systemSettings.notifications.securityIncidents} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, notifications: { ...prev.notifications, securityIncidents: Boolean(v) } }))} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Maintenance</Label>
                      <p className="text-sm text-muted-foreground">Scheduled maintenance notifications</p>
                    </div>
                    <Switch checked={systemSettings.notifications.systemMaintenance} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, notifications: { ...prev.notifications, systemMaintenance: Boolean(v) } }))} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Automated attendance summaries</p>
                    </div>
                    <Switch checked={systemSettings.notifications.weeklyReports} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, notifications: { ...prev.notifications, weeklyReports: Boolean(v) } }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Security Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Configuration</span>
                </CardTitle>
                <CardDescription>Advanced security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Encryption Level</Label>
                  <Input value={systemSettings.security.encryptionLevel} readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Token Expiry (seconds)</Label>
                  <Input
                    type="number"
                    value={systemSettings.security.tokenExpiry}
                    min="1"
                    max="300"
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, security: { ...prev.security, tokenExpiry: Number(e.target.value) } }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Failed Attempts</Label>
                  <Input
                    type="number"
                    value={systemSettings.security.maxFailedAttempts}
                    min="1"
                    max="10"
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, security: { ...prev.security, maxFailedAttempts: Number(e.target.value) } }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>IP Whitelisting</Label>
                    <Switch checked={systemSettings.security.ipWhitelisting} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, security: { ...prev.security, ipWhitelisting: Boolean(v) } }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Audit Logging</Label>
                    <Switch checked={systemSettings.security.auditLogging} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, security: { ...prev.security, auditLogging: Boolean(v) } }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Switch checked={systemSettings.security.twoFactorAuth} onCheckedChange={(v) => setSystemSettings(prev => ({ ...prev, security: { ...prev.security, twoFactorAuth: Boolean(v) } }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Security Status</span>
                </CardTitle>
                <CardDescription>Current security metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-success-light rounded-lg">
                    <p className="text-lg font-bold text-success">0</p>
                    <p className="text-xs text-muted-foreground">Active Threats</p>
                  </div>
                  <div className="text-center p-3 bg-warning-light rounded-lg">
                    <p className="text-lg font-bold text-warning">3</p>
                    <p className="text-xs text-muted-foreground">Blocked Attempts</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Firewall Status</span>
                    <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>SSL Certificate</span>
                    <Badge variant="default" className="bg-success text-success-foreground">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Last Security Scan</span>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Vulnerability Score</span>
                    <Badge variant="default" className="bg-success text-success-foreground">A+</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* System Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Database Management</span>
                </CardTitle>
                <CardDescription>Database operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={backupDatabase} disabled={isBackingUp}>
                    <Download className="w-4 h-4 mr-2" />
                    {isBackingUp ? "Backing up..." : "Backup Database"}
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={optimizeDatabase} disabled={isOptimizing}>
                    <Settings className="w-4 h-4 mr-2" />
                    {isOptimizing ? "Optimizing..." : "Optimize Database"}
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={clearOldRecords} disabled={isCleaning}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isCleaning ? "Cleaning..." : "Clean Old Records"}
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    // Restore database demo: toggles students/faculty to original snapshot
                    if (!confirm("Restore demo snapshot? This will reset demo data.")) return;
                    setStudents([
                      { id: 1, name: "gopinath", email: "720723104052@hicet.ac.in", status: "active", enrollment: "2021-09-01", attendance: 94 },
                      { id: 2, name: "deepak", email: "720723104038@hicet.ac.in", status: "active", enrollment: "2021-09-01", attendance: 87 },
                      { id: 3, name: "ashvath", email: "720723104024@hicet.ac.in", status: "inactive", enrollment: "2020-09-01", attendance: 72 },
                      { id: 4, name: "anbu", email: "720723104012@hicet.ac.in", status: "active", enrollment: "2022-01-15", attendance: 96 },
                      { id: 5, name: "haritam", email: "720723104058@hicet.ac.in", status: "active", enrollment: "2021-09-01", attendance: 89 },
                    ]);
                    setFaculty([
                      { id: 1, name: "Dr. Dr. karthikeyan", email: " karthikeyancse.hicet.ac.in", department: "Computer Science", courses: 3, status: "active" },
                      { id: 2, name: "Prof.  magesh", email: " mageshcse.hicet.ac.in", department: "Mathematics", courses: 2, status: "active" },
                      { id: 3, name: "Dr. priya", email: "priyacse.hicet.ac.in", department: "Computer Science", courses: 4, status: "inactive" },
                    ]);
                    setDatabaseSizeMB(2400);
                    setRecordCount(45234);
                    setToastMessage("Restored demo snapshot.");
                  }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Restore Database 
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Database Size</p>
                      <p className="font-medium">{formatSize(databaseSizeMB)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Records</p>
                      <p className="font-medium">{recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Backup</p>
                      <p className="font-medium">2 hours ago</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium text-success">Healthy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>System Health</span>
                </CardTitle>
                <CardDescription>Monitor system performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network I/O</span>
                    <span className="text-sm font-medium">12 MB/s</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => {
                    setToastMessage("Running diagnostics (demo)...");
                    setTimeout(() => setToastMessage("Diagnostics complete."), 1000);
                  }}>
                    <Settings className="w-4 h-4 mr-2" />
                    System Diagnostics
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setToastMessage("Generating report (demo)...");
                    setTimeout(() => setToastMessage("Report ready (demo)."), 900);
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-foreground text-white px-4 py-2 rounded shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
