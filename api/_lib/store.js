// ============================================================
// FILE INI JALAN DI SERVER SAJA. Menyimpan & membaca daftar item
// dari Vercel Blob sebagai satu file JSON privat.
// ============================================================

const { put, get } = require("@vercel/blob");

const ITEMS_PATHNAME = "rawsend/items.json";

async function readItems() {
  try {
    const result = await get(ITEMS_PATHNAME, { access: "private" });
    if (!result || result.statusCode !== 200) return [];
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // Belum ada file (pertama kali dipakai) atau error lain -> anggap kosong
    return [];
  }
}

async function writeItems(items) {
  await put(ITEMS_PATHNAME, JSON.stringify(items), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

module.exports = { readItems, writeItems, ITEMS_PATHNAME };
