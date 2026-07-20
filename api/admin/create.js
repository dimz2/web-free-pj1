const crypto = require("crypto");
const { isAuthenticated } = require("../_lib/auth");
const { readItems, writeItems } = require("../_lib/store");

function clean(value) {
  return (value === undefined || value === null ? "" : String(value)).trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Belum login." });
    return;
  }

  const body = req.body || {};
  const title = clean(body.title);
  const downloadUrl = clean(body.downloadUrl);
  const thumbnailUrl = clean(body.thumbnailUrl);
  const fileName = clean(body.fileName);
  const size = clean(body.size);
  const resolution = clean(body.resolution);
  const fps = clean(body.fps);
  const codec = clean(body.codec);

  if (!title || !downloadUrl) {
    res.status(400).json({ error: "Judul dan link download wajib diisi." });
    return;
  }

  const items = await readItems();
  const newItem = {
    id: crypto.randomUUID(),
    title,
    downloadUrl,
    thumbnailUrl,
    fileName,
    size,
    resolution,
    fps,
    codec,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  await writeItems(items);

  res.status(200).json({ ok: true, item: newItem });
};
