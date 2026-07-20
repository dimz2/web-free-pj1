// Palet gradient untuk thumbnail placeholder (dipakai kalau item
// tidak punya thumbnailUrl)
const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #2a2440, #4fd1c544)",
  "linear-gradient(135deg, #3a2416, #f5a62344)",
  "linear-gradient(135deg, #241d3a, #e85c4a44)",
  "linear-gradient(135deg, #142c2a, #4fd1c555)",
];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderItems(items) {
  const grid = document.getElementById("grid");
  const emptyHint = document.getElementById("emptyHint");
  const countEl = document.getElementById("itemCount");

  grid.innerHTML = "";

  if (!items || items.length === 0) {
    emptyHint.hidden = false;
    emptyHint.textContent = "Belum ada file. Tambahkan lewat halaman admin.";
    countEl.textContent = "0 file";
    return;
  }
  emptyHint.hidden = true;
  countEl.textContent = items.length + " file";

  items.forEach((item, i) => {
    const card = document.createElement("article");
    card.className = "card";

    const hasImage = !!item.thumbnailUrl;
    const thumbStyle = hasImage
      ? `background-image: linear-gradient(0deg, #00000055, #00000010), url('${encodeURI(item.thumbnailUrl)}'); background-size: cover; background-position: center;`
      : `background: ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]};`;

    const metaChips = [item.resolution, item.fps ? item.fps + "fps" : null, item.codec]
      .filter(Boolean)
      .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="thumb" style="${thumbStyle}">
        <div class="perf perf-top"></div>
        <span class="play" aria-hidden="true">&#9654;</span>
        <div class="perf perf-bottom"></div>
      </div>
      <div class="meta-row">${metaChips}</div>
      <h3 class="card-title">${escapeHtml(item.title || "Untitled project")}</h3>
      <p class="filename">${escapeHtml(item.fileName || "")}${item.size ? " &middot; " + escapeHtml(item.size) : ""}</p>
      <a class="download-btn" href="${item.downloadHref}">
        <span class="fill"></span>
        <span class="label">100% <strong>Unduh</strong> &#8595;</span>
      </a>
    `;
    grid.appendChild(card);
  });
}

async function loadItems() {
  const countEl = document.getElementById("itemCount");
  countEl.textContent = "memuat...";
  try {
    const res = await fetch("/api/items", { cache: "no-store" });
    if (!res.ok) throw new Error("Gagal memuat data");
    const items = await res.json();
    renderItems(items);
  } catch (err) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    const emptyHint = document.getElementById("emptyHint");
    emptyHint.hidden = false;
    emptyHint.textContent = "Gagal memuat daftar file. Coba refresh halaman.";
    countEl.textContent = "0 file";
  }
}

loadItems();
