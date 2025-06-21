<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    use HasFactory;

    protected $table = 'tugas';
    
    protected $fillable = [
        'judul', 'deskripsi', 'mata_pelajaran', 'jurusan',
        'file_tugas', 'deadline', 'created_by'
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pengumpulan()
    {
        return $this->hasMany(PengumpulanTugas::class);
    }
}

