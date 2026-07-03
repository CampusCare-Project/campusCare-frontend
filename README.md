# 📱 CampusCare — Aplikasi Mobile Pelaporan Kerusakan Fasilitas Kampus

CampusCare adalah aplikasi mobile berbasis **React Native + Expo** yang memungkinkan civitas akademika (mahasiswa, staf, teknisi, dan admin) untuk **melaporkan, memantau, dan mengelola kerusakan fasilitas kampus** secara terpusat dan real-time.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Peran Pengguna](#-peran-pengguna)
- [Teknologi & Dependensi](#-teknologi--dependensi)
- [Struktur Folder](#-struktur-folder)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Cara Menjalankan](#-cara-menjalankan)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🔐 Autentikasi | Login & Registrasi berbasis JWT |
| 📝 Pelaporan | Buat laporan kerusakan lengkap dengan foto, lokasi, & kategori |
| 📋 Manajemen Laporan | Lihat, filter, dan pantau status laporan |
| 🛡️ Panel Admin | Verifikasi/tolak laporan, assign teknisi |
| 🛠️ Panel Teknisi | Terima tugas, update status perbaikan, tambahkan catatan |
| 🔔 Notifikasi | Pemberitahuan real-time atas perubahan status laporan |
| 📦 Mode Offline | Antrian laporan tersimpan lokal saat koneksi terputus (SQLite) |
| 📍 Geolokasi | Penandaan titik lokasi kerusakan menggunakan GPS |
| 🖼️ Upload Media | Lampirkan foto dari kamera/galeri |
| 🏷️ Kategori & Lokasi | Manajemen kategori kerusakan dan data lokasi kampus |

---

## 👤 Peran Pengguna

```
STUDENT  → Buat & pantau laporan kerusakan
STAFF    → Buat & pantau laporan kerusakan
ADMIN    → Verifikasi laporan, assign teknisi, kelola kategori/lokasi/user
TECHNICIAN → Terima tugas, update status & tambahkan catatan perbaikan
```

---

## 📦 Teknologi & Dependensi

### Runtime & Framework

| Paket | Versi | Keterangan |
|---|---|---|
| `expo` | `^55.0.0` | Platform utama React Native |
| `react` | `19.2.0` | Library UI |
| `react-native` | `0.83.6` | Framework mobile |
| `react-native-web` | `^0.21.2` | Dukungan web (Expo Web) |

### Navigasi

| Paket | Versi | Keterangan |
|---|---|---|
| `@react-navigation/native` | `^7.1.21` | Core navigasi |
| `@react-navigation/native-stack` | `^7.8.0` | Stack navigator |
| `@react-navigation/bottom-tabs` | `^7.18.2` | Bottom tab navigator |
| `react-native-screens` | `~4.23.0` | Optimasi layar navigasi |
| `react-native-safe-area-context` | `~5.6.2` | Safe area handling |
| `react-native-gesture-handler` | `~2.30.0` | Gesture support |

### State Management

| Paket | Versi | Keterangan |
|---|---|---|
| `@reduxjs/toolkit` | `^2.12.0` | Redux modern (slice-based) |
| `react-redux` | `^9.3.0` | Binding Redux ke React |

### Jaringan & API

| Paket | Versi | Keterangan |
|---|---|---|
| `axios` | `^1.13.2` | HTTP client ke backend |
| `@react-native-community/netinfo` | `^11.4.1` | Deteksi status koneksi jaringan |

### Penyimpanan & Offline

| Paket | Versi | Keterangan |
|---|---|---|
| `expo-sqlite` | `~55.0.16` | Database SQLite lokal (mode offline) |
| `@react-native-async-storage/async-storage` | `^2.2.0` | Penyimpanan token & preferensi |

### Fitur Device

| Paket | Versi | Keterangan |
|---|---|---|
| `expo-image-picker` | `~55.0.20` | Akses kamera & galeri |
| `expo-location` | `~55.1.10` | GPS & geolokasi |
| `expo-document-picker` | `~55.0.13` | Pemilihan dokumen/file |
| `expo-file-system` | `~55.0.22` | Akses file system |
| `@react-native-community/datetimepicker` | `8.6.0` | Pemilih tanggal & waktu |

### UI & UX

| Paket | Versi | Keterangan |
|---|---|---|
| `sonner-native` | `^0.26.2` | Toast notification |
| `expo-status-bar` | `55.0.6` | Kontrol status bar |
| `react-native-worklets` | `0.7.4` | Worklet untuk animasi |

### Dev Dependencies

| Paket | Versi | Keterangan |
|---|---|---|
| `typescript` | `~5.9.2` | Static typing |
| `babel-preset-expo` | `~55.0.8` | Preset Babel untuk Expo |
| `babel-plugin-module-resolver` | `^5.0.2` | Path alias (`@/`, `@api/`, dll.) |
| `@types/react` | `~19.2.10` | Type definitions React |

---

## 🗂️ Struktur Folder

```
campuscare-fn/
├── App.tsx                  # Entry point aplikasi
├── app.json                 # Konfigurasi Expo (nama, slug, permissions)
├── babel.config.js          # Konfigurasi Babel & path alias
├── tsconfig.json            # Konfigurasi TypeScript
├── package.json             # Dependensi & scripts
├── .env                     # Environment variables (tidak di-commit)
├── .env.example             # Contoh environment variables
│
├── assets/                  # Aset statis (gambar, ikon, splash)
│
└── src/                     # Source code utama
    ├── App.tsx              # Komponen root (Provider, Router, Toaster)
    ├── RoleGuard.tsx        # Guard akses berbasis peran (role-based access)
    │
    ├── app/                 # Konfigurasi routing & navigasi
    │   ├── router.tsx       # Definisi seluruh stack & tab navigator
    │   ├── AuthBootstrap.tsx# Inisialisasi sesi autentikasi
    │   ├── navigationRef.ts # Navigasi global (tanpa hook)
    │   └── protectedRoute.tsx
    │
    ├── api/                 # Layer komunikasi dengan backend
    │   ├── client.ts        # Setup Axios (base URL, interceptor JWT)
    │   ├── auth/            # Endpoint login, register, refresh token
    │   ├── reports/         # Endpoint laporan kerusakan
    │   ├── categories/      # Endpoint kategori
    │   ├── locations/       # Endpoint lokasi
    │   ├── users/           # Endpoint manajemen user
    │   ├── technicians/     # Endpoint tugas teknisi
    │   ├── media/           # Endpoint upload media/foto
    │   ├── notifications/   # Endpoint notifikasi
    │   ├── feedback/        # Endpoint feedback laporan
    │   └── hooks/           # Custom hooks untuk setiap API
    │
    ├── features/            # Fitur-fitur utama (berdasarkan domain)
    │   ├── login/           # Halaman Login
    │   ├── register/        # Halaman Registrasi
    │   ├── dashboard/       # Halaman Dashboard
    │   ├── reports/         # Daftar laporan, detail, buat laporan, feedback
    │   ├── admin/           # Panel admin (verifikasi, assign teknisi)
    │   ├── technician/      # Panel teknisi (tugas, update status, catatan)
    │   ├── categories/      # Manajemen kategori
    │   ├── locations/       # Manajemen lokasi
    │   ├── users/           # Manajemen user
    │   ├── notifications/   # Halaman notifikasi
    │   ├── profile/         # Halaman profil
    │   ├── media/           # Upload media/foto
    │   ├── offline/         # Antrian laporan offline
    │   └── notFound.tsx     # Halaman 404
    │
    ├── store/               # Redux state management
    │   ├── index.ts         # Konfigurasi Redux store
    │   └── slices/
    │       ├── authSlice.ts         # State autentikasi & user
    │       ├── reportSlice.ts       # State laporan
    │       ├── notificationSlice.ts # State notifikasi
    │       └── offlineSlice.ts      # State antrian offline
    │
    ├── components/          # Komponen UI yang dapat digunakan ulang
    │   ├── Navbar.tsx
    │   ├── Sidebar.tsx
    │   ├── ui/              # Komponen UI atomik (button, input, card, dll.)
    │   └── helper/          # Komponen pembantu
    │
    ├── offline/             # Logika offline (SQLite queue)
    ├── config/              # Konfigurasi aplikasi
    ├── constants/           # Konstanta aplikasi
    ├── types/               # TypeScript type definitions
    ├── utils/               # Fungsi utilitas umum
    ├── layouts/             # Layout halaman
    └── assets/              # Aset gambar/font lokal
```

---

## 💻 Persyaratan Sistem

Pastikan perangkat pengembangan telah memiliki tools berikut:

| Tools | Versi Minimum | Keterangan |
|---|---|---|
| **Node.js** | `>= 18.x` | Runtime JavaScript |
| **npm** | `>= 9.x` | Package manager (atau gunakan `yarn`) |
| **Expo CLI** | `latest` | CLI untuk menjalankan proyek Expo |
| **Git** | `>= 2.x` | Version control |

### Untuk menjalankan di perangkat fisik:
- **Android**: Install aplikasi **Expo Go** dari Google Play Store
- **iOS**: Install aplikasi **Expo Go** dari App Store

### Untuk menjalankan di emulator:
- **Android Emulator**: Android Studio dengan AVD Manager
- **iOS Simulator**: Xcode (hanya di macOS)

### Backend:
Aplikasi ini membutuhkan backend microservices CampusCare yang berjalan. Pastikan backend aktif dan dapat diakses dari perangkat/emulator.

---

## ⚙️ Konfigurasi Environment

Salin file `.env.example` menjadi `.env` di root proyek:

```bash
cp .env.example .env
```

Isi variabel berikut di file `.env`:

```env
# URL base API backend CampusCare
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

> **Catatan penting:**
> - **Emulator Android**: Gunakan `http://10.0.2.2:8080` (bukan `localhost`)
> - **Perangkat fisik**: Gunakan alamat IP laptop di jaringan lokal, contoh: `http://192.168.1.100:8080`
> - **iOS Simulator / Web**: `http://localhost:8080` sudah cukup

---

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone <url-repository>
cd campuscare-fn
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan (lihat bagian Konfigurasi Environment di atas)
```

### 4. Jalankan Aplikasi

**Mode Development (umum):**
```bash
npm start
```
Setelah Expo Dev Server berjalan, akan muncul QR Code di terminal. Scan dengan aplikasi **Expo Go** di perangkat fisik, atau tekan tombol di bawah untuk membuka emulator:

| Perintah | Platform |
|---|---|
| `npm run android` | Jalankan di Android Emulator |
| `npm run ios` | Jalankan di iOS Simulator (macOS) |
| `npm run web` | Jalankan di browser web |

**Mode Development dengan Cache Bersih:**
```bash
npm run start:clear
```
Gunakan perintah ini jika mengalami masalah cache Metro bundler.

**Cek kesehatan proyek:**
```bash
npm run doctor
```
Perintah ini akan memeriksa konfigurasi Expo dan melaporkan jika ada dependensi yang tidak kompatibel.

---

## 📌 Alias Path

Proyek ini menggunakan alias path agar import lebih rapi. Konfigurasi tersedia di [`babel.config.js`](./babel.config.js):

| Alias | Target |
|---|---|
| `@/` | `src/` |
| `@api/` | `src/api/` |
| `@app/` | `src/app/` |
| `@components/` | `src/components/` |
| `@features/` | `src/features/` |
| `@store/` | `src/store/` |
| `@offline/` | `src/offline/` |
| `@utils/` | `src/utils/` |
| `@config/` | `src/config/` |
| `@constants/` | `src/constants/` |

---

## 🔒 Izin Aplikasi

Aplikasi ini membutuhkan izin perangkat berikut:

| Izin | Platform | Keperluan |
|---|---|---|
| `CAMERA` | Android & iOS | Mengambil foto kerusakan |
| `READ_MEDIA_IMAGES` | Android | Akses galeri foto |
| `ACCESS_FINE_LOCATION` | Android | GPS akurat untuk titik laporan |
| `ACCESS_COARSE_LOCATION` | Android | GPS kasar sebagai fallback |

---

> Dikembangkan sebagai bagian dari sistem **CampusCare Microservices**. Pastikan seluruh layanan backend berjalan sebelum menggunakan aplikasi ini.
