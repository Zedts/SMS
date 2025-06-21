<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tugas;
use App\Models\Absensi;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Admin
        User::create([
            'name' => 'Admin Utama',
            'email' => 'admin@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Guru
        $guru1 = User::create([
            'name' => 'Bu Sari',
            'email' => 'sari@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'mata_pelajaran' => 'MTK',
            'nip' => '12345678901',
        ]);

        $guru2 = User::create([
            'name' => 'Mr. John',
            'email' => 'john@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'mata_pelajaran' => 'ENGLISH',
            'nip' => '12345678902',
        ]);

        $guru3 = User::create([
            'name' => 'Pak Budi',
            'email' => 'budi@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
            'mata_pelajaran' => 'JURUSAN',
            'nip' => '12345678903',
        ]);

        // Siswa RPL
        $siswaRPL = [
            ['name' => 'Andi Pratama', 'email' => 'andi@student.com', 'nisn' => '1001'],
            ['name' => 'Budi Santoso', 'email' => 'budi@student.com', 'nisn' => '1002'],
            ['name' => 'Citra Dewi', 'email' => 'citra@student.com', 'nisn' => '1003'],
            ['name' => 'Dani Kurniawan', 'email' => 'dani@student.com', 'nisn' => '1004'],
            ['name' => 'Eka Putri', 'email' => 'eka@student.com', 'nisn' => '1005'],
        ];

        foreach ($siswaRPL as $siswa) {
            User::create([
                'name' => $siswa['name'],
                'email' => $siswa['email'],
                'password' => Hash::make('password123'),
                'role' => 'siswa',
                'jurusan' => 'RPL',
                'nisn' => $siswa['nisn'],
            ]);
        }

        // Siswa TKJ
        $siswaTKJ = [
            ['name' => 'Fajar Ramadhan', 'email' => 'fajar@student.com', 'nisn' => '2001'],
            ['name' => 'Gita Sari', 'email' => 'gita@student.com', 'nisn' => '2002'],
            ['name' => 'Hadi Susanto', 'email' => 'hadi@student.com', 'nisn' => '2003'],
            ['name' => 'Indah Lestari', 'email' => 'indah@student.com', 'nisn' => '2004'],
        ];

        foreach ($siswaTKJ as $siswa) {
            User::create([
                'name' => $siswa['name'],
                'email' => $siswa['email'],
                'password' => Hash::make('password123'),
                'role' => 'siswa',
                'jurusan' => 'DKV',
                'nisn' => $siswa['nisn'],
            ]);
        }

        // Siswa MM
        $siswaMM = [
            ['name' => 'Joko Widodo', 'email' => 'joko@student.com', 'nisn' => '3001'],
            ['name' => 'Kania Putri', 'email' => 'kania@student.com', 'nisn' => '3002'],
            ['name' => 'Lutfi Ahmad', 'email' => 'lutfi@student.com', 'nisn' => '3003'],
        ];

        foreach ($siswaMM as $siswa) {
            User::create([
                'name' => $siswa['name'],
                'email' => $siswa['email'],
                'password' => Hash::make('password123'),
                'role' => 'siswa',
                'jurusan' => 'MP',
                'nisn' => $siswa['nisn'],
            ]);
        }

        // Siswa BR
        $siswaBR = [
            ['name' => 'Maya Sari', 'email' => 'maya@student.com', 'nisn' => '4001'],
            ['name' => 'Nanda Prabowo', 'email' => 'nanda@student.com', 'nisn' => '4002'],
            ['name' => 'Oki Setiawan', 'email' => 'oki@student.com', 'nisn' => '4003'],
        ];

        foreach ($siswaBR as $siswa) {
            User::create([
                'name' => $siswa['name'],
                'email' => $siswa['email'],
                'password' => Hash::make('password123'),
                'role' => 'siswa',
                'jurusan' => 'BR',
                'nisn' => $siswa['nisn'],
            ]);
        }

        // NOTE: Tidak membuat data sample tugas dan absensi
        // Guru dan siswa akan memulai dengan data kosong (default state)
        // Data akan dibuat saat guru membuat tugas dan siswa melakukan absensi
    }
}