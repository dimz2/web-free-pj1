// ============================================================
// FILE INI JALAN DI SERVER SAJA (tidak pernah dikirim ke browser).
// Ditaruh di api/_lib/ — nama folder diawali underscore supaya
// Vercel TIDAK menjadikannya endpoint publik, cuma dipakai
// (di-require) oleh file lain di dalam folder api/.
// ============================================================

const crypto = require("crypto");

const SESSION_MAX_AGE_SECONDS = 6 * 60 * 60; // sesi admin berlaku 6 jam
const COOKIE_NAME = "rawsend_admin_session";

// -----------------------------------------------------------------
// 1. PASSWORD BISA DI-HARDCODE DI SINI
//    Ganti 'admin123' dengan password yang Anda inginkan.
//    Jika ingin tetap pakai environment variable, tinggal
//    ubah menjadi: process.env.ADMIN_PASSWORD
// -----------------------------------------------------------------
const HARDCODED_PASSWORD = "admin123";   // <-- SET PASSWORD DI SINI

// -----------------------------------------------------------------
// 2. Fungsi untuk mendapatkan secret session (tetap dari env)
// -----------------------------------------------------------------
function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET belum di-set di Environment Variables Vercel."
    );
  }
  return secret;
}

// -----------------------------------------------------------------
// 3. Fungsi-fungsi session (tidak diubah)
// -----------------------------------------------------------------
function sign(value) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function createSessionToken() {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  let expectedBuffer, sigBuffer;
  try {
    expectedBuffer = Buffer.from(sign(payload), "hex");
    sigBuffer = Buffer.from(signature, "hex");
  } catch (e) {
    return false;
  }
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}

function parseCookies(req) {
  const header = (req.headers && req.headers.cookie) || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

function setSessionCookie(res) {
  const token = createSessionToken();
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Max-Age=${SESSION_MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
}

// -----------------------------------------------------------------
// 4. FUNGSI checkPassword — sekarang menggunakan HARDCODED_PASSWORD
//    (tapi tetap kompatibel dengan env jika Anda ingin beralih)
// -----------------------------------------------------------------
function checkPassword(password) {
  // Ambil dari hardcode terlebih dahulu, tapi jika ingin
  // memprioritaskan environment variable, bisa diubah logikanya.
  const real = HARDCODED_PASSWORD;   // <-- password dari hardcode

  // Fallback: jika hardcode kosong, coba ambil dari env (opsional)
  // const real = HARDCODED_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!real || typeof password !== "string" || password.length === 0) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// -----------------------------------------------------------------
// 5. Ekspor semua fungsi yang dibutuhkan oleh route lain
// -----------------------------------------------------------------
module.exports = {
  isAuthenticated,
  setSessionCookie,
  clearSessionCookie,
  checkPassword,
};
