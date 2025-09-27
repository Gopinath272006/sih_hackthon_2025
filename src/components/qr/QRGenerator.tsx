// QRGenerator.tsx
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  QrCode,
  Play,
  Pause,
  RefreshCw,
  Download,
  Settings,
  Clock,
  Shield,
  Copy,
  CheckCircle,
} from "lucide-react";

import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * QRGenerator
 *
 * - Adds a persistent issuerId (stored in localStorage) and includes it inside every QR payload.
 * - The student scanner will only verify QR payloads whose issuerId matches the stored one.
 */

const ISSUER_STORAGE_KEY = "qr-issuer-id";

function getOrCreateIssuerId() {
  try {
    const existing = localStorage.getItem(ISSUER_STORAGE_KEY);
    if (existing) return existing;
    const id = (crypto && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2, 10);
    localStorage.setItem(ISSUER_STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage may not be available (very rare) — fallback
    return "unknown-issuer";
  }
}

export function QRGenerator() {
  const issuerId = useRef<string>(getOrCreateIssuerId());

  const [isActive, setIsActive] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [rotationCount, setRotationCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [copied, setCopied] = useState(false);

  // Attendance (demo)
  const [presentStudents, setPresentStudents] = useState<string[]>([
    "deepak",
    "ashvath",
    "hari ram",
  ]);
  const [absentStudents, setAbsentStudents] = useState<string[]>([
    "gopinath",
    "anbu",
  ]);

  // Configuration
  const [config, setConfig] = useState({
    rotationInterval: 3,
    sessionDuration: 60,
    encryption: "AES-256",
    classroom: "CS-301-Lab",
    course: "Advanced Algorithms",
  });

  // maintain the last payload (object) so we can render QR & export easily
  const latestPayloadRef = useRef<any>(null);

  const generatePayload = () => {
    const payload = {
      issuerId: issuerId.current, // unique persistent id identifying this generator
      course: config.course,
      classroom: config.classroom,
      config: {
        encryption: config.encryption,
        interval: config.rotationInterval,
        duration: config.sessionDuration,
      },
      session: {
        time: formatTime(sessionTime),
        rotations: rotationCount,
        generatedAt: new Date().toISOString(),
      },
      present: presentStudents,
      absent: absentStudents,
      // include a short session token id so payload is not huge in practice
      id: Math.random().toString(36).slice(2, 10),
    };
    latestPayloadRef.current = payload;
    return payload;
  };

  // produce a data URL for the current payload (QR image)
  const produceQrImage = async (payloadObj: any) => {
    try {
      const s = JSON.stringify(payloadObj);
      const dataUrl = await QRCode.toDataURL(s, { width: 360, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("qrcode generation error", err);
      setQrDataUrl(null);
    }
  };

  // format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // session timer
  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (isActive) {
      t = setInterval(() => setSessionTime((s) => s + 1), 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [isActive]);

  // QR rotation loop
  useEffect(() => {
    let rot: NodeJS.Timeout | null = null;
    const rotateOnce = async () => {
      const payload = generatePayload();
      await produceQrImage(payload);
      setRotationCount((r) => r + 1);
    };

    if (isActive) {
      // initial generate immediately
      rotateOnce();
      rot = setInterval(() => {
        rotateOnce();
      }, config.rotationInterval * 1000);
    }

    return () => {
      if (rot) clearInterval(rot);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, config.rotationInterval, config.course, config.classroom, config.encryption, presentStudents, absentStudents]);

  const copyToClipboard = async () => {
    if (!latestPayloadRef.current) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(latestPayloadRef.current));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn("copy failed", err);
    }
  };

  const startSession = () => {
    setIsActive(true);
    setSessionTime(0);
    setRotationCount(0);
  };

  const stopSession = () => {
    setIsActive(false);
    setQrDataUrl(null);
  };

  // Export to PDF (embed QR image and human-readable tables)
  const exportPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      doc.setFontSize(18);
      doc.text("QR Code Session Report", 40, 48);

      const payload = latestPayloadRef.current || generatePayload();

      // Add QR image (if available). If not available, create from payload now.
      let qrImg = qrDataUrl;
      if (!qrImg) {
        qrImg = await QRCode.toDataURL(JSON.stringify(payload), { width: 360, margin: 2 });
      }

      // Put QR on the left
      const marginLeft = 40;
      const top = 70;
      const qrSize = 180;
      doc.addImage(qrImg, "PNG", marginLeft, top, qrSize, qrSize);

      // Right side: session metadata
      doc.setFontSize(12);
      let x = marginLeft + qrSize + 20;
      let y = top + 10;
      doc.text(`Course: ${payload.course}`, x, y);
      y += 18;
      doc.text(`Classroom: ${payload.classroom}`, x, y);
      y += 18;
      doc.text(`Encryption: ${payload.config.encryption}`, x, y);
      y += 18;
      doc.text(`Rotation Interval: ${payload.config.interval} s`, x, y);
      y += 18;
      doc.text(`Session Duration: ${payload.config.duration} min`, x, y);
      y += 18;
      doc.text(`Active Time: ${payload.session.time}`, x, y);
      y += 18;
      doc.text(`Rotations: ${payload.session.rotations}`, x, y);
      y += 18;
      doc.text(`Generated: ${new Date(payload.session.generatedAt).toLocaleString()}`, x, y);

      // Attendance tables below
      let tableTop = top + qrSize + 30;
      doc.setFontSize(13);
      doc.text("Present Students", marginLeft, tableTop);
      doc.setFontSize(11);
      let rowY = tableTop + 16;
      payload.present.forEach((p: string, i: number) => {
        doc.text(`• ${p}`, marginLeft + 6, rowY + i * 14);
      });

      const absentTop = tableTop + Math.max(20, payload.present.length * 14) + 12;
      doc.setFontSize(13);
      doc.text("Absent Students", marginLeft, absentTop);
      doc.setFontSize(11);
      payload.absent.forEach((p: string, i: number) => {
        doc.text(`• ${p}`, marginLeft + 6, absentTop + 16 + i * 14);
      });

      // Also put raw JSON payload (small) at bottom for debugging / scanning viewers
      const footerY = 780;
      doc.setFontSize(9);
      const jsonStr = JSON.stringify(payload);
      // split long string across lines of ~110 chars
      const chunkSize = 110;
      for (let i = 0; i < jsonStr.length; i += chunkSize) {
        doc.text(jsonStr.substring(i, i + chunkSize), marginLeft, footerY + (i / chunkSize) * 10);
      }

      doc.save(`QR_Session_Report_${payload.id}.pdf`);
    } catch (err) {
      console.error("export pdf error", err);
      alert("Failed to export PDF. See console for details.");
    }
  };

  // small helper to add a present student (demo interactive)
  const demoMarkPresent = (name: string) => {
    setPresentStudents((p) => (p.includes(name) ? p : [...p, name]));
    setAbsentStudents((a) => a.filter((n) => n !== name));
  };

  // animation class toggle for QR whenever data changes
  const qrKey = JSON.stringify({
    issuerId: issuerId.current,
    course: config.course,
    classroom: config.classroom,
    interval: config.rotationInterval,
    presentCount: presentStudents.length,
    absentCount: absentStudents.length,
    rotations: rotationCount,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-scan rounded-full flex items-center justify-center mx-auto">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">QR Code Generator</h1>
          <p className="text-muted-foreground">Generate rotating attendance verification codes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* QR Display */}
        <div className="lg:col-span-2">
          <Card className={`${isActive ? "border-primary shadow-glow" : ""} transition-all duration-smooth`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>Live QR Code</span>
                  </CardTitle>
                  <CardDescription>
                    {isActive ? `Rotating every ${config.rotationInterval} seconds` : "Start session to generate QR codes"}
                  </CardDescription>
                </div>
                <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* QR Code Display (real image) */}
              <div className="text-center">
                {isActive && qrDataUrl ? (
                  <div
                    // key changes will force re-render and CSS animation can be applied via key
                    key={qrKey}
                    className="w-80 h-80 mx-auto bg-gradient-scan rounded-2xl flex items-center justify-center shadow-strong"
                    style={{
                      transition: "transform 420ms ease",
                      transform: "scale(1)",
                    }}
                  >
                    <div className="w-64 h-64 bg-white rounded-xl flex items-center justify-center shadow-medium overflow-hidden">
                      <img src={qrDataUrl} alt="QR code" className="w-full h-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <div className="w-80 h-80 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <QrCode className="w-24 h-24 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="font-semibold text-foreground">QR Code Inactive</h3>
                        <p className="text-sm text-muted-foreground">Start a session to begin generating codes</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Session Info Boxes */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold text-primary">{formatTime(sessionTime)}</p>
                  <p className="text-xs text-muted-foreground">Session Time</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold text-secondary">{rotationCount}</p>
                  <p className="text-xs text-muted-foreground">Rotations</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-bold text-success">{config.rotationInterval}s</p>
                  <p className="text-xs text-muted-foreground">Interval</p>
                </div>
              </div>

              {/* Current Token / Copy */}
              {latestPayloadRef.current && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Current QR Payload (JSON)</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={JSON.stringify(latestPayloadRef.current)} readOnly className="font-mono text-xs bg-background" />
                        <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-shrink-0">
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>{config.encryption} Encrypted</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{config.rotationInterval}s TTL</span>
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        <strong>Issuer ID:</strong> <span className="font-mono">{issuerId.current}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button variant={isActive ? "destructive" : "default"} onClick={isActive ? stopSession : startSession} className="shadow-medium">
                  {isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Session
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </>
                  )}
                </Button>

                {isActive && (
                  <Button variant="outline" onClick={() => { const payload = generatePayload(); produceQrImage(payload); setRotationCount((r) => r + 1); }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Force Rotation
                  </Button>
                )}

                <Button variant="outline" onClick={exportPDF}>
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Session Config</span>
              </CardTitle>
              <CardDescription>Customize QR generation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input id="course" value={config.course} onChange={(e) => setConfig((p) => ({ ...p, course: e.target.value }))} disabled={isActive} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classroom">Classroom</Label>
                <Input id="classroom" value={config.classroom} onChange={(e) => setConfig((p) => ({ ...p, classroom: e.target.value }))} disabled={isActive} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Rotation Interval (seconds)</Label>
                <Select value={String(config.rotationInterval)} onValueChange={(v) => setConfig((p) => ({ ...p, rotationInterval: parseInt(v) }))} disabled={isActive}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 seconds</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Session Duration (minutes)</Label>
                <Select value={String(config.sessionDuration)} onValueChange={(v) => setConfig((p) => ({ ...p, sessionDuration: parseInt(v) }))} disabled={isActive}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="encryption">Encryption</Label>
                <Select value={config.encryption} onValueChange={(v) => setConfig((p) => ({ ...p, encryption: v }))} disabled={isActive}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256">AES-256</SelectItem>
                    <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                    <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Attendance quick demo actions */}
          <Card>
            <CardHeader><CardTitle>Attendance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Present</p>
                <ul className="list-disc ml-5">
                  {presentStudents.map((p) => (<li key={p} className="text-sm">{p}</li>))}
                </ul>
                <p className="text-sm text-muted-foreground mt-3">Absent</p>
                <ul className="list-disc ml-5">
                  {absentStudents.map((a) => (<li key={a} className="text-sm">{a}</li>))}
                </ul>
                <div className="mt-3">
                  <Button onClick={() => demoMarkPresent("gopinath")}>Mark gopinath Present</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


