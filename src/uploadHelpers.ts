// src/uploadHelpers.ts
import { db } from "./firebaseClient";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Compress image dataURL using a canvas (client-side).
 * Returns a new data URL (JPEG).
 */
export async function compressDataUrl(
  dataUrl: string,
  maxPx = 400,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL("image/jpeg", quality);
      resolve(out);
    };
    img.onerror = (e) => reject(e);
    img.src = dataUrl;
  });
}

/** approximate bytes of base64 dataURL */
export function dataUrlByteSize(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.round((base64.length * 3) / 4);
}

/**
 * Upload student entry into Firestore:
 * - name: string
 * - photo_base64: data URL (compressed)
 *
 * Returns { ok, id, sizeBytes, error }
 */
export async function uploadStudentPhotoToFirestore(
  capturedDataUrl: string,
  studentName: string
) {
  try {
    if (!capturedDataUrl || !capturedDataUrl.startsWith("data:")) {
      throw new Error("Invalid data URL");
    }

    // compress to keep below Firestore doc limit
    const compressed = await compressDataUrl(capturedDataUrl, 400, 0.7);
    const bytes = dataUrlByteSize(compressed);

    // safety margin — keep < ~900k
    if (bytes > 900000) {
      return { ok: false, error: "Compressed image too large. Reduce size/quality." };
    }

    const safeName = (studentName || "unknown")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "");
    const docId = `${safeName}_${Date.now()}`;

    const docRef = doc(db, "students", docId);
    await setDoc(docRef, {
      name: studentName,
      photo_base64: compressed,
      createdAt: serverTimestamp(),
    });

    return { ok: true, id: docId, sizeBytes: bytes };
  } catch (err: any) {
    console.error("uploadStudentPhotoToFirestore error", err);
    return { ok: false, error: String(err) };
  }
}

