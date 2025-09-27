// StudentInterface.tsx 
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  QrCode,
  Camera,
  Fingerprint,
  Wifi,
  CheckCircle,
  Smartphone,
  Shield,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * StudentInterfacestwo — with OD request UI and localStorage demo sync
 */

const ISSUER_STORAGE_KEY = "qr-issuer-id";
const JSQR_CDN = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";

export function StudentInterfacestwo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const [studentData] = useState({
    name: "gopinath",
    id: 720723104052,
    course: "CS-301: Advanced Algorithms",
    time: new Date().toLocaleTimeString(),
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<"qr" | "face" | null>(null);

  const detectorRef = useRef<any | null>(null);
  const [isBarcodeAvailable, setIsBarcodeAvailable] = useState(false);

  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const frameSkipRef = useRef(2);
  const frameCounterRef = useRef(0);

  const [scannedPayload, setScannedPayload] = useState<any | null>(null);
  const [manualInput, setManualInput] = useState("");

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const [faceDone, setFaceDone] = useState(false);
  const [fingerDone, setFingerDone] = useState(false);
  const [nfcDone, setNfcDone] = useState(false);

  const [knownIssuerId, setKnownIssuerId] = useState<string | null>(null);
  const [qrVerified, setQrVerified] = useState<boolean | null>(null);
  const [qrRejectReason, setQrRejectReason] = useState<string | null>(null);
  const [diagLast, setDiagLast] = useState<string | null>(null);

  const [cameraAutoOpenFailed, setCameraAutoOpenFailed] = useState(false);

  const verificationSteps = [
    { id: 1, title: "Scan QR Code", description: "Point camera at faculty's rotating QR code", icon: QrCode },
    { id: 2, title: "Face Verification", description: "AI facial recognition with liveness detection", icon: Camera },
    { id: 3, title: "Fingerprint Auth", description: "Biometric authentication on your device", icon: Fingerprint },
    { id: 4, title: "NFC Presence(optional)", description: "Tap classroom beacon to verify location", icon: Wifi },
  ];

  useEffect(() => {
    const g: any = window as any;
    if ("BarcodeDetector" in g) {
      try {
        const det = new g.BarcodeDetector({ formats: ["qr_code"] });
        detectorRef.current = det;
        setIsBarcodeAvailable(true);
      } catch (err) {
        detectorRef.current = null;
        setIsBarcodeAvailable(false);
      }
    } else {
      detectorRef.current = null;
      setIsBarcodeAvailable(false);
    }

    if (!canvasRef.current) {
      const c = document.createElement("canvas");
      canvasRef.current = c;
    }

    try {
      const id = localStorage.getItem(ISSUER_STORAGE_KEY);
      setKnownIssuerId(id);
    } catch {
      setKnownIssuerId(null);
    }

    return () => {
      stopDetectionLoop();
      stopCameraStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scanning || isSending) {
      const iv = setInterval(() => {
        setVerificationProgress((p) => {
          if (p >= 100) {
            clearInterval(iv);
            setVerificationProgress(0);
            setScanning(false);
            setIsSending(false);

            if (cameraMode === "face") setFaceDone(true);
            if (cameraMode === null && currentStep === 2) setFingerDone(true);
            if (cameraMode === null && currentStep === 3) setNfcDone(true);

            setCameraMode(null);
            setIsCameraOpen(false);
            setCurrentStep((s) => Math.min(s + 1, verificationSteps.length));
            return 0;
          }
          return p + 6;
        });
      }, 120);
      return () => clearInterval(iv);
    }
  }, [scanning, isSending, cameraMode, currentStep]);

  const ensureJsQr = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const g: any = window as any;
      if (g.jsQR) return resolve();
      const script = document.createElement("script");
      script.src = JSQR_CDN;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(new Error("failed to load jsQR"));
      document.head.appendChild(script);
    });
  };

  // OPEN CAMERA
  const openCameraStream = async (mode: "qr" | "face", stepIndex: number) => {
    setCameraAutoOpenFailed(false);
    stopDetectionLoop();
    stopCameraStream();
    setDiagLast(null);

    try {
      const constraints =
        mode === "qr"
          ? {
              video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
              audio: false,
            }
          : {
              video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
              audio: false,
            };

      const s = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
      setStream(s);
      setIsCameraOpen(true);
      setCameraMode(mode);
      setCurrentStep(stepIndex);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          if (v.readyState >= 2) return resolve();
          const onLoaded = () => {
            v.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          v.addEventListener("loadedmetadata", onLoaded);
          v.play().catch(() => resolve());
        });
      }

      if (mode === "qr") {
        if (!detectorRef.current) {
          try {
            await ensureJsQr();
            setDiagLast("Using jsQR fallback");
          } catch {
            setDiagLast("jsQR load failed — use paste input");
          }
        } else {
          setDiagLast("Using native BarcodeDetector");
        }
        frameSkipRef.current = 2;
        setQrVerified(null);
        setQrRejectReason(null);
        startDetectionLoop();
      }
    } catch (err: any) {
      setDiagLast("camera error: " + String(err?.message ?? err));
      setCameraAutoOpenFailed(true);
    }
  };

  const stopCameraStream = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOpen(false);
    try {
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
  };

  const startDetectionLoop = () => {
    runningRef.current = true;
    frameCounterRef.current = 0;

    const loop = async () => {
      if (!runningRef.current) return;

      frameCounterRef.current++;
      if (frameCounterRef.current % frameSkipRef.current !== 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const video = videoRef.current;
      if (!video) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      try {
        if (detectorRef.current) {
          try {
            const barcodes = await detectorRef.current.detect(video);
            if (barcodes && barcodes.length > 0) {
              const raw = barcodes[0].rawValue || (barcodes[0].rawData && String(barcodes[0].rawData));
              setDiagLast("native detect OK");
              handleFound(raw);
              return;
            }
          } catch (e) {}
        }
      } catch {}

      try {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D context missing");

        const w = 320;
        const h = 240;
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);

        const g: any = window as any;
        if (g.jsQR) {
          try {
            const code = g.jsQR(imageData.data, w, h);
            if (code && code.data) {
              setDiagLast("jsQR decode OK");
              handleFound(code.data);
              return;
            }
          } catch {}
        } else {
          setDiagLast("jsQR not loaded");
        }
      } catch (err) {}

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const stopDetectionLoop = () => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleFound = (raw: string) => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopCameraStream();
    processScannedRaw(raw);
  };

  const validatePayload = (obj: any) => {
    if (!obj || typeof obj !== "object") return { ok: false, reason: "Invalid JSON" };
    if (!("course" in obj) || !("classroom" in obj) || !("session" in obj)) return { ok: false, reason: "Malformed payload" };
    if (!("present" in obj) || !("absent" in obj)) return { ok: false, reason: "Missing attendance lists" };
    if (!("issuerId" in obj)) return { ok: false, reason: "Missing issuerId" };
    if (!knownIssuerId) return { ok: false, reason: "Generator issuer unknown on this device" };
    if (obj.issuerId !== knownIssuerId) return { ok: false, reason: "issuerId does not match" };
    return { ok: true };
  };

  const processScannedRaw = (raw: string) => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }
    setScannedPayload(parsed);

    const res = validatePayload(parsed);
    if (res.ok) {
      setQrVerified(true);
      setQrRejectReason(null);
      setDiagLast("QR verified");
      setTimeout(() => {
        startVerification(1);
      }, 200);
    } else {
      setQrVerified(false);
      setQrRejectReason(res.reason || "Unknown reason");
      setDiagLast("QR rejected: " + (res.reason ?? "unknown"));
    }
  };

  const handleManualVerify = () => {
    if (!manualInput) return;
    processScannedRaw(manualInput);
  };

  const capturePhotoViaImageCapture = async (stepIndex: number) => {
    const track = stream?.getVideoTracks()[0];
    if (!track) {
      fallbackPhotoPlaceholder(stepIndex);
      return;
    }

    const ImageCaptureClass: any = (window as any).ImageCapture;
    if (typeof ImageCaptureClass === "function") {
      try {
        const imgCap = new ImageCaptureClass(track);
        if (typeof imgCap.takePhoto === "function") {
          const blob: Blob = await imgCap.takePhoto();
          const url = await blobToDataURL(blob);
          setCapturedPhoto(url);
          stopCameraStream();
          setIsSending(true);
          setVerificationProgress(0);
          return;
        } else if (typeof imgCap.grabFrame === "function") {
          const bitmap: ImageBitmap = await imgCap.grabFrame();
          const offscreenSupported = typeof (window as any).OffscreenCanvas === "function";
          if (offscreenSupported) {
            try {
              const off = new (window as any).OffscreenCanvas(bitmap.width, bitmap.height);
              const ctx = off.getContext("2d");
              ctx.drawImage(bitmap, 0, 0);
              const blob = await off.convertToBlob({ type: "image/jpeg", quality: 0.9 });
              const url = await blobToDataURL(blob);
              setCapturedPhoto(url);
              stopCameraStream();
              setIsSending(true);
              setVerificationProgress(0);
              return;
            } catch {
              fallbackPhotoPlaceholder(stepIndex);
              return;
            }
          } else {
            fallbackPhotoPlaceholder(stepIndex);
            return;
          }
        } else {
          fallbackPhotoPlaceholder(stepIndex);
          return;
        }
      } catch (err) {
        fallbackPhotoPlaceholder(stepIndex);
        return;
      }
    } else {
      fallbackPhotoPlaceholder(stepIndex);
      return;
    }
  };

  const blobToDataURL = (blob: Blob) =>
    new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(String(reader.result));
      reader.onerror = (e) => rej(e);
      reader.readAsDataURL(blob);
    });

  const fallbackPhotoPlaceholder = (stepIndex: number) => {
    const initials = studentData.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'>
      <rect width='100%' height='100%' fill='#1f2937'/>
      <text x='50%' y='50%' font-size='160' fill='white' font-family='Inter, Arial, sans-serif' dominant-baseline='middle' text-anchor='middle'>${initials}</text>
      <text x='50%' y='90%' font-size='24' fill='white' font-family='Inter, Arial, sans-serif' dominant-baseline='middle' text-anchor='middle'>${studentData.name}</text>
    </svg>`;
    const url = `data:image/svg+xml;base64,${btoa(svg)}`;
    setCapturedPhoto(url);
    stopCameraStream();
    setIsSending(true);
    setVerificationProgress(0);
  };

  const startFingerprintAuth = async (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setVerificationProgress(0);

    try {
      const isAvailable =
        (window as any).PublicKeyCredential &&
        typeof (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
          ? await (window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          : false;

      if (!isAvailable) {
        setScanning(true);
        return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyRequest: any = {
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
        },
      };

      const cred = await (navigator as any).credentials.get(publicKeyRequest);
      if (cred) {
        setScanning(true);
      } else {
        setScanning(true);
      }
    } catch (err) {
      setScanning(true);
    }
  };

  const startVerification = (stepIndex: number) => {
    if (stepIndex === 0) {
      openCameraStream("qr", stepIndex);
    } else if (stepIndex === 1) {
      openCameraStream("face", stepIndex);
    } else if (stepIndex === 2) {
      startFingerprintAuth(stepIndex);
    } else if (stepIndex === 3) {
      setCurrentStep(stepIndex);
      setScanning(true);
      setVerificationProgress(0);
    }
  };

  const onCaptureFace = async () => {
    await capturePhotoViaImageCapture(currentStep);
  };

  const demoSendFailureToSuccess = (stepIndex: number) => {
    setIsSending(true);
    setVerificationProgress(0);
  };

  const cancelCamera = () => {
    stopDetectionLoop();
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraMode(null);
    setCapturedPhoto(null);
    setVerificationProgress(0);
  };

  const discardCaptured = () => {
    setCapturedPhoto(null);
    if (cameraMode !== null) openCameraStream(cameraMode, currentStep);
  };

  const clearQrState = () => {
    setQrVerified(null);
    setQrRejectReason(null);
    setScannedPayload(null);
    setManualInput("");
    setDiagLast(null);
    setCameraAutoOpenFailed(false);
  };

  // --------- OD request UI + localStorage bridge (demo) ----------
  const [odRequested, setOdRequested] = useState(false);
  const [odReason, setOdReason] = useState("");
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [enteredToken, setEnteredToken] = useState("");
  const [certificateFileName, setCertificateFileName] = useState<string | null>(null);

  // check if we already requested
  useEffect(() => {
    try {
      const raw = localStorage.getItem("od_requests");
      const arr = raw ? JSON.parse(raw) : [];
      const found = Array.isArray(arr) && arr.some((r: any) => r.studentId === studentData.id);
      setOdRequested(found);
    } catch {
      setOdRequested(false);
    }

    // poll for issued token and certificate status
    let mounted = true;
    const iv = setInterval(() => {
      try {
        const tok = localStorage.getItem(`od_issued_${studentData.id}`);
        if (mounted) setIssuedToken(tok);
        const certRaw = localStorage.getItem("od_certificates");
        const certs = certRaw ? JSON.parse(certRaw) : [];
        const myCert = Array.isArray(certs) && certs.find((c: any) => c.studentId === studentData.id);
        if (myCert) setCertificateFileName(myCert.filename || "uploaded");
      } catch {}
    }, 1200);
    return () => { mounted = false; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestOD = () => {
    try {
      const raw = localStorage.getItem("od_requests");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({
        studentId: studentData.id,
        name: studentData.name,
        reason: odReason || "No reason provided",
        ts: Date.now(),
      });
      localStorage.setItem("od_requests", JSON.stringify(arr));
      setOdRequested(true);
      setToast("OD request sent.");
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast("Failed to request OD (localStorage).");
      setTimeout(() => setToast(null), 2000);
    }
  };

  const enterODToken = () => {
    if (!enteredToken) {
      setToast("Enter a token first.");
      setTimeout(() => setToast(null), 1400);
      return;
    }
    try {
      const raw = localStorage.getItem("od_token_entries");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({
        studentId: studentData.id,
        token: enteredToken,
        ts: Date.now(),
      });
      localStorage.setItem("od_token_entries", JSON.stringify(arr));
      setToast("OD token submitted.");
      setTimeout(() => setToast(null), 1600);
    } catch {
      setToast("Failed to submit token.");
      setTimeout(() => setToast(null), 1400);
    }
  };

  const onCertificateFile = async (f?: File) => {
    const file = f || (document.getElementById("odCertInput") as HTMLInputElement | null)?.files?.[0];
    if (!file) {
      setToast("No file selected");
      setTimeout(() => setToast(null), 1200);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = localStorage.getItem("od_certificates");
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({
          studentId: studentData.id,
          filename: file.name,
          dataUrl: reader.result,
          ts: Date.now(),
        });
        localStorage.setItem("od_certificates", JSON.stringify(arr));
        setCertificateFileName(file.name);
        setToast("Certificate uploaded (demo).");
        setTimeout(() => setToast(null), 1600);
      } catch {
        setToast("Failed to save certificate (localStorage).");
        setTimeout(() => setToast(null), 1600);
      }
    };
    reader.readAsDataURL(file);
  };

  const [toast, setToast] = useState<string | null>(null);

  // ------------- End of OD bridge ----------------

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
          <Smartphone className="w-8 h-8 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Attendance App</h1>
          <p className="text-muted-foreground">2-Phase Biometric Verification (QR gate keeps the flow)</p>
        </div>
      </div>

      {/* Student info + attendance small badges (P / F / OD) */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{studentData.name}</h3>
              <p className="text-sm text-muted-foreground">{studentData.id}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-sm">
              <div>{studentData.course}</div>
              <div className="flex text-xs text-muted-foreground items-center">
                <Calendar className="w-3 h-3 mr-1" /> {studentData.time}
              </div>
            </div>

            {/* Attendance badges - P, F, OD (status read from localStorage demo) */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">P</Badge>
              <Badge variant="outline" className="text-xs">F</Badge>
              <Badge variant={odRequested ? "default" : "secondary"} className="text-xs">OD</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Scan card (unchanged logic + UI) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode className="w-5 h-5" /> QR Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black aspect-video rounded relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
              {!isCameraOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                  <QrCode className="w-10 h-10" />
                  <Button className="mt-3" onClick={() => startVerification(0)}>
                    Open Camera
                  </Button>
                </div>
              )}
            </div>

            <div>
              {!isBarcodeAvailable && (
                <>
                  <textarea
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Paste QR JSON"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button onClick={handleManualVerify}>Verify</Button>
                    <Button variant="outline" onClick={() => clearQrState()}>Clear</Button>
                  </div>
                </>
              )}

              <div className="mt-3 text-xs text-muted-foreground">
                <div>BarcodeDetector: {isBarcodeAvailable ? "available" : "unavailable"}</div>
                <div>Known issuerId: {knownIssuerId ?? "<none set by generator>"}</div>
                <div>Diag: {diagLast ?? "idle"}</div>
              </div>

              {qrVerified === true && (
                <div className="mt-3 text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> QR Verified — opening biometric phase...
                </div>
              )}
              {qrVerified === false && (
                <div className="mt-3 text-red-600 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 inline-block">✖</span>
                    <div>Not Verified — {qrRejectReason ?? "unknown"}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => { clearQrState(); startVerification(0); }}>Retry Scan</Button>
                    <Button variant="outline" onClick={() => clearQrState()}>Clear</Button>
                  </div>
                </div>
              )}

              {scannedPayload && qrVerified && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Course: {scannedPayload.course}</div>
                  <div className="text-sm">Classroom: {scannedPayload.classroom}</div>
                  <div className="text-xs text-muted-foreground">Issuer: <span className="font-mono">{scannedPayload.issuerId}</span></div>
                </div>
              )}

              {qrVerified === null && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Please scan the instructor's QR code. Only QR codes produced by this system will be accepted.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biometric cards shown only after QR verified */}
      {qrVerified === true ? (
        <>
          {/* Face Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5" /> Face Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Capture your face for verification.</p>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => startVerification(1)}>Open Camera</Button>
                    <Button variant="outline" onClick={() => {
                      if (isCameraOpen && cameraMode === "face") {
                        capturePhotoViaImageCapture(currentStep);
                      } else {
                        startVerification(1);
                      }
                    }}>Start Capture</Button>

                    {cameraAutoOpenFailed && (
                      <div className="ml-2 text-sm text-yellow-600">
                        Auto-open blocked by browser. Please click "Open Camera" to continue.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Preview</div>
                  <div className="mt-2 h-40 w-40 border rounded flex items-center justify-center overflow-hidden bg-muted">
                    {capturedPhoto ? <img src={capturedPhoto} alt="preview" className="w-full h-full object-cover" /> : <div className="text-xs text-muted-foreground p-2">No photo yet</div>}
                  </div>
                  {capturedPhoto && <div className="mt-2 flex gap-2">
                    <Button onClick={() => { setIsSending(true); setVerificationProgress(0); }}>Send (Demo)</Button>
                    <Button variant="ghost" onClick={discardCaptured}>Retake</Button>
                  </div>}
                  {faceDone && <div className="mt-2 text-green-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Face Verified</div>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fingerprint Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Fingerprint className="w-5 h-5" /> Fingerprint Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Use platform biometric authentication (if available).</p>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => startVerification(2)}>Open Biometric Prompt</Button>
                <Button variant="outline" onClick={() => demoSendFailureToSuccess(2)}>Demo Fallback</Button>
              </div>
              {fingerDone && <div className="mt-3 text-green-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Fingerprint Verified</div>}
            </CardContent>
          </Card>

          {/* NFC Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wifi className="w-5 h-5" /> NFC Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tap your device or card to the classroom NFC beacon (demo).</p>
              <div className="mt-3">
                <Button onClick={() => { setCurrentStep(3); setScanning(true); setVerificationProgress(0); }}>Tap NFC (Demo)</Button>
              </div>
              {nfcDone && <div className="mt-3 text-green-600 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> NFC Verified</div>}
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* OD Section (request token, enter token, upload certificate) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> On-Duty (OD) Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">If you have permission to be absent, request OD. Faculty will approve and provide a token.</p>
              <textarea
                className="w-full border rounded p-2 mt-2"
                placeholder="Reason for OD (dates/times)..."
                value={odReason}
                onChange={(e) => setOdReason(e.target.value)}
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <Button onClick={requestOD} disabled={odRequested}>{odRequested ? "Requested" : "Request OD"}</Button>
                <Button variant="outline" onClick={() => { setOdReason(""); }}>Clear</Button>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Issued token (visible when faculty accepts):</div>
              <div className="mt-2 flex items-center gap-2">
                <input className="flex-1 border rounded p-2" placeholder="Enter token" value={enteredToken} onChange={(e) => setEnteredToken(e.target.value)} />
                <Button onClick={enterODToken}>Submit Token</Button>
              </div>
              {issuedToken && (
                <div className="mt-2 text-xs text-green-700">
                  Token issued by faculty: <span className="font-mono">{issuedToken}</span>
                </div>
              )}
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">Upload certificate (PDF/JPG) after entering token:</div>
                <div className="mt-2 flex gap-2 items-center">
                  <input id="odCertInput" type="file" accept=".pdf,image/*" onChange={() => onCertificateFile()} />
                  <Button onClick={() => { const el = document.getElementById("odCertInput") as HTMLInputElement | null; if (el?.files?.[0]) onCertificateFile(el.files[0]); }}>Upload</Button>
                </div>
                {certificateFileName && <div className="mt-2 text-xs text-muted-foreground">Uploaded: {certificateFileName}</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current action, diag */}
      <Card className={`${scanning ? "border-primary shadow-glow" : ""}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Current Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Status: {verificationSteps[currentStep]?.title ?? "idle"}</div>
          <div className="mt-2 text-xs text-muted-foreground">Diag: {diagLast ?? "idle"}</div>
          {(scanning || isSending) && (
            <>
              <div className="mt-3">
                <Progress value={verificationProgress} />
              </div>
              <div className="text-xs mt-1">Processing... {Math.round(verificationProgress)}%</div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted bg-muted/30">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <Shield className="w-5 h-5 inline mr-2" />
          All verifications in this demo are simulated. In production:
          <br />• Face embeddings & templates must be processed securely by your backend.
          <br />• WebAuthn operations must use server-generated challenges and proper credential lifecycle.
        </CardContent>
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-foreground text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default StudentInterfacestwo;







