export type LocalizedFaq = {
  category: { id: string; en: string };
  q: { id: string; en: string };
  a: { id: string; en: string };
};

export const FAQ_ITEMS: LocalizedFaq[] = [
  {
    category: { id: "Pesanan", en: "Orders" },
    q: { id: "Bagaimana cara pesan?", en: "How do I place an order?" },
    a: {
      id: "Pilih produk, masukkan ke keranjang, lalu lanjutkan checkout. Isi data penerima, pilih pengiriman, dan selesaikan pembayaran yang tersedia.",
      en: "Choose a product, add it to your cart, then continue to checkout. Enter the recipient details, choose shipping, and complete an available payment method.",
    },
  },
  {
    category: { id: "Pesanan", en: "Orders" },
    q: {
      id: "Apakah pesanan bisa diubah atau dibatalkan?",
      en: "Can I change or cancel an order?",
    },
    a: {
      id: "Pesanan masih dapat dibatalkan selama berstatus menunggu pembayaran. Untuk perubahan lain, segera hubungi GESA atau WhatsApp dengan nomor pesanan.",
      en: "An order can still be cancelled while it is awaiting payment. For other changes, contact GESA or WhatsApp promptly with your order number.",
    },
  },
  {
    category: { id: "Pengiriman", en: "Shipping" },
    q: { id: "Ongkos kirim berapa?", en: "How much is shipping?" },
    a: {
      id: "Ongkir dihitung otomatis saat checkout berdasarkan area tujuan dan layanan kurir yang dipilih.",
      en: "Shipping is calculated automatically at checkout based on the destination and selected courier service.",
    },
  },
  {
    category: { id: "Pengiriman", en: "Shipping" },
    q: { id: "Berapa lama pengiriman?", en: "How long does delivery take?" },
    a: {
      id: "Pesanan biasanya diproses dalam 1 hari kerja setelah pembayaran dikonfirmasi. Estimasi berikutnya mengikuti layanan kurir yang dipilih.",
      en: "Orders are generally processed within one business day after payment is confirmed. The remaining estimate follows the selected courier service.",
    },
  },
  {
    category: { id: "Pengiriman", en: "Shipping" },
    q: {
      id: "Bagaimana cara melacak pesanan?",
      en: "How do I track my order?",
    },
    a: {
      id: "Buka tab Pesanan. Pesanan akun atau pesanan yang dibuat dari perangkat ini akan tampil bersama status dan nomor resi jika sudah tersedia.",
      en: "Open the Orders tab. Account orders or orders made on this device will appear with their status and tracking number when available.",
    },
  },
  {
    category: { id: "Pembayaran", en: "Payment" },
    q: {
      id: "Metode pembayaran apa saja yang tersedia?",
      en: "Which payment methods are available?",
    },
    a: {
      id: "Metode pembayaran mengikuti pilihan yang ditampilkan Midtrans saat checkout, seperti transfer bank, virtual account, QRIS, dan metode lain yang tersedia.",
      en: "Payment methods follow the options shown by Midtrans at checkout, such as bank transfer, virtual account, QRIS, and other available methods.",
    },
  },
  {
    category: { id: "Pembayaran", en: "Payment" },
    q: {
      id: "Pembayaran sudah dilakukan tetapi status belum berubah, bagaimana?",
      en: "I paid, but the status has not changed. What should I do?",
    },
    a: {
      id: "Tunggu beberapa menit. Jika status belum berubah setelah 30 menit, hubungi GESA atau WhatsApp dan sertakan nomor pesanan serta bukti pembayaran.",
      en: "Wait a few minutes. If the status has not changed after 30 minutes, contact GESA or WhatsApp with the order number and payment proof.",
    },
  },
  {
    category: { id: "Produk", en: "Products" },
    q: { id: "Apakah produknya original?", en: "Are the products authentic?" },
    a: {
      id: "Ya, produk yang dijual Morgen Geschäft adalah produk original dari merek resmi.",
      en: "Yes. Products sold by Morgen Geschäft are authentic products from official brands.",
    },
  },
  {
    category: { id: "Produk", en: "Products" },
    q: {
      id: "Bagaimana memilih produk yang cocok?",
      en: "How do I choose a suitable product?",
    },
    a: {
      id: "Periksa manfaat, bahan aktif, dan rekomendasi pada detail produk. Kamu juga dapat memakai Kuis Tipe Kulit atau bertanya kepada GESA sebagai panduan awal.",
      en: "Check the benefits, active ingredients, and recommendations in the product details. You can also use the Skin Type Quiz or ask GESA as an initial guide.",
    },
  },
  {
    category: { id: "Pengembalian", en: "Returns" },
    q: {
      id: "Bagaimana jika produk rusak atau salah kirim?",
      en: "What if a product arrives damaged or incorrect?",
    },
    a: {
      id: "Buka tab Pesanan dan ajukan retur maksimal 3×24 jam setelah pesanan diterima. Sertakan penjelasan serta 1–3 foto bukti.",
      en: "Open the Orders tab and submit a return within 3×24 hours after delivery. Include an explanation and 1–3 evidence photos.",
    },
  },
  {
    category: { id: "Pengembalian", en: "Returns" },
    q: {
      id: "Apakah produk yang sudah dibuka bisa dikembalikan?",
      en: "Can an opened product be returned?",
    },
    a: {
      id: "Produk yang sudah dibuka tidak dapat dikembalikan, kecuali terbukti rusak, cacat, atau tidak sesuai pesanan saat diterima.",
      en: "Opened products cannot be returned unless they were damaged, defective, or different from the order when received.",
    },
  },
  {
    category: { id: "Akun", en: "Account" },
    q: {
      id: "Apa manfaat masuk atau daftar?",
      en: "What are the benefits of signing in or registering?",
    },
    a: {
      id: "Akun menyimpan riwayat pesanan, alamat utama, poin, kode referral, dan saldo referral. Pendaftaran cukup memakai email dan kode OTP.",
      en: "An account keeps your order history, primary address, points, referral code, and referral credit. Registration only requires email and an OTP.",
    },
  },
];

export const PRIVACY_SECTIONS = [
  {
    id: "Data yang kami kumpulkan",
    en: "Data we collect",
    bodyId:
      "Kami memproses data yang diperlukan untuk akun, pesanan, pembayaran, pengiriman, bantuan pelanggan, dan keamanan layanan. Data pembayaran sensitif diproses oleh penyedia pembayaran dan tidak disimpan sebagai kunci rahasia di aplikasi.",
    bodyEn:
      "We process data needed for accounts, orders, payments, shipping, customer support, and service security. Sensitive payment data is handled by the payment provider and is not stored as a secret key in the app.",
  },
  {
    id: "Cara data digunakan",
    en: "How data is used",
    bodyId:
      "Data digunakan untuk menyelesaikan pesanan, mengirim pembaruan, menangani retur, mencegah penyalahgunaan, serta meningkatkan layanan.",
    bodyEn:
      "Data is used to fulfil orders, send updates, handle returns, prevent abuse, and improve the service.",
  },
  {
    id: "Penyimpanan dan pilihan pengguna",
    en: "Storage and user choices",
    bodyId:
      "Sebagian data seperti keranjang, wishlist, riwayat akses pesanan tamu, dan status notifikasi disimpan pada perangkat. Kamu dapat menghapusnya dengan menghapus data aplikasi.",
    bodyEn:
      "Some data, such as the cart, wishlist, guest-order access history, and notification state, is stored on the device. You can remove it by clearing the app data.",
  },
  {
    id: "Kontak",
    en: "Contact",
    bodyId:
      "Hubungi kanal resmi Morgen Geschäft jika ingin menanyakan akses, koreksi, atau penghapusan data yang berkaitan dengan akunmu.",
    bodyEn:
      "Contact Morgen Geschäft through its official channels to ask about access, correction, or deletion of data related to your account.",
  },
];

export const TERMS_SECTIONS = [
  {
    id: "Pesanan dan pembayaran",
    en: "Orders and payment",
    bodyId:
      "Pesanan dianggap masuk setelah sistem membuat nomor pesanan. Pemrosesan dilanjutkan setelah pembayaran terkonfirmasi, kecuali metode atau kanal penjualan menentukan lain.",
    bodyEn:
      "An order is considered placed after the system creates an order number. Processing continues after payment is confirmed unless the payment method or sales channel states otherwise.",
  },
  {
    id: "Harga, stok, dan promo",
    en: "Prices, stock, and promotions",
    bodyId:
      "Harga, stok, kupon, dan promo dapat berubah. Nilai yang berlaku adalah yang berhasil divalidasi sistem pada saat checkout.",
    bodyEn:
      "Prices, stock, coupons, and promotions may change. The applicable value is the one successfully validated by the system at checkout.",
  },
  {
    id: "Pengiriman",
    en: "Shipping",
    bodyId:
      "Estimasi pengiriman bergantung pada kurir dan alamat tujuan. Keterlambatan di luar kendali toko akan dibantu penelusurannya melalui kanal layanan pelanggan.",
    bodyEn:
      "Delivery estimates depend on the courier and destination. Delays outside the store’s control will be assisted through customer-support channels.",
  },
  {
    id: "Retur",
    en: "Returns",
    bodyId:
      "Pengajuan retur mengikuti batas waktu dan bukti yang tertera di aplikasi. Jangan mengirim produk kembali sebelum menerima arahan dari tim Morgen Geschäft.",
    bodyEn:
      "Return requests follow the time limit and evidence requirements shown in the app. Do not send a product back before receiving instructions from the Morgen Geschäft team.",
  },
];
