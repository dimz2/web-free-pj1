const { isAuthenticated } = require("../_lib/auth");
const { readItems, writeItems } = require("../_lib/store");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Belum login." });
    return;
  }

  const { id } = req.body || {};
  if (!id) {
    res.status(400).json({ error: "id wajib diisi." });
    return;
  }

  const items = await readItems();
  const next = items.filter((it) => it.id !== id);
  await writeItems(next);

  res.status(200).json({ ok: true });
};
