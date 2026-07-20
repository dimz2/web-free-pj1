const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const createForm = document.getElementById("createForm");
const createError = document.getElementById("createError");
const createSuccess = document.getElementById("createSuccess");
const existingList = document.getElementById("existingList");
const existingCount = document.getElementById("existingCount");
const logoutBtn = document.getElementById("logoutBtn");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* no body */
  }
  return { ok: res.ok, status: res.status, data };
}

function showLogin() {
  loginSection.hidden = false;
  adminSection.hidden = true;
}

function showAdmin() {
  loginSection.hidden = true;
  adminSection.hidden = false;
}

function renderExisting(items) {
  existingCount.textContent = items.length;
  existingList.innerHTML = "";

  if (items.length === 0) {
    existingList.innerHTML = `<p class="empty-note">Belum ada file.</p>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "existing-row";
    const thumbStyle = item.thumbnailUrl
      ? `background-image:url('${encodeURI(item.thumbnailUrl)}')`
      : "";
    row.innerHTML = `
      <div class="existing-thumb" style="${thumbStyle}"></div>
      <div class="existing-info">
        <div class="t">${escapeHtml(item.title || "Untitled")}</div>
        <div class="s">${escapeHtml(item.fileName || "")}${item.size ? " &middot; " + escapeHtml(item.size) : ""}</div>
      </div>
      <button class="delete-btn" data-id="${escapeHtml(item.id)}" type="button">Hapus</button>
    `;
    existingList.appendChild(row);
  });

  existingList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Hapus file ini dari daftar?")) return;
      btn.disabled = true;
      btn.textContent = "...";
      const { ok } = await api("/api/admin/delete", { method: "POST", body: { id: btn.dataset.id } });
      if (ok) {
        loadAdminData();
      } else {
        btn.disabled = false;
        btn.textContent = "Hapus";
        alert("Gagal menghapus, coba lagi.");
      }
    });
  });
}

async function loadAdminData() {
  const { ok, status, data } = await api("/api/admin/list");
  if (ok) {
    showAdmin();
    renderExisting(data.items || []);
  } else if (status === 401) {
    showLogin();
  } else {
    showLogin();
    loginError.hidden = false;
    loginError.textContent = "Terjadi kesalahan. Coba refresh halaman.";
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const password = document.getElementById("passwordInput").value;
  const submitBtn = loginForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  const { ok, data } = await api("/api/admin/login", { method: "POST", body: { password } });
  submitBtn.disabled = false;
  if (ok) {
    document.getElementById("passwordInput").value = "";
    loadAdminData();
  } else {
    loginError.hidden = false;
    loginError.textContent = (data && data.error) || "Password salah.";
  }
});

logoutBtn.addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" });
  showLogin();
});

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  createError.hidden = true;
  createSuccess.hidden = true;

  const payload = {
    title: document.getElementById("titleInput").value,
    thumbnailUrl: document.getElementById("thumbnailInput").value,
    downloadUrl: document.getElementById("downloadInput").value,
    fileName: document.getElementById("fileNameInput").value,
    size: document.getElementById("sizeInput").value,
    resolution: document.getElementById("resolutionInput").value,
    fps: document.getElementById("fpsInput").value,
    codec: document.getElementById("codecInput").value,
  };

  const submitBtn = createForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  const { ok, data } = await api("/api/admin/create", { method: "POST", body: payload });
  submitBtn.disabled = false;

  if (ok) {
    createSuccess.hidden = false;
    createForm.reset();
    document.getElementById("resolutionInput").value = "1080p";
    document.getElementById("fpsInput").value = "60";
    document.getElementById("codecInput").value = "H.264";
    loadAdminData();
  } else {
    createError.hidden = false;
    createError.textContent = (data && data.error) || "Gagal menambah file.";
  }
});

loadAdminData();
