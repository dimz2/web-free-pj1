const { readItems } = require("./_lib/store");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const items = await readItems();

  // Sengaja TIDAK mengirim downloadUrl asli ke browser.
  // Tombol download akan lewat /api/download?id=... yang meneruskan
  // di server, jadi link asli tidak pernah muncul di view-source.
  const publicItems = items.map((item) => ({
    id: item.id,
    title: item.title || "",
    thumbnailUrl: item.thumbnailUrl || "",
    fileName: item.fileName || "",
    size: item.size || "",
    resolution: item.resolution || "",
    fps: item.fps || "",
    codec: item.codec || "",
    downloadHref: `/api/download?id=${encodeURIComponent(item.id)}`,
  }));

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(publicItems);
};
