<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengumpulanTugas extends Model
{
    use HasFactory;

    protected $table = 'pengumpulan_tugas';
    
    protected $fillable = [
        'tugas_id', 'user_id', 'file_jawaban', 'jawaban_text',
        'waktu_submit', 'terlambat', 'nilai', 'feedback'
    ];

    protected $casts = [
        'waktu_submit' => 'datetime',
        'terlambat' => 'boolean',
    ];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

