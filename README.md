# RawSend Export Hub

Website "export queue" buat mejeng thumbnail + tombol download project video kamu. Sekarang ada **halaman admin terkunci password** (`/admin.html`) buat nambah/hapus file langsung dari browser — tidak perlu edit kode atau push ulang ke GitHub tiap kali nambah file.

## Struktur file

```
index.html, styles.css, app.js   -> halaman publik (nampilin daftar file)
admin.html, admin.css, admin.js  -> halaman admin (password + form tambah/hapus)
api/items.js                      -> publik: kirim daftar file (tanpa link download asli)
api/download.js                   -> publik: redirect ke link download asli
api/admin/login.js, logout.js     -> cek password, bikin/hapus sesi login
api/admin/list.js                 -> khusus admin: daftar lengkap (link asli kelihatan)
api/admin/create.js, delete.js    -> khusus admin: tambah/hapus file
api/_lib/                          -> kode bantu server (bukan endpoint publik)
package.json                       -> daftar dependency (@vercel/blob)
```

Data (judul, link thumbnail, link download, ukuran, dst) disimpan di **Vercel Blob** — bukan lagi hardcode di kode — jadi nambah file lewat form admin langsung tersimpan permanen tanpa perlu deploy ulang.

## Setup sebelum deploy (wajib, sekali saja)

### 1. Push ke GitHub, lalu import ke Vercel
Import repo ini di https://vercel.com/new. Framework biarkan "Other" — tidak perlu build command, Vercel otomatis `npm install` untuk membaca `package.json`.

### 2. Aktifkan Vercel Blob
Di dashboard project Vercel → tab **Storage** → **Create Database** → pilih **Blob** → beri nama bebas → connect ke project ini. Vercel otomatis mengatur akses tokennya, kamu tidak perlu copy-paste apa pun.

### 3. Set 2 Environment Variable (INI YANG BIKIN PASSWORD AMAN)
Di dashboard project → **Settings → Environment Variables**, tambahkan:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | password pilihan kamu sendiri, buat yang kuat & jangan dipakai di tempat lain |
| `ADMIN_SESSION_SECRET` | string acak panjang, cuma dipakai sistem, tidak perlu dihafal. Contoh yang bisa langsung dipakai: `febd8f22406b31a817cc9490b43ee6706ddfa64e1b2a8793d11940253b3b7b0d` (atau bikin sendiri string acak sepanjang itu) |

Dua nilai ini **tidak pernah ada di kode / repo GitHub** — hanya tersimpan di server Vercel, jadi walau repo-nya publik, password tidak akan pernah kelihatan orang lain.

Setelah menambahkan, klik **Redeploy** supaya env var-nya kepakai.

### 4. Buka halaman admin
Akses `https://nama-project-kamu.vercel.app/admin.html`, masukkan password, lalu mulai tambah file lewat form: **Judul, link thumbnail, link download, nama file, ukuran, resolusi/fps/codec**.

## Cara kerja penyembunyian link download

- Halaman publik (`index.html`) ambil data dari `/api/items` — endpoint ini **tidak pernah mengirim link download asli** ke browser, cuma `/api/download?id=...`.
- Waktu tombol diklik, `/api/download` yang baca link asli dari database lalu redirect. Link aslinya tidak muncul di view-source atau "copy link address".
- Ini bukan proteksi mutlak — orang yang cukup teknis bisa lihat tujuan redirect lewat tab **Network** di DevTools. Tapi ini cukup buat mencegah orang awam nyalin-tempel link mentah.
- Link **thumbnail** sengaja tetap dikirim apa adanya ke publik, karena memang cuma gambar preview yang wajar dilihat.

## Login admin

- Password diverifikasi di server (`api/admin/login.js`), dibandingkan dengan `ADMIN_PASSWORD` — **tidak pernah dikirim atau disimpan di sisi browser**.
- Setelah login benar, server kasih cookie sesi yang di-signed (HMAC) dan `HttpOnly` (JavaScript di browser tidak bisa membacanya), berlaku 6 jam, otomatis expired setelah itu.
- Semua endpoint tambah/hapus file (`api/admin/create.js`, `api/admin/delete.js`, `api/admin/list.js`) mengecek cookie ini di server sebelum mengizinkan apa pun — jadi meskipun seseorang tahu URL `/admin.html`, mereka tetap butuh password yang benar.
- Catatan jujur: ini sistem password sederhana untuk penggunaan pribadi, bukan sistem keamanan tingkat enterprise (tidak ada rate-limiting canggih / 2FA). Cukup untuk mencegah orang random iseng nambah/hapus file kamu.

## Hal-hal teknis yang perlu diketahui

- **Untuk file besar dari Google Drive**: kalau kamu tetap mau pakai Drive untuk link download, ingat file di atas ±100MB kadang kena halaman "tidak bisa scan virus" alih-alih langsung download. Untuk video ekspor RawSend yang bitrate tinggi, pertimbangkan host lain yang memang didesain untuk direct-download file besar (Cloudflare R2, Backblaze B2, dll), atau kompres/split.
- **Batas fungsi di paket gratis (Hobby)**: project ini pakai 7 serverless function (items, download, admin/login, logout, list, create, delete) — masih jauh di bawah batas 12 punya Vercel Hobby.
- Development lokal (`vercel dev`) butuh `vercel env pull` dulu supaya env var-nya kebaca di komputer kamu — tapi untuk pemakaian sehari-hari, kamu tidak perlu develop lokal sama sekali, cukup lewat `/admin.html` di situs yang sudah live.
