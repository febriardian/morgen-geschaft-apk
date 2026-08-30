# Dokumentasi Morgen Geschäft Mobile

Dokumentasi ini menjelaskan aplikasi pelanggan Morgen Geschäft versi `1.2.0`, mulai dari penggunaan fitur hingga arsitektur, konfigurasi, quality gate, dan operasional rilis.

## 1. Tentang project

Morgen Geschäft Mobile adalah aplikasi React Native untuk pelanggan toko skincare Morgen Geschäft. Aplikasi menyediakan pengalaman belanja native di Android dan menggunakan backend HTTPS yang sama sebagai sumber produk, promo, artikel, ulasan, akun, transaksi, dan status pengiriman.

Repository ini berisi aplikasi klien mobile. Proses server, panel administrasi, database remote, integrasi credential, dan penerima webhook berjalan pada layanan backend yang dikonfigurasi melalui `EXPO_PUBLIC_API_BASE`.

## 2. Tujuan dan sasaran pengguna

Tujuan aplikasi adalah membuat alur penemuan produk hingga layanan setelah pembelian dapat dilakukan dari satu aplikasi.

| Peran            | Cakupan                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tamu             | Melihat konten, memakai keranjang dan wishlist lokal, checkout, serta mengakses pesanan yang dibuat pada perangkat yang sama |
| Pelanggan        | Seluruh fungsi tamu ditambah akun, alamat, reward, referral, notifikasi akun, dan riwayat pesanan lintas perangkat           |
| Operator layanan | Mengelola data dan pesanan melalui sistem backend/panel web terpisah; perubahan data aktif dimuat aplikasi melalui API       |
| Contributor      | Mengembangkan aplikasi, menjalankan quality gate, dan mengirim pull request                                                  |

Tidak ada menu administrasi atau otorisasi staf di dalam aplikasi pelanggan ini.

## 3. Fitur pelanggan

### Belanja

- Beranda berisi promo, produk populer, ulasan, artikel, dan pintasan fitur.
- Katalog mendukung pencarian nama dan filter kategori.
- Detail produk menampilkan harga, stok, deskripsi, detail tambahan, kandungan, produk terkait, dan pendaftaran notifikasi stok.
- Keranjang mengatur jumlah berdasarkan stok aktif; wishlist disimpan pada perangkat.

### Checkout dan pembayaran

- Checkout dapat dilakukan sebagai tamu atau pelanggan terautentikasi.
- Area tujuan, tarif, layanan kurir, serta token penawaran ditentukan melalui backend.
- Kupon diverifikasi server; poin dan saldo referral mengikuti aturan akun dari server.
- Transaksi memakai idempotency key dan halaman pembayaran Midtrans dibuka melalui browser aman.

### Pesanan dan layanan setelah pembelian

- Pesanan akun dan pesanan tamu pada perangkat digabung tanpa duplikasi.
- Pencarian pesanan memakai ID dan bukti akses yang sesuai.
- Detail menampilkan status, timeline, produk, nilai transaksi, alamat, kurir, dan resi.
- Pelacakan memuat perjalanan paket dan membuka live tracking Biteship.
- Pesanan pending pada perangkat dapat melanjutkan pembayaran atau dibatalkan memakai token tersimpan.
- Pesanan yang memenuhi syarat dapat diajukan retur dengan bukti foto.

### Konten dan keterlibatan

- Promo, kupon, ulasan, foto ulasan, artikel, dan notifikasi.
- Baseline notifikasi mencegah perangkat baru menampilkan notifikasi lama sebagai notifikasi baru.
- Kuis tipe kulit, asisten GESA, FAQ, informasi toko, kebijakan privasi, dan syarat ketentuan.
- Pilihan Bahasa Indonesia dan Inggris tersimpan di perangkat.

## 4. Fitur operator dan role lain

Aplikasi menerima perubahan produk, stok, harga, promo, artikel, ulasan, notifikasi, akun, transaksi, dan pengiriman dari backend. Operasi administratif dilakukan di luar client mobile, sehingga repository ini tidak memuat route admin, credential layanan, atau kontrol database.

Contributor dapat menjalankan format, lint, typecheck, unit test, pemeriksaan repository, dan export bundle Android tanpa akses produksi.

## 5. Panduan penggunaan setiap fitur

### Menjelajahi dan membeli produk

1. Buka **Beranda** atau **Katalog**.
2. Gunakan pencarian dan kategori, lalu buka detail produk.
3. Pilih **Tambah ke keranjang** dan atur jumlah pada tab **Keranjang**.
4. Pilih **Lanjut ke checkout**.
5. Isi data penerima, alamat, dan area tujuan.
6. Pilih kurir, terapkan kupon atau reward, lalu buka pembayaran Midtrans.

### Masuk atau mendaftar

1. Buka tab **Akun** dan pilih **Masuk / Daftar**.
2. Isi email serta kode referral opsional.
3. Masukkan enam digit OTP yang dikirim ke email.
4. Setelah verifikasi, sesi Firebase disimpan oleh SecureStore.

Endpoint OTP menentukan apakah email menjadi akun baru atau masuk ke akun yang sudah ada.

### Melacak pesanan

1. Buka tab **Pesanan**.
2. Pilih riwayat atau masukkan ID pesanan.
3. Untuk pesanan akun, masuk dengan email yang sama.
4. Buka detail untuk melihat timeline, resi, pengiriman, dan live tracking.

### Mengajukan retur

1. Buka pesanan berstatus diterima dan pilih **Ajukan retur**.
2. Pilih masalah dan solusi, lalu tulis deskripsi minimal 20 karakter.
3. Lampirkan bukti foto dan kirim formulir.

### Ulasan, notifikasi, dan konten

- Buka **Ulasan** untuk mengirim rating, komentar, produk, dan foto opsional atau menandai ulasan membantu.
- Buka **Notifikasi** untuk membaca atau menyembunyikan pemberitahuan baru.
- Buka **Artikel**, **Promo**, **FAQ**, **Kuis Kulit**, atau **GESA** dari Beranda/Akun.
- Tekan `ID` atau `EN` di header untuk mengganti bahasa.

## 6. Arsitektur frontend, backend, database, dan layanan eksternal

### Aplikasi mobile

- **Expo Router** memetakan file di `src/app` menjadi route.
- **StoreProvider** memuat konten publik, sesi, akun, keranjang, wishlist, dan bahasa.
- **Komponen UI** menyediakan screen, header, tombol, field, kartu produk, dan empty state.
- **API client** menambahkan base URL, JSON header, bearer token opsional, timeout, dan normalisasi error.

### Backend

REST API pada `EXPO_PUBLIC_API_BASE` memvalidasi harga, stok, kupon, reward, akses pesanan, transaksi, payment gateway, tarif pengiriman, dan perubahan status.

### Penyimpanan

| Penyimpanan      | Data                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| AsyncStorage     | Keranjang, wishlist, bahasa, status notifikasi, dan penanda ulasan membantu                  |
| SecureStore      | Sesi Firebase dan akses pesanan tamu termasuk token pembatalan/pembayaran                    |
| Database backend | Produk, promo, artikel, ulasan, pelanggan, pesanan, reward, notifikasi, dan data operasional |

### Layanan eksternal

| Layanan                   | Penggunaan                                                           |
| ------------------------- | -------------------------------------------------------------------- |
| Firebase Identity Toolkit | Menukar custom token dan memperbarui ID token pelanggan              |
| Midtrans                  | Menampilkan sesi pembayaran yang dibuat backend                      |
| Biteship                  | Area, tarif, pengiriman, tracking, dan live tracking melalui backend |
| WhatsApp                  | Kanal bantuan pesanan melalui tautan `wa.me`                         |
| EAS Build                 | Development build dan APK Android                                    |

## 7. Struktur repository

```text
src/app/                  Route dan layar aplikasi
src/app/(tabs)/           Beranda, katalog, keranjang, pesanan, akun
src/app/product/[id].tsx  Detail produk
src/app/article/[id].tsx  Detail artikel
src/app/return/[orderId]  Form retur
src/components/           Komponen UI bersama
src/constants/            Warna, endpoint default, tautan, dan konten statis
src/context/              State global aplikasi
src/lib/                  API, autentikasi, notifikasi, akses pesanan
src/types/                Kontrak data TypeScript
assets/images/            Aset visual yang dibundel
tests/                    Unit test logika murni
scripts/                  Pemeriksaan repository
.github/                  Otomasi dan template GitHub
```

## 8. Prasyarat dan instalasi lokal

Gunakan Node.js versi pada `.nvmrc`.

```bash
nvm use
npm ci
cp .env.example .env
npm run start
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm run start
```

Nyalakan emulator Android lalu tekan `a`. Modul native diuji paling akurat dengan development build dari profil `development` pada `eas.json`.

## 9. Konfigurasi environment

| Nama                           | Diperlukan     | Contoh aman                         | Keterangan                                |
| ------------------------------ | -------------- | ----------------------------------- | ----------------------------------------- |
| `EXPO_PUBLIC_API_BASE`         | Ya             | `https://example.com`               | URL backend HTTPS tanpa slash akhir       |
| `EXPO_PUBLIC_STORE_WHATSAPP`   | Ya             | `6280000000000`                     | Nomor bantuan internasional tanpa `+`     |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Ya untuk login | `replace_with_firebase_web_api_key` | Firebase Web API key milik aplikasi klien |

Semua variabel `EXPO_PUBLIC_*` menjadi bagian bundle dan dapat dibaca pengguna. Credential server ditempatkan pada backend, bukan pada repository atau konfigurasi client.

## 10. Autentikasi dan pengelolaan akun

1. Client meminta challenge melalui `/api/customer-auth/request-otp`.
2. Client mengirim OTP melalui `/api/customer-auth/verify-otp`.
3. Backend mengembalikan Firebase custom token.
4. Client menukar token melalui Firebase Identity Toolkit.
5. ID token dan refresh token disimpan di SecureStore.
6. API client mengirim bearer token pada endpoint berautentikasi.
7. Menjelang kedaluwarsa, sesi diperbarui melalui Google Secure Token API.
8. Logout menghapus sesi dari SecureStore dan state aplikasi.

Data `/api/customer/account` mencakup profil, poin, referral, alamat, pesanan, aturan reward, dan transaksi reward sesuai respons server.

## 11. Integrasi layanan eksternal

### Firebase

Firebase Web API key dipakai untuk endpoint client resmi. Backend membuat custom token setelah OTP diverifikasi. Service account tetap berada di server.

### Midtrans

Client meminta transaksi ke `/api/create-transaction`, menyimpan referensi pesanan pada SecureStore, lalu membuka `redirect_url`. Nilai transaksi dihitung dan divalidasi server.

### Biteship

Client tidak menyimpan API key Biteship. Pencarian area, tarif, dan tracking diproksikan melalui backend. Live tracking dibuka dari URL pesanan atau halaman tracking Biteship.

### Tautan eksternal

Halaman Tentang membuka WhatsApp, email, Shopee, Telegram, dan TikTok melalui URL publik pada `src/constants/store.ts`.

## 12. Model data atau koleksi database

Model TypeScript utama berada di `src/types/store.ts`:

| Model         | Data utama                                                               |
| ------------- | ------------------------------------------------------------------------ |
| `Product`     | ID, nama, gambar, harga, stok, kategori, terjemahan, dan atribut produk  |
| `Promotion`   | Kode, tipe diskon, nilai, minimum pesanan, dan terjemahan                |
| `Review`      | Identitas, rating, komentar, foto, status pembelian, dan jumlah membantu |
| `BlogPost`    | Judul, ringkasan, isi, cover, kategori, tanggal, dan estimasi baca       |
| `AccountData` | Pelanggan, aturan reward, pesanan, dan transaksi reward                  |
| `Order`       | Status, nilai, penerima, item, pengiriman, tracking, timeline, dan retur |

Model remote merepresentasikan payload API, bukan definisi koleksi database. Skema dan migrasi database dikelola oleh backend.

## 13. Referensi API dan webhook

`src/lib/api.ts` mengirim JSON secara default, mendukung `FormData`, timeout 20 detik, serta bearer token opsional.

### Konten dan pelanggan

| Metode | Endpoint                          | Fungsi                                      |
| ------ | --------------------------------- | ------------------------------------------- |
| GET    | `/api/products`                   | Daftar produk                               |
| GET    | `/api/promotions`                 | Promo dan kupon publik                      |
| GET    | `/api/testimoni`                  | Ulasan publik                               |
| GET    | `/api/blogs`                      | Artikel                                     |
| GET    | `/api/flash-sales/current`        | Flash sale aktif                            |
| POST   | `/api/customer-auth/request-otp`  | Meminta OTP                                 |
| POST   | `/api/customer-auth/verify-otp`   | Memverifikasi OTP dan menerima custom token |
| GET    | `/api/customer/account`           | Data akun terautentikasi                    |
| POST   | `/api/customer/account/addresses` | Menyimpan alamat akun                       |
| GET    | `/api/customer/notifications`     | Notifikasi akun                             |

### Checkout dan pesanan

| Metode | Endpoint                                      | Fungsi                                  |
| ------ | --------------------------------------------- | --------------------------------------- |
| GET    | `/api/shipping/areas?input=...`               | Mencari area tujuan                     |
| POST   | `/api/shipping/rates`                         | Meminta tarif dan quote token           |
| POST   | `/api/coupons/validate`                       | Memvalidasi kupon                       |
| POST   | `/api/create-transaction`                     | Membuat pesanan dan sesi pembayaran     |
| POST   | `/api/orders/lookup`                          | Mengambil pesanan dengan akses yang sah |
| POST   | `/api/orders/:orderId/cancel`                 | Membatalkan pesanan pending             |
| POST   | `/api/orders/:orderId/payment-expire-check`   | Menyinkronkan status pembayaran         |
| GET    | `/api/shipping/track?waybill=...&courier=...` | Mengambil perjalanan paket              |
| POST   | `/api/returns`                                | Mengirim pengajuan retur multipart      |

### Konten interaktif

| Metode | Endpoint                     | Fungsi                       |
| ------ | ---------------------------- | ---------------------------- |
| POST   | `/api/testimoni`             | Mengirim ulasan              |
| POST   | `/api/testimoni/photo`       | Mengunggah foto ulasan       |
| POST   | `/api/testimoni/:id/helpful` | Mengubah penanda membantu    |
| POST   | `/api/notify-stock`          | Mendaftarkan notifikasi stok |
| POST   | `/api/chat`                  | Mengirim percakapan ke GESA  |
| GET    | `/api/notifications`         | Notifikasi publik            |
| POST   | `/api/notifications/orders`  | Notifikasi pesanan tamu      |

### Webhook

Aplikasi mobile tidak menerima webhook. Callback payment gateway dan pengiriman diterima serta diverifikasi backend. Client membaca hasil melalui endpoint akun, lookup pesanan, pemeriksaan pembayaran, notifikasi, dan tracking.

## 14. Keamanan

- Seluruh koneksi produksi menggunakan HTTPS.
- Server key, service account, private key, dan webhook secret tidak berada di client.
- Harga, stok, kupon, reward, transaksi, dan akses pesanan divalidasi backend.
- Bearer token serta token akses pesanan disimpan di SecureStore.
- Preferensi dan data belanja non-sensitif disimpan di AsyncStorage.
- Request transaksi membawa idempotency key; request API memiliki timeout dan error terstruktur.
- `.gitignore` mengecualikan environment lokal, credential, binary, log, backup, upload, dan build output.
- Kerentanan dilaporkan melalui [SECURITY.md](../SECURITY.md).

## 15. Testing dan quality gate

```bash
npm run format:check    # Format source dan dokumentasi
npm run lint            # ESLint melalui konfigurasi Expo
npm run typecheck       # TypeScript strict
npm test                # Unit test melalui tsx
npm run check:links     # Link dan aset lokal Markdown
npm run check:sensitive # File terlarang dan pola credential
npm run doctor          # Konsistensi dependensi Expo
npm run build           # Export bundle Android
```

`npm run validate` menjalankan quality gate repository dan export Android dalam satu perintah. Unit test mencakup baseline/filter notifikasi serta normalisasi URL aset. Alur checkout, pembayaran, akun, dan tracking memakai backend uji yang kompatibel untuk pengujian integrasi.

## 16. Build dan deployment secara umum

```bash
# Export bundle lokal
npm run build

# Development build
npx eas-cli@latest build --platform android --profile development

# APK pengujian
npx eas-cli@latest build --platform android --profile preview

# APK distribusi langsung
npx eas-cli@latest build --platform android --profile production-apk

# Build store
npx eas-cli@latest build --platform android --profile production-store
```

Naikkan `expo.version` dan `android.versionCode` pada `app.json` untuk rilis baru. Pertahankan keystore Android yang sama agar pembaruan dapat dipasang di atas versi lama.

## 17. Monitoring, backup, dan operasional

- Pantau GitHub Actions pada setiap pull request.
- Jalankan `npm run doctor` ketika menaikkan Expo SDK atau dependensi native.
- Gunakan EAS Build logs untuk kegagalan kompilasi dan `adb logcat` untuk runtime Android.
- Simpan source melalui Git beserta tag rilis.
- Simpan keystore Android di penyimpanan terenkripsi dengan salinan cadangan terpisah.
- Publikasikan APK bersama versi, tanggal, checksum SHA-256, dan catatan perubahan.
- Backup database, upload pelanggan, credential, dan konfigurasi webhook dilakukan pada lingkungan backend dan tidak dimasukkan ke repository mobile.

## 18. Troubleshooting

### Data toko gagal dimuat

- Pastikan `EXPO_PUBLIC_API_BASE` memakai HTTPS, dapat diakses perangkat, dan tanpa slash akhir.
- Periksa respons `/api/products` dan koneksi emulator.

### Login OTP gagal

- Pastikan `EXPO_PUBLIC_FIREBASE_API_KEY` berasal dari konfigurasi web Firebase yang sesuai.
- Pastikan endpoint OTP backend aktif dan email dapat diterima.
- Hapus sesi aplikasi lalu masuk kembali jika refresh token dicabut.

### Gambar produk tidak muncul

- Pastikan backend mengirim URL publik atau path dari domain API.
- `absoluteAssetUrl` mengubah gambar lama di `/photos` dari PNG/JPEG ke WebP dan mengenkode spasi.
- Verifikasi file WebP tersedia pada server.

### Pesanan tamu tidak muncul pada perangkat lain

Token pesanan tamu disimpan pada SecureStore perangkat saat checkout. Masuk dengan email terverifikasi yang sama untuk memuat pesanan akun pada perangkat lain.

### Perubahan kode tidak terlihat

```bash
npx expo start --clear
```

APK terpasang memerlukan build baru untuk menerima perubahan source. Perubahan data backend dimuat saat aplikasi melakukan refresh.

### Build EAS gagal

```bash
npm ci
npm run validate
npm run doctor
```

Pastikan versi Node sesuai `.nvmrc`, lalu periksa log EAS pada tahap pertama yang gagal.

## 19. Panduan kontribusi

1. Fork repository dan buat branch perubahan yang terfokus.
2. Pertahankan TypeScript strict dan gunakan alias `@/` untuk import dari `src`.
3. Gunakan komponen bersama dari `src/components/ui.tsx` untuk konsistensi.
4. Jangan memasukkan credential, `.env`, binary, upload, backup, atau data pelanggan.
5. Tambahkan atau perbarui test untuk logika yang berubah.
6. Jalankan `npm run validate`.
7. Jelaskan dampak, cara uji, dan tangkapan layar perubahan UI pada pull request.

Semua kontribusi mengikuti [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).

## 20. MIT License

Morgen Geschäft Mobile dilisensikan dengan [MIT License](../LICENSE). Contributor menyetujui distribusi kontribusinya di bawah lisensi yang sama.
