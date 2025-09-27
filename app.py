# app.py (updated for quick Render deploy with optional real face_recognition)
import os
import io
import base64
import traceback
import json
import secrets
from typing import List, Dict, Any, Optional

from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np

# ------------------------------------------------------------------
# Face recognition mode: STUB by default for quick deploy.
# To enable real face_recognition set env var USE_FACE_STUB=false
# (But note: real face_recognition typically requires system deps / Docker)
# ------------------------------------------------------------------
USE_FACE_STUB = os.environ.get("USE_FACE_STUB", "true").lower() in ("1", "true", "yes")

face_recognition = None
if not USE_FACE_STUB:
    try:
        import face_recognition  # type: ignore
    except Exception as e:
        print("[face] failed to import face_recognition:", e)
        print("[face] falling back to stub mode")
        USE_FACE_STUB = True
else:
    print("[face] running in STUB mode (USE_FACE_STUB=True)")

# Try to import google firestore; if absent or creds missing we'll handle gracefully
try:
    from google.cloud import firestore  # type: ignore
    from google.oauth2 import service_account  # type: ignore
    _HAS_GOOGLE = True
except Exception as e:
    _HAS_GOOGLE = False
    print("[gcloud] google-cloud libraries not available:", e)

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
PORT = int(os.environ.get("PORT", 5000))
KEY_PATH = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "firebase-key.json")
GOOGLE_CREDENTIALS_JSON = os.environ.get("GOOGLE_CREDENTIALS_JSON")

# ------------------------------------------------------------------
# Ensure credentials file is present (if possible)
# ------------------------------------------------------------------
_fs: Optional["firestore.Client"] = None
_credentials = None

if _HAS_GOOGLE:
    try:
        # If KEY_PATH doesn't exist but the JSON env var exists, write it to the KEY_PATH
        if not os.path.exists(KEY_PATH) and GOOGLE_CREDENTIALS_JSON:
            try:
                with open(KEY_PATH, "w", encoding="utf-8") as f:
                    f.write(GOOGLE_CREDENTIALS_JSON)
                print(f"[gcloud] Wrote credentials JSON to {KEY_PATH} from env var.")
            except Exception as e:
                print(f"[gcloud] Failed to write credentials JSON to {KEY_PATH}: {e}")

        if not os.path.exists(KEY_PATH):
            raise FileNotFoundError(f"Service account JSON not found at {KEY_PATH}")

        _credentials = service_account.Credentials.from_service_account_file(KEY_PATH)
        _fs = firestore.Client(credentials=_credentials, project=_credentials.project_id)
        print(f"[gcloud] Firestore initialized for project {_credentials.project_id}")
    except Exception as e:
        print(f"[gcloud] Firestore initialization failed: {e}\nContinuing without Firestore. Endpoints requiring Firestore will return errors.")
        _fs = None
else:
    print("[gcloud] Firestore not available; Firestore-related endpoints disabled.")

fs = _fs  # may be None

# In-memory caches
STUDENTS: List[Dict[str, Any]] = []  # loaded face encodings
WEBAUTHN_CHALLENGES: Dict[str, str] = {}
REGISTRATION_CHALLENGES: Dict[str, str] = {}

# Make Flask serve the React build folder if present (optional)
app = Flask(__name__, static_folder="build", static_url_path="/")
CORS(app)

# ------------------------------------------------------------------
# UTILITIES
# ------------------------------------------------------------------
def b64url_encode(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")

def b64url_decode(s: str) -> bytes:
    s2 = s + "=="[(2 - len(s) * 3) % 4:]
    return base64.urlsafe_b64decode(s2.encode("ascii"))

def decode_data_url_to_bytes(data_url: str) -> bytes:
    if "," in data_url:
        _, b64 = data_url.split(",", 1)
    else:
        b64 = data_url
    return base64.b64decode(b64)

def load_image_bytes_to_np(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(img)

# compute_face_encoding_from_bytes: stub or real depending on USE_FACE_STUB
def compute_face_encoding_from_bytes(image_bytes: bytes):
    if USE_FACE_STUB:
        # return deterministic fake 128-d vector (list) so code paths work
        return np.zeros(128, dtype=float)
    else:
        img_np = load_image_bytes_to_np(image_bytes)
        encs = face_recognition.face_encodings(img_np)
        return encs[0] if encs else None

def compute_distance(a: Any, b: Any) -> float:
    # Accept lists, numpy arrays
    a_np = np.asarray(a, dtype=float)
    b_np = np.asarray(b, dtype=float)
    return float(np.linalg.norm(a_np - b_np))

# ------------------------------------------------------------------
# FIRESTORE / CACHE
# ------------------------------------------------------------------
def refresh_student_cache():
    global STUDENTS, fs
    if not fs:
        raise RuntimeError("Firestore client not initialized; cannot refresh student cache.")
    STUDENTS = []
    docs = fs.collection("students").stream()
    for d in docs:
        data = d.to_dict() or {}
        name = data.get("name")
        photo_b64 = data.get("photo_base64")
        if not name or not photo_b64:
            continue
        try:
            image_bytes = decode_data_url_to_bytes(photo_b64)
            encoding = compute_face_encoding_from_bytes(image_bytes)
            if encoding is not None:
                # store as plain list so JSON serializable
                STUDENTS.append({"id": d.id, "name": name, "encoding": np.asarray(encoding).tolist()})
                print(f"[loaded] {name} ({d.id})")
        except Exception as e:
            print(f"[error] {d.id}: {e}")
    print(f"[cache] {len(STUDENTS)} students loaded")

# ------------------------------------------------------------------
# STATIC FILES (optional)
# ------------------------------------------------------------------
@app.route("/<path:filename>", methods=["GET"])
def static_files(filename):
    build_dir = app.static_folder
    file_path = os.path.join(build_dir, filename)
    if os.path.exists(file_path):
        return send_from_directory(build_dir, filename)
    index = os.path.join(build_dir, "index.html")
    if os.path.exists(index):
        return send_from_directory(build_dir, "index.html")
    return jsonify({"error": "Not found", "message": "Static build not present"}), 404

# ------------------------------------------------------------------
# WEB ROUTES
# ------------------------------------------------------------------
@app.route("/", methods=["GET"])
def index_route():
    index = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({"ok": True, "message": "Face verification + WebAuthn demo server running (no frontend build found)"})

@app.route("/refresh-cache", methods=["POST"])
def refresh_cache_endpoint():
    try:
        refresh_student_cache()
        return jsonify({"ok": True, "count": len(STUDENTS)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/students-cache", methods=["GET"])
def students_cache():
    return jsonify({
        "count": len(STUDENTS),
        "students": [{"id": s["id"], "name": s["name"]} for s in STUDENTS]
    })

@app.route("/verify-face", methods=["POST"])
def verify_face():
    try:
        if "photo" in request.files:
            image_bytes = request.files["photo"].read()
        else:
            data = request.get_json(silent=True) or {}
            data_url = data.get("imageData")
            if not data_url:
                return jsonify({"match": False, "message": "No photo provided"}), 400
            image_bytes = decode_data_url_to_bytes(data_url)

        probe_encoding = compute_face_encoding_from_bytes(image_bytes)
        if probe_encoding is None:
            return jsonify({"match": False, "message": "No face detected"}), 400

        if not STUDENTS:
            return jsonify({"match": False, "message": "Cache empty (refresh first)"}), 500

        # compute distances to known encodings (stored as lists)
        known_encodings = [np.asarray(s["encoding"], dtype=float) for s in STUDENTS]
        distances = [compute_distance(k, probe_encoding) for k in known_encodings]
        best_idx = int(np.argmin(distances))
        best_dist = float(distances[best_idx])
        THRESHOLD = float(os.environ.get("FACE_THRESHOLD", 0.5))

        if best_dist <= THRESHOLD:
            matched = STUDENTS[best_idx]
            return jsonify({
                "match": True,
                "id": matched["id"],
                "name": matched["name"],
                "distance": best_dist,
                "message": "Matched"
            })
        else:
            return jsonify({"match": False, "distance": best_dist, "message": "No match"})
    except Exception as e:
        tb = traceback.format_exc()
        print("[verify error]", tb)
        return Response("Server error: " + str(e) + "\n\n" + tb, status=500, mimetype="text/plain")

# ---------------- WebAuthn demo endpoints ----------------
@app.route("/webauthn/register/options", methods=["POST"])
def webauthn_register_options():
    data = request.get_json() or {}
    student_id = data.get("studentId")
    name = data.get("name", "unknown")
    if not student_id:
        return jsonify({"error": "studentId required"}), 400

    challenge = secrets.token_bytes(32)
    challenge_b64 = b64url_encode(challenge)
    REGISTRATION_CHALLENGES[challenge_b64] = student_id

    user_id_bytes = student_id.encode("utf-8")
    user_id_b64 = b64url_encode(user_id_bytes)

    publicKey = {
        "challenge": challenge_b64,
        "rp": {"name": "Hackathon Demo"},
        "user": {
            "id": user_id_b64,
            "name": name,
            "displayName": name
        },
        "pubKeyCredParams": [{"type": "public-key", "alg": -7}, {"type": "public-key", "alg": -257}],
        "timeout": 60000,
        "attestation": "none"
    }
    return jsonify(publicKey)

@app.route("/webauthn/register/complete", methods=["POST"])
def webauthn_register_complete():
    data = request.get_json() or {}
    student_id = data.get("studentId")
    raw_id_b64 = data.get("rawId")
    challenge = data.get("challenge")

    if not student_id or not raw_id_b64 or not challenge:
        return jsonify({"ok": False, "error": "studentId, rawId and challenge required"}), 400

    expected_student = REGISTRATION_CHALLENGES.get(challenge)
    if expected_student != student_id:
        return jsonify({"ok": False, "error": "challenge mismatch"}), 400

    if not fs:
        return jsonify({"ok": False, "error": "Firestore not initialized on server"}), 500

    try:
        doc_ref = fs.collection("students").document(student_id)
        doc_ref.set({"webauthn_credential_id": raw_id_b64}, merge=True)
        REGISTRATION_CHALLENGES.pop(challenge, None)
        return jsonify({"ok": True, "message": "Registered (demo). Credential id stored."})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/webauthn/auth/options", methods=["POST"])
def webauthn_auth_options():
    data = request.get_json() or {}
    student_id = data.get("studentId")
    if not student_id:
        return jsonify({"error": "studentId required"}), 400

    if not fs:
        return jsonify({"error": "Firestore not initialized on server"}), 500

    doc = fs.collection("students").document(student_id).get()
    if not doc.exists:
        return jsonify({"error": "student not found"}), 404
    d = doc.to_dict() or {}
    cred_id_b64 = d.get("webauthn_credential_id")
    if not cred_id_b64:
        return jsonify({"error": "no credential registered for this student"}), 400

    challenge = secrets.token_bytes(32)
    challenge_b64 = b64url_encode(challenge)
    WEBAUTHN_CHALLENGES[challenge_b64] = student_id

    options = {
        "challenge": challenge_b64,
        "timeout": 60000,
        "allowCredentials": [{"type": "public-key", "id": cred_id_b64}],
        "userVerification": "required"
    }
    return jsonify(options)

@app.route("/webauthn/auth/complete", methods=["POST"])
def webauthn_auth_complete():
    data = request.get_json() or {}
    student_id = data.get("studentId")
    raw_id_b64 = data.get("rawId")
    challenge = data.get("challenge")
    if not student_id or not raw_id_b64 or not challenge:
        return jsonify({"ok": False, "error": "studentId, rawId and challenge required"}), 400

    expected_student = WEBAUTHN_CHALLENGES.get(challenge)
    if expected_student != student_id:
        return jsonify({"ok": False, "error": "challenge mismatch"}), 400

    if not fs:
        return jsonify({"ok": False, "error": "Firestore not initialized on server"}), 500

    doc = fs.collection("students").document(student_id).get()
    if not doc.exists:
        return jsonify({"ok": False, "error": "student not found"}), 404
    stored = (doc.to_dict() or {}).get("webauthn_credential_id")
    if stored != raw_id_b64:
        return jsonify({"ok": False, "error": "credential id mismatch"}), 400

    WEBAUTHN_CHALLENGES.pop(challenge, None)
    return jsonify({"ok": True, "message": "Fingerprint (platform) assertion matched (demo).", "studentId": student_id})

# ------------------------------------------------------------------
# RUN
# ------------------------------------------------------------------
if __name__ == "__main__":
    print("Starting Flask...")
    if fs:
        try:
            print("Refreshing student cache from Firestore...")
            refresh_student_cache()
        except Exception as e:
            print("Initial refresh failed:", e)
    else:
        print("Firestore not available on startup; run /refresh-cache after adding credentials.")

    debug_flag = bool(os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes"))
    print(f"Starting Flask on 0.0.0.0:{PORT} (debug={debug_flag})")
    app.run(host="0.0.0.0", port=PORT, debug=debug_flag)


