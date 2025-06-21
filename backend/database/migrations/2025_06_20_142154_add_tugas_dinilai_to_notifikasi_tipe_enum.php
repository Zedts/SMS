<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the enum to include 'tugas_dinilai'
        DB::statement("ALTER TABLE notifikasi MODIFY COLUMN tipe ENUM('tugas_terlambat', 'absen_pending', 'tugas_baru', 'tugas_dinilai')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum
        DB::statement("ALTER TABLE notifikasi MODIFY COLUMN tipe ENUM('tugas_terlambat', 'absen_pending', 'tugas_baru')");
    }
};
