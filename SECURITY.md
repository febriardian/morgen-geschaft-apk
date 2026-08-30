# Security Policy

## Pelaporan kerentanan

Jangan membuat GitHub issue publik untuk dugaan kerentanan. Kirim laporan ke `morgengeschaft@gmail.com` dengan subjek `Security Report — Morgen Geschäft Mobile`.

Sertakan:

- versi aplikasi atau commit yang terpengaruh;
- langkah reproduksi yang aman;
- dampak yang diamati;
- bukti teknis yang tidak memuat data pelanggan atau credential;
- saran perbaikan jika ada.

Laporan akan ditinjau, divalidasi, dan ditangani secara terkoordinasi. Hindari mengakses data pihak lain, mengganggu layanan, melakukan social engineering, atau memublikasikan detail sebelum perbaikan tersedia.

## Versi yang didukung

Perbaikan keamanan diterapkan pada versi terbaru di branch utama dan rilis aplikasi terbaru.

## Batas keamanan client

Aplikasi mobile tidak boleh menyimpan server key, service account, private key, password layanan, atau webhook secret. Semua nilai `EXPO_PUBLIC_*` dianggap dapat dibaca dari bundle aplikasi.
