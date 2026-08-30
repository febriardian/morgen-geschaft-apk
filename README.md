<p align="center">
  <img src="assets/images/icon.png" alt="Logo Morgen Geschäft" width="128" height="128">
</p>

# Morgen Geschäft Mobile

Aplikasi pelanggan Android untuk menjelajahi produk skincare, berbelanja, membayar, dan melacak pesanan Morgen Geschäft. Aplikasi dibangun dengan React Native, Expo, dan TypeScript serta terhubung ke backend melalui HTTPS.

## Fitur utama

- Katalog, pencarian, kategori, detail produk, stok, wishlist, dan keranjang.
- Checkout tamu atau akun dengan pencarian area, pilihan kurir, kupon, poin, dan saldo referral.
- Pembayaran melalui halaman aman Midtrans dan pengiriman yang terhubung ke Biteship.
- Autentikasi email OTP, profil pelanggan, alamat, reward, dan riwayat pesanan.
- Pelacakan pesanan, perjalanan paket, pembatalan, dan pengajuan retur dengan bukti foto.
- Promo, ulasan pelanggan, artikel, notifikasi, kuis tipe kulit, dan asisten GESA.
- Antarmuka Bahasa Indonesia dan Inggris.

## Teknologi

- React Native 0.86 dan React 19
- Expo SDK 57 dan Expo Router
- TypeScript 6
- AsyncStorage dan Expo SecureStore
- EAS Build untuk APK Android

## Arsitektur singkat

Aplikasi memuat konten toko dari REST API, menyimpan preferensi non-sensitif di AsyncStorage, dan menyimpan sesi serta akses pesanan tamu di SecureStore. Autentikasi memakai custom token Firebase. Pembayaran dibuka di browser aman Midtrans, sedangkan tarif dan pelacakan pengiriman diproses backend melalui Biteship.

## Struktur repository

```text
.
├── .github/            # Workflow, Dependabot, dan template kontribusi
├── assets/images/      # Ikon, logo, maskot, dan ikon tab
├── docs/README.md      # Dokumentasi lengkap
├── scripts/            # Pemeriksaan link dan file sensitif
├── src/
│   ├── app/            # Route dan layar Expo Router
│   ├── components/     # Komponen UI bersama
│   ├── constants/      # Konstanta tampilan dan konten statis
│   ├── context/        # State toko, akun, keranjang, dan wishlist
│   ├── lib/            # API, autentikasi, notifikasi, dan penyimpanan
│   └── types/          # Model TypeScript
├── tests/              # Unit test
├── app.json            # Konfigurasi Expo
├── eas.json            # Profil EAS Build
└── package.json        # Dependensi dan perintah proyek
```

## Persyaratan

- Node.js 22.13.x dan npm 10 atau lebih baru
- Android Studio dengan emulator, atau perangkat Android untuk development build
- Backend Morgen Geschäft yang dapat diakses melalui HTTPS
- Firebase Web API key untuk pertukaran custom token pelanggan

## Menjalankan secara lokal

```bash
npm ci
cp .env.example .env
npm run start
```

Isi `.env` dengan konfigurasi lingkungan pengembangan. Pada Windows PowerShell, gunakan `Copy-Item .env.example .env`. Tekan `a` pada terminal Expo untuk membuka Android.

Variabel publik yang digunakan:

| Variabel                       | Fungsi                                       |
| ------------------------------ | -------------------------------------------- |
| `EXPO_PUBLIC_API_BASE`         | URL dasar backend HTTPS tanpa `/` di akhir   |
| `EXPO_PUBLIC_STORE_WHATSAPP`   | Nomor bantuan dalam format internasional     |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key untuk autentikasi klien |

Jangan menaruh server key, service account, password, private key, atau token backend dalam variabel `EXPO_PUBLIC_*`.

## Quality gate dan build

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run check:links
npm run check:sensitive
npm run build
```

Untuk membuat APK pengujian melalui EAS:

```bash
npx eas-cli@latest build --platform android --profile preview
```

## Dokumentasi

Panduan fitur, arsitektur, API, keamanan, operasional, dan troubleshooting tersedia di [docs/README.md](docs/README.md).

## Kontribusi

Fork repository, buat branch dari branch utama, pertahankan perubahan tetap terfokus, jalankan `npm run validate`, lalu kirim pull request menggunakan template yang tersedia. Dengan berpartisipasi, contributor menyetujui [Code of Conduct](CODE_OF_CONDUCT.md).

## Keamanan

Jangan melaporkan kerentanan melalui issue publik. Ikuti proses pelaporan pada [SECURITY.md](SECURITY.md).

## Lisensi

Kode sumber tersedia di bawah [MIT License](LICENSE).
