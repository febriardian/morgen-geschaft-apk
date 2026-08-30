# Changelog

Semua perubahan penting pada project ini didokumentasikan di file ini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) dan versi mengikuti [Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- Dokumentasi publik utama dan panduan teknis lengkap.
- GitHub Actions untuk format, lint, typecheck, test, pemeriksaan repository, dan export Android.
- Dependabot, template issue, dan template pull request.
- Unit test untuk logika notifikasi dan normalisasi aset.
- Pemeriksaan link Markdown dan file sensitif.

### Changed

- Menetapkan Node.js 22.13 melalui `engines` dan `.nvmrc`.
- Menyamakan label versi pada layar akun dengan versi aplikasi `1.2.0`.
- Melengkapi tipe artikel dengan properti `coverImage`.
- Merapikan format source dan konfigurasi.

### Security

- Menghapus izin mikrofon Android yang tidak digunakan.
- Memperketat `.gitignore` dan menyederhanakan `.env.example` ke variabel yang digunakan aplikasi.

## 1.2.0 - 2026-08-30

### Added

- Pelacakan pesanan lengkap, pembayaran lanjutan, pembatalan, retur, dan live tracking.
- Autentikasi OTP dengan logo aplikasi.
- Promo, artikel, ulasan, FAQ, notifikasi, informasi toko, serta halaman legal.
- Bahasa Indonesia dan Inggris.
