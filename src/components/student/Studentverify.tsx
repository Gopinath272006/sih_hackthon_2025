// src/components/StudentInterface.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadStudentPhotoToFirestore } from "@/uploadHelpers";

import {
  Camera,
  Fingerprint,
  CheckCircle,
  Smartphone,
  Shield,
  Loader2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * StudentInterfacesthree (layout improved)
 * - Only UI/CSS changes for alignment & responsiveness
 * - No logic changed
 */

export function StudentInterfacesthree() {
  // placeholder student
  const [studentData] = useState({
    name: "gopinath",
    id: "720723104052",
    course: "CS-301: Advanced Algorithms",
    time: new Date().toLocaleTimeString(),
  });

  // camera & preview
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<
    "face-upload" | "face-verify" | null
  >(null);

  // captured photo as data URL
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Upload fields
  const [uploadName, setUploadName] = useState<string>(studentData.name);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);

  // Face verify fields
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceVerifyResult, setFaceVerifyResult] = useState<
    { ok: boolean; name?: string; distance?: number; message?: string } | null
  >(null);

  // WebAuthn states
  const [webauthnStatus, setWebauthnStatus] = useState<string | null>(null);
  const [webauthnResult, setWebauthnResult] = useState<
    { ok: boolean; message?: string; studentId?: string } | null
  >(null);

  // motion variants
  const cardVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
  };

  useEffect(() => {
    return () => stopCameraStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Camera helpers ----------------
  async function openCamera(mode: "face-upload" | "face-verify") {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(s);
      setIsCameraOpen(true);
      setCameraMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("openCamera failed", err);
      setIsCameraOpen(false);
    }
  }

  function stopCameraStream() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOpen(false);
    setCameraMode(null);
    if (videoRef.current) {
      try {
        (videoRef.current as HTMLVideoElement).srcObject = null;
      } catch {}
    }
  }

  async function captureFromVideoToDataUrl() {
    try {
      const video = videoRef.current;
      if (!video) throw new Error("No video element");
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhoto(dataUrl);
      stopCameraStream();
      return dataUrl;
    } catch (e) {
      console.error("capture error", e);
      return null;
    }
  }

  // ---------------- Upload face ----------------
  const handleUploadToFirestoreDb = async () => {
    if (!capturedPhoto) return alert("Please capture a photo first.");
    const nameToSave = uploadName?.trim();
    if (!nameToSave) return alert("Please enter a name.");
    if (!confirm(`Upload photo for ${nameToSave}?`)) return;

    setIsUploading(true);
    setUploadResult(null);
    try {
      const res = await uploadStudentPhotoToFirestore(capturedPhoto, nameToSave);
      setIsUploading(false);
      if (res.ok) {
        setUploadResult(`Uploaded doc ${res.id}`);
        setUploadedDocId(res.id);
        // ask backend to refresh
        try {
          await fetch("http://localhost:5000/refresh-cache", { method: "POST" });
        } catch {}
      } else {
        setUploadResult(`Upload failed: ${res.error}`);
      }
    } catch (e: any) {
      setIsUploading(false);
      console.error(e);
      setUploadResult(`Upload error: ${String(e)}`);
    }
  };

  // ---------------- Face verify ----------------
  const verifyFace = async () => {
    if (!capturedPhoto) return alert("Please capture a photo to verify.");
    setIsVerifyingFace(true);
    setFaceVerifyResult(null);

    try {
      const blob = await (await fetch(capturedPhoto)).blob();
      const form = new FormData();
      form.append("photo", blob, "capture.jpg");

      const res = await fetch("http://localhost:5000/verify-face", {
        method: "POST",
        body: form,
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.match) {
          setFaceVerifyResult({ ok: true, name: data.name, distance: data.distance });
        } else {
          setFaceVerifyResult({ ok: false, message: data.message || "No match", distance: data.distance });
        }
      } catch {
        setFaceVerifyResult({ ok: false, message: "Server error: " + text });
      }
    } catch (e) {
      console.error(e);
      setFaceVerifyResult({ ok: false, message: "Network error" });
    } finally {
      setIsVerifyingFace(false);
    }
  };

  // ---------------- WebAuthn helpers (unchanged) ----------------
  function base64urlToBuffer(base64url: string) {
    base64url = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64url.length % 4) base64url += "=";
    const binary = atob(base64url);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  function bufferToBase64url(buf: ArrayBuffer) {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    let b64 = btoa(binary);
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  const startRegisterFingerprint = async () => {
    const studentId = uploadedDocId || prompt("Enter doc id to register fingerprint:", uploadedDocId || studentData.id);
    if (!studentId) return setWebauthnStatus("Register cancelled.");
    setWebauthnStatus("Requesting registration options...");
    try {
      const resp = await fetch("http://localhost:5000/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, name: uploadName || studentData.name }),
      });
      const options = await resp.json();
      if (options.error) {
        setWebauthnStatus("Server error: " + options.error);
        return;
      }
      const publicKey: any = { ...options };
      publicKey.challenge = base64urlToBuffer(options.challenge);
      publicKey.user = { ...options.user, id: base64urlToBuffer(options.user.id) };

      const cred: any = await (navigator as any).credentials.create({ publicKey });
      if (!cred) throw new Error("No credential returned.");

      const rawIdB64 = bufferToBase64url(cred.rawId);
      const completeResp = await fetch("http://localhost:5000/webauthn/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          rawId: rawIdB64,
          challenge: options.challenge,
          clientDataJSON: bufferToBase64url(cred.response.clientDataJSON),
          attestationObject: bufferToBase64url(cred.response.attestationObject),
        }),
      });
      const j = await completeResp.json();
      if (j.ok) {
        setWebauthnStatus("Registered fingerprint (demo).");
        try { await fetch("http://localhost:5000/refresh-cache", { method: "POST" }); } catch {}
      } else {
        setWebauthnStatus("Register failed: " + (j.error || JSON.stringify(j)));
      }
    } catch (e: any) {
      console.error("webauthn register error", e);
      setWebauthnStatus("Register error: " + (e?.message || String(e)));
    }
  };

  const startAuthenticateFingerprint = async () => {
    const studentId = uploadedDocId || prompt("Enter doc id to authenticate:", uploadedDocId || studentData.id);
    if (!studentId) return setWebauthnStatus("Auth cancelled.");
    setWebauthnStatus("Requesting auth options...");
    try {
      const resp = await fetch("http://localhost:5000/webauthn/auth/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const options = await resp.json();
      if (options.error) {
        setWebauthnStatus("Server error: " + options.error);
        return;
      }
      const publicKey: any = {
        challenge: base64urlToBuffer(options.challenge),
        timeout: options.timeout,
        userVerification: options.userVerification || "required",
        allowCredentials: (options.allowCredentials || []).map((c: any) => ({ id: base64urlToBuffer(c.id), type: c.type })),
      };
      const assertion: any = await (navigator as any).credentials.get({ publicKey });
      if (!assertion) throw new Error("No assertion returned.");

      const rawId = bufferToBase64url(assertion.rawId);
      const clientDataJSON = bufferToBase64url(assertion.response.clientDataJSON);
      const authenticatorData = bufferToBase64url(assertion.response.authenticatorData);
      const signature = bufferToBase64url(assertion.response.signature);

      const verifyResp = await fetch("http://localhost:5000/webauthn/auth/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          rawId,
          clientDataJSON,
          authenticatorData,
          signature,
          challenge: options.challenge,
        }),
      });
      const j = await verifyResp.json();
      if (j.ok) {
        setWebauthnResult({ ok: true, message: j.message, studentId: j.studentId });
        setWebauthnStatus("Fingerprint verified (demo).");
      } else {
        setWebauthnResult({ ok: false, message: j.error || "Not matched" });
        setWebauthnStatus("Fingerprint auth failed.");
      }
    } catch (e: any) {
      console.error("webauthn auth error", e);
      setWebauthnResult({ ok: false, message: e?.message || String(e) });
      setWebauthnStatus("Auth error: " + (e?.message || String(e)));
    }
  };

  // loader component
  const SmallLoader = ({ size = 16 }: { size?: number }) => (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin" size={size} />
    </div>
  );

  // ---------------- UI ----------------
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg"
        >
          <Smartphone className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold mt-3">Biometric Attendance</h1>
      
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Face Upload */}
        <motion.div variants={cardVariant} initial="hidden" animate="visible" custom={0} className="h-full">
          <Card className="rounded-2xl shadow-lg p-4 h-full min-h-[20rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" /> Face Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div className="grid md:grid-cols-2 gap-4 items-start flex-1">
                <div className="flex flex-col">
                  <label className="text-sm block">Student Name</label>
                  <input
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="mt-2 border rounded px-3 py-2 w-full"
                    placeholder="Student name"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => openCamera("face-upload")}>Open Camera</Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!isCameraOpen) await openCamera("face-upload");
                        else await captureFromVideoToDataUrl();
                      }}
                    >
                      {isCameraOpen && cameraMode === "face-upload" ? "Capture" : "Open & Capture"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setCapturedPhoto(null); setUploadResult(null); }}>
                      Clear
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={handleUploadToFirestoreDb} disabled={!capturedPhoto || isUploading}>
                      {isUploading ? <SmallLoader /> : "Upload to Firestore"}
                    </Button>
                    <Button variant="outline" onClick={() => { setCapturedPhoto(null); setUploadedDocId(null); }}>Reset</Button>
                  </div>

                  <div className="mt-3">
                    {uploadResult && <div className="text-sm">{uploadResult}</div>}
                    {uploadedDocId && <div className="mt-2 text-xs text-muted-foreground">Doc id: {uploadedDocId}</div>}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-sm self-start">Preview</div>
                  <div className="mt-2 h-44 w-full md:w-44 border rounded overflow-hidden bg-muted flex items-center justify-center">
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-muted-foreground p-2">No photo</div>
                    )}
                  </div>
                  {/* keep small controls under preview so they are always visible */}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Face Verify */}
        <motion.div variants={cardVariant} initial="hidden" animate="visible" custom={1} className="h-full">
          <Card className="rounded-2xl shadow-lg p-4 h-full min-h-[20rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" /> Face Verify (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div className="grid md:grid-cols-2 gap-4 items-start flex-1">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">Capture a live photo and press Verify — backend compares against stored faces.</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => openCamera("face-verify")}>Open Camera</Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!isCameraOpen) await openCamera("face-verify");
                        else await captureFromVideoToDataUrl();
                      }}
                    >
                      {isCameraOpen && cameraMode === "face-verify" ? "Capture" : "Open & Capture"}
                    </Button>
                    <Button variant="ghost" onClick={() => { setCapturedPhoto(null); setFaceVerifyResult(null); }}>Clear</Button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={verifyFace} disabled={!capturedPhoto || isVerifyingFace}>
                      {isVerifyingFace ? <SmallLoader /> : "Verify Face"}
                    </Button>
                    <Button variant="outline" onClick={() => setCapturedPhoto(null)}>Discard</Button>
                  </div>

                  <div className="mt-4">
                    {isVerifyingFace && <div className="flex items-center gap-2"><SmallLoader /> Verifying...</div>}
                    {faceVerifyResult && faceVerifyResult.ok && (
                      <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="mt-2 text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> <strong>{faceVerifyResult.name}</strong> matched {faceVerifyResult.distance ? `(dist ${faceVerifyResult.distance.toFixed(3)})` : ""}
                      </motion.div>
                    )}
                    {faceVerifyResult && !faceVerifyResult.ok && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-red-600 flex items-center gap-2">
                        <XCircle className="w-5 h-5" /> Not matched — {faceVerifyResult.message}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-sm self-start">Preview</div>
                  <div className="mt-2 h-44 w-full md:w-44 border rounded overflow-hidden bg-muted flex items-center justify-center">
                    {capturedPhoto ? (
                      <img src={capturedPhoto} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-muted-foreground p-2">No photo</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fingerprint Register */}
        <motion.div variants={cardVariant} initial="hidden" animate="visible" custom={2} className="h-full">
          <Card className="rounded-2xl shadow-lg p-4 h-full min-h-[18rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" /> Fingerprint — Register
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Register a platform authenticator (TouchID/Windows Hello) and attach it to the uploaded student.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={startRegisterFingerprint} disabled={!uploadedDocId && !capturedPhoto}>Register Fingerprint</Button>
                  <Button variant="outline" onClick={() => { setWebauthnStatus(null); setWebauthnResult(null); }}>Reset</Button>
                </div>

                <div className="mt-3">
                  {webauthnStatus && <div className="text-sm">Status: {webauthnStatus}</div>}
                  {!uploadedDocId && <div className="mt-2 text-xs text-muted-foreground">No uploaded student — upload first or paste doc id when prompted.</div>}
                  {uploadedDocId && <div className="mt-2 text-xs text-muted-foreground">Using doc id: {uploadedDocId}</div>}
                </div>
              </div>

             
            </CardContent>
          </Card>
        </motion.div>

        {/* Fingerprint Authenticate */}
        <motion.div variants={cardVariant} initial="hidden" animate="visible" custom={3} className="h-full">
          <Card className="rounded-2xl shadow-lg p-4 h-full min-h-[18rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" /> Fingerprint — Authenticate
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Authenticate using the platform authenticator previously registered.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={startAuthenticateFingerprint}>Use Fingerprint</Button>
                  <Button variant="outline" onClick={() => { setWebauthnStatus(null); setWebauthnResult(null); }}>Clear</Button>
                </div>

                <div className="mt-3">
                  {webauthnResult && webauthnResult.ok && (
                    <div className="text-green-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Authenticated — id: {webauthnResult.studentId}</div>
                  )}
                  {webauthnResult && !webauthnResult.ok && (
                    <div className="text-red-600 flex items-center gap-2"><XCircle className="w-5 h-5" /> Auth failed — {webauthnResult.message}</div>
                  )}
                  {webauthnStatus && !webauthnResult && <div className="mt-2 text-sm text-muted-foreground">Status: {webauthnStatus}</div>}
                </div>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">Doc id: {uploadedDocId ?? "(none)"}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* floating camera (responsive widths) */}
      <div style={{ display: isCameraOpen ? "block" : "none" }} className="fixed bottom-6 right-6 w-64 md:w-80 bg-neutral-900/95 rounded-2xl overflow-hidden shadow-2xl p-3 z-50">
        <video ref={videoRef} className="w-full h-auto rounded" autoPlay playsInline />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => captureFromVideoToDataUrl()}>Capture</Button>
          <Button size="sm" variant="outline" onClick={() => stopCameraStream()}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default StudentInterfacesthree;



