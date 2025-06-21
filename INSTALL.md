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
