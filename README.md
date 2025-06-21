# Sistem Manajemen Siswa

Sistem manajemen siswa berbasis web dengan Laravel backend dan React frontend yang mendukung tiga role: Admin, Guru, dan Siswa.

## Fitur Utama

### Untuk Siswa:
- Dashboard dengan statistik tugas dan absensi
- Sistem absensi digital dengan upload foto bukti
- Akses dan pengumpulan tugas online
- Notifikasi real-time untuk tugas baru dan deadline
- Riwayat absensi dan tugas

### Untuk Guru:
- Dashboard dengan analytics siswa
- Kelola absensi siswa (approve/reject)
- Buat dan distribusi tugas
- Evaluasi hasil pengerjaan siswa
- Notifikasi tugas terlambat

### Untuk Admin:
- Dashboard sistem keseluruhan
- Manajemen pengguna lengkap (CRUD)
- Monitoring dan statistik sistem
- Kontrol akses penuh

## Teknologi yang Digunakan

### Backend:
- Laravel 11.x
- Laravel Sanctum (Authentication)
- MySQL/SQLite Database
- Laravel Echo + Pusher (Real-time notifications)

### Frontend:
- React 19.x
- Tailwind CSS
- shadcn/ui Components
- Axios (HTTP Client)
- Context API (State Management)

## Instalasi

### Prasyarat:
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL (atau SQLite untuk development)

### Backend Setup:

1. Masuk ke direktori backend:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy file environment:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Konfigurasi database di file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_management
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migration dan seeder:
```bash
php artisan migrate --seed
```

7. Jalankan server:
```bash
php artisan serve
```

### Frontend Setup:

1. Masuk ke direktori frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# atau
pnpm install
```

3. Jalankan development server:
```bash
npm run dev
# atau
pnpm run dev
```

## Akun Demo

Setelah menjalankan seeder, Anda dapat login dengan akun berikut:

### Admin:
- Email: admin@sekolah.com
- Password: password123

### Guru:
- Email: sari@sekolah.com
- Password: password123

### Siswa:
- Email: andi@student.com
- Password: password123

## Struktur Database

### Tabel Users:
- id, name, email, password
- role (admin/guru/siswa)
- jurusan (untuk siswa)
- mata_pelajaran (untuk guru)
- nisn (untuk siswa)
- nip (untuk guru)

### Tabel Absensi:
- id, user_id, tanggal, waktu_absen
- status (pending/hadir/tidak_hadir)
- keterangan, bukti_foto

### Tabel Tugas:
- id, creator_id, judul, deskripsi
- mata_pelajaran, jurusan, deadline
- file_tugas

### Tabel Pengumpulan Tugas:
- id, tugas_id, user_id, waktu_submit
- jawaban_text, file_jawaban
- nilai, feedback

### Tabel Notifikasi:
- id, user_id, tipe, judul, pesan
- dibaca, created_at

## API Endpoints

### Authentication:
- POST `/api/login` - Login
- POST `/api/logout` - Logout
- GET `/api/me` - Get user info

### Dashboard:
- GET `/api/dashboard/{role}` - Get dashboard data

### Absensi:
- GET `/api/absensi` - List absensi
- POST `/api/absensi` - Create absensi
- PATCH `/api/absensi/{id}/approve` - Approve absensi
- PATCH `/api/absensi/{id}/reject` - Reject absensi

### Tugas:
- GET `/api/tugas` - List tugas
- POST `/api/tugas` - Create tugas
- POST `/api/tugas/{id}/submit` - Submit tugas
- GET `/api/tugas/{id}/submissions` - Get submissions
- PATCH `/api/submissions/{id}/grade` - Grade submission

### Users (Admin only):
- GET `/api/users` - List users
- POST `/api/users` - Create user
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user

### Notifikasi:
- GET `/api/notifikasi` - List notifications
- PATCH `/api/notifikasi/{id}/read` - Mark as read
- PATCH `/api/notifikasi/read-all` - Mark all as read
- GET `/api/notifikasi/unread-count` - Get unread count

## Fitur Real-time

Sistem menggunakan Laravel Echo dengan Pusher untuk notifikasi real-time:
- Notifikasi tugas baru untuk siswa
- Notifikasi tugas terlambat
- Update status absensi

## Development

### Backend:
- Jalankan `php artisan serve` untuk development server
- Gunakan `php artisan migrate:fresh --seed` untuk reset database
- Log tersimpan di `storage/logs/laravel.log`

### Frontend:
- Jalankan `npm run dev` untuk development server
- Build production dengan `npm run build`
- Preview build dengan `npm run preview`

## Deployment

### Backend:
1. Upload files ke server
2. Install dependencies: `composer install --optimize-autoloader --no-dev`
3. Set environment: `APP_ENV=production`
4. Generate key: `php artisan key:generate`
5. Run migrations: `php artisan migrate --force`
6. Cache config: `php artisan config:cache`

### Frontend:
1. Build production: `npm run build`
2. Upload `dist` folder ke web server
3. Configure web server untuk SPA routing

## Troubleshooting

### Database Connection Error:
- Pastikan MySQL service berjalan
- Periksa konfigurasi database di `.env`
- Untuk development, bisa gunakan SQLite

### CORS Error:
- Pastikan frontend URL sudah ditambahkan di `config/cors.php`
- Periksa konfigurasi API base URL di frontend

### File Upload Error:
- Pastikan direktori `storage/app/public` writable
- Jalankan `php artisan storage:link`

## Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

## Lisensi

MIT License

