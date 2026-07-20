const { readItems } = require("./_lib/store");

module.exports = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(400).send("Parameter id wajib diisi.");
    return;
  }

  const items = await readItems();
  const item = items.find((it) => it.id === id);

  if (!item || !item.downloadUrl) {
    res.status(404).send("File tidak ditemukan.");
    return;
  }

  res.writeHead(302, { Location: item.downloadUrl });
  res.end();
};
