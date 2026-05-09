# 🌳 Manola API - Project Structure

Dokumentasi struktur folder dan file untuk proyek **Manola API**.

## 📂 File Tree
```text
manola-api/
├── 📄 .env                    # Environment variables (Database URL, JWT Secret)
├── 📄 .gitignore              # Daftar file yang diabaikan Git
├── 📄 package.json            # Konfigurasi proyek & dependensi
├── 📄 swagger.json            # Dokumentasi API (Format JSON/OpenAPI)
├── 📄 file_tree.md            # Dokumentasi struktur proyek (File ini)
├── 📂 prisma/                 # Database ORM (Prisma)
│   ├── 📄 schema.prisma       # Definisi skema database & model
│   └── 📂 migrations/         # Histori migrasi database
├── 📂 public/                 # File statis
│   └── 📂 uploads/            # Direktori penyimpanan file yang diunggah
└── 📂 src/                    # Kode sumber aplikasi
    ├── 📄 app.js              # Inisialisasi & konfigurasi Express
    ├── 📄 server.js           # Entry point server (Port listening)
    ├── 📂 libs/               # Library & Utility eksternal
    │   ├── 📄 prisma.js       # Instansiasi Prisma Client
    │   └── 📄 mailer.js       # Konfigurasi pengiriman Email (Nodemailer)
    ├── 📂 middlewares/        # Middleware Express
    │   ├── 📄 auth.middleware.js   # Validasi Token JWT
    │   └── 📄 upload.middleware.js # Konfigurasi Multer (Upload file)
    └── 📂 modules/            # Logika Bisnis (Modular)
        ├── 📂 auth/           # Login & Register
        ├── 📂 employees/      # Manajemen Karyawan
        ├── 📂 orders/         # Manajemen Pesanan
        ├── 📂 payments/       # Status Pembayaran
        ├── 📂 products/       # Manajemen Produk
        ├── 📂 restocks/       # Manajemen Stok Masuk
        ├── 📂 reviews/        # Ulasan Produk
        ├── 📂 suppliers/      # Manajemen Supplier
        └── 📂 wishlists/      # Daftar Keinginan (Wishlist)
```

---

## 🛠️ Deskripsi Detail

| Folder / File | Deskripsi |
| :--- | :--- |
| **`src/server.js`** | File utama yang dijalankan untuk menyalakan server. |
| **`src/app.js`** | Tempat konfigurasi Express, CORS, dan pendaftaran rute utama. |
| **`src/modules/`** | Berisi folder-folder fitur. Setiap fitur memiliki file `controller.js` (logika API), `routes.js` (jalur URL), dan `service.js` (interaksi database). |
| **`src/libs/mailer.js`** | Menangani integrasi pengiriman email (misalnya untuk reset password atau notifikasi). |
| **`src/middlewares/`** | Berisi fungsi pengecekan sebelum request diproses (misalnya: apakah user sudah login?). |
| **`prisma/`** | Semua hal terkait database. Jika ingin menambah kolom di tabel, edit `schema.prisma`. |
| **`public/uploads/`** | Tempat semua gambar/file yang diunggah melalui API akan disimpan. |
| **`.env`** | **Sangat Penting!** Jangan bagikan file ini. Berisi kredensial database. |

---
*Terakhir diperbarui: 9 Mei 2026*
