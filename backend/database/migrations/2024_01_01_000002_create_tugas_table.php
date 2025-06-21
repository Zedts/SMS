<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tugas', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('deskripsi');
            $table->enum('mata_pelajaran', ['MTK', 'ENGLISH', 'JURUSAN']);
            $table->string('jurusan')->nullable(); // khusus untuk mata pelajaran JURUSAN
            $table->text('file_tugas')->nullable();
            $table->datetime('deadline');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tugas');
    }
};

