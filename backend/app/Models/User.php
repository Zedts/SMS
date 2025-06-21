<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'jurusan', 'mata_pelajaran', 
        'nisn', 'nip', 'profile_photo'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function absensi()
    {
        return $this->hasMany(Absensi::class);
    }

    public function tugas()
    {
        return $this->hasMany(Tugas::class, 'created_by');
    }

    public function pengumpulanTugas()
    {
        return $this->hasMany(PengumpulanTugas::class);
    }

    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class);
    }
}

