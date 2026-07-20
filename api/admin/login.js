const { checkPassword, setSessionCookie } = require("../_lib/auth");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { password } = req.body || {};

  // Jeda kecil supaya percobaan password bertubi-tubi sedikit lebih lambat.
  await delay(300);

  if (!checkPassword(password)) {
    res.status(401).json({ error: "Password salah." });
    return;
  }

  setSessionCookie(res);
  res.status(200).json({ ok: true });
};
