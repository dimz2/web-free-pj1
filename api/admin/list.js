const { isAuthenticated } = require("../_lib/auth");
const { readItems } = require("../_lib/store");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Belum login." });
    return;
  }

  const items = await readItems();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, items });
};
