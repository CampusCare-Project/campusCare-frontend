# CampusCare React Native Template

Frontend mobile-first untuk project microservices CampusCare.

## Stack

- React Native + Expo + TypeScript
- React Navigation
- Redux Toolkit + React Redux
- AsyncStorage untuk JWT/session
- SQLite via `expo-sqlite` untuk offline queue
- Axios untuk API Gateway
- Expo Image Picker untuk foto laporan
- Expo Location untuk GPS laporan

## Struktur

```txt
campuscare-rn-template/
├─ public/
├─ assets/
├─ src/
│  ├─ api/
│  │  ├─ auth/
│  │  │  ├─ hooks.ts
│  │  │  ├─ service.ts
│  │  │  └─ types.ts
│  │  ├─ reports/
│  │  ├─ media/
│  │  ├─ notifications/
│  │  ├─ categories/
│  │  ├─ locations/
│  │  ├─ technicians/
│  │  ├─ feedback/
│  │  └─ client.ts
│  ├─ app/
│  │  ├─ protectedRoute.tsx
│  │  └─ router.tsx
│  ├─ assets/
│  ├─ components/
│  │  ├─ helper/
│  │  ├─ ui/
│  │  ├─ Navbar.tsx
│  │  └─ Sidebar.tsx
│  ├─ features/
│  │  ├─ login/
│  │  ├─ register/
│  │  ├─ dashboard/
│  │  ├─ reports/
│  │  ├─ admin/
│  │  ├─ technician/
│  │  ├─ media/
│  │  ├─ notifications/
│  │  ├─ offline/
│  │  ├─ profile/
│  │  ├─ categories/
│  │  ├─ locations/
│  │  └─ notFound.tsx
│  ├─ layouts/
│  │  ├─ AuthLayout.tsx
│  │  ├─ DashboardLayout.tsx
│  │  ├─ DashboardLayout1.tsx
│  │  └─ PublicLayout.tsx
│  ├─ store/
│  ├─ offline/
│  ├─ config/
│  ├─ constants/
│  ├─ utils/
│  └─ App.tsx
├─ App.tsx
├─ app.json
├─ package.json
└─ tsconfig.json
```

## Jalankan

```bash
npm install
npx expo start
```

Atau:

```bash
bun install
bunx expo start
```

## Env

Buat `.env` dari `.env.example`.

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

Untuk Android emulator:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080
```

Untuk HP asli:

```env
EXPO_PUBLIC_API_BASE_URL=http://IP_LAPTOP_KAMU:8080
```

## API Gateway yang dibutuhkan

Frontend ini hanya hit API Gateway:

```txt
/api/auth/*          -> auth-service
/api/reports*        -> report-service
/api/categories*     -> report-service
/api/locations*      -> report-service
/api/media*          -> media-service
/api/notifications*  -> notification-service
```

## Fitur dan Hak Akses

### STUDENT / STAFF

- Login/register
- Buat laporan kerusakan
- Upload foto damage
- Lihat laporan milik sendiri
- Lihat detail laporan
- Submit feedback setelah laporan resolved
- Lihat notifikasi
- Offline queue + sync

### ADMIN

- Lihat semua laporan
- Verifikasi laporan
- Tolak laporan
- Assign teknisi
- Update kategori
- Update gedung/ruangan
- Upload additional evidence
- Lihat notifikasi broadcast admin

### TECHNICIAN

- Lihat tugas yang diassign
- Update status ke IN_PROGRESS / RESOLVED / CANCELLED
- Tambah repair note
- Upload repair proof
- Lihat notifikasi assignment

## Offline Storage

SQLite menyimpan laporan yang gagal dikirim saat offline:

```txt
local_reports
```

Saat user menekan Sync:

```txt
SQLite local report
↓
POST /api/reports
↓
Upload media ke /api/media/upload jika ada
↓
Attach media ke /api/reports/:id/media
↓
mark SYNCED
```

## Catatan penting

Screen Assign Technician saat ini menerima `technicianId` manual. Untuk dropdown teknisi yang proper, tambahkan endpoint di auth-service:

```txt
GET /api/auth/users?role=TECHNICIAN
```

Lalu isi data dari `src/api/technicians/service.ts`.
