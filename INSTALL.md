# Panduan Instalasi Sistem Manajemen Siswa

## Langkah-langkah Instalasi

### 1. Persiapan Environment

Pastikan Anda sudah menginstall:
- PHP 8.1 atau lebih tinggi
- Composer
- Node.js 18 atau lebih tinggi
- MySQL atau MariaDB
- Git (opsional)

### 2. Setup Backend (Laravel)

1. **Extract dan masuk ke direktori backend:**
```bash
cd student-management-system/backend
```

2. **Install dependencies PHP:**
```bash
composer install
```

3. **Copy file environment:**
```bash
cp .env.example .env
```

4. **Generate application key:**
```bash
php artisan key:generate
```

5. **Konfigurasi database:**
Edit file `.env` dan sesuaikan dengan database Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_management
DB_USERNAME=root
DB_PASSWORD=19222619
```

6. **Buat database:**
Buat database baru dengan nama `student_management` di MySQL/MariaDB Anda.

7. **Jalankan migration dan seeder:**
```bash
php artisan migrate --seed
```

8. **Jalankan server Laravel:**
```bash
php artisan serve
```

Server akan berjalan di `http://localhost:8000`

### 3. Setup Frontend (React)

1. **Buka terminal baru dan masuk ke direktori frontend:**
```bash
cd student-management-system/frontend
```

2. **Install dependencies Node.js:**
```bash
npm install
```
atau jika menggunakan pnpm:
```bash
pnpm install
```

3. **Jalankan development server:**
```bash
npm run dev
```
atau jika menggunakan pnpm:
```bash
pnpm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Testing Aplikasi

Buka browser dan akses `http://localhost:5173`

Login dengan akun demo:

**Admin:**
- Email: admin@sekolah.com
- Password: password123

**Guru:**
- Email: sari@sekolah.com
- Password: password123

**Siswa:**
- Email: andi@student.com
- Password: password123

### 5. Konfigurasi Tambahan (Opsional)

#### Untuk Notifikasi Real-time:
Jika ingin menggunakan notifikasi real-time, Anda perlu:

1. **Daftar akun Pusher** di https://pusher.com
2. **Update file .env** dengan kredensial Pusher:
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

3. **Install Laravel Echo Server** (alternatif gratis):
```bash
npm install -g laravel-echo-server
laravel-echo-server init
laravel-echo-server start
```

#### Untuk File Upload:
```bash
cd backend
php artisan storage:link
```

### 6. Troubleshooting

#### Error "could not find driver":
Install ekstensi PHP yang diperlukan:
```bash
# Ubuntu/Debian
sudo apt install php-mysql php-sqlite3 php-mbstring php-xml php-zip

# CentOS/RHEL
sudo yum install php-mysql php-sqlite3 php-mbstring php-xml php-zip
```

#### Error CORS:
Pastikan URL frontend sudah benar di `backend/config/cors.php`

#### Error Permission:
```bash
cd backend
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

### 7. Production Deployment

#### Backend:
1. Upload ke server
2. Install dependencies: `composer install --optimize-autoloader --no-dev`
3. Set environment: `APP_ENV=production` dan `APP_DEBUG=false`
4. Cache config: `php artisan config:cache`
5. Cache routes: `php artisan route:cache`

#### Frontend:
1. Build: `npm run build`
2. Upload folder `dist` ke web server
3. Configure web server untuk SPA routing

## Struktur Folder

```
student-management-system/
├── backend/                 # Laravel API
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/               # React App
│   ├── src/
│   ├── public/
│   └── ...
└── README.md
```

## Support

Jika mengalami masalah, periksa:
1. Log Laravel di `backend/storage/logs/laravel.log`
2. Console browser untuk error JavaScript
3. Network tab untuk error API

Pastikan kedua server (Laravel dan React) berjalan bersamaan untuk development.

