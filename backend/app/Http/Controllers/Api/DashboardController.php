<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Absensi;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function siswa(Request $request)
    {
        $user = $request->user();
        
        // Tugas yang belum dikumpulkan
        $tugasBelumDikumpulkan = Tugas::whereNotIn('id', function($query) use ($user) {
            $query->select('tugas_id')
                  ->from('pengumpulan_tugas')
                  ->where('user_id', $user->id);
        })
        ->where(function($query) use ($user) {
            $query->where('mata_pelajaran', '!=', 'JURUSAN')
                  ->orWhere(function($q) use ($user) {
                      $q->where('mata_pelajaran', 'JURUSAN')
                        ->where('jurusan', $user->jurusan);
                  });
        })
        ->with('creator')
        ->get();

        // Absensi hari ini
        $absenHariIni = Absensi::where('user_id', $user->id)
            ->where('tanggal', Carbon::today())
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'tugas_belum_dikumpulkan' => $tugasBelumDikumpulkan,
                'absen_hari_ini' => $absenHariIni,
                'total_tugas_pending' => $tugasBelumDikumpulkan->count(),
            ]
        ]);
    }

    public function guru(Request $request)
    {
        // Statistik siswa per jurusan
        $siswaPerJurusan = User::where('role', 'siswa')
            ->selectRaw('jurusan, COUNT(*) as jumlah')
            ->groupBy('jurusan')
            ->get();

        $totalSiswa = User::where('role', 'siswa')->count();

        // Statistik absensi hari ini
        $absensiHariIni = Absensi::where('tanggal', Carbon::today())
            ->selectRaw('status, COUNT(*) as jumlah')
            ->groupBy('status')
            ->get();

        // Absensi pending yang perlu persetujuan
        $absensiPending = Absensi::where('status', 'pending')
            ->with('user')
            ->latest()
            ->get();

        // Tugas yang sudah lewat deadline
        $tugasTerlambat = PengumpulanTugas::where('terlambat', true)
            ->whereNull('nilai')
            ->with(['tugas', 'user'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'siswa_per_jurusan' => $siswaPerJurusan->map(function($item) use ($totalSiswa) {
                    return [
                        'jurusan' => $item->jurusan,
                        'jumlah' => $item->jumlah,
                        'persentase' => $totalSiswa > 0 ? round(($item->jumlah / $totalSiswa) * 100, 1) : 0
                    ];
                }),
                'absensi_hari_ini' => $absensiHariIni->map(function($item) {
                    return [
                        'status' => $item->status,
                        'jumlah' => $item->jumlah,
                    ];
                }),
                'absensi_pending' => $absensiPending,
                'tugas_terlambat' => $tugasTerlambat,
            ]
        ]);
    }

    public function admin(Request $request)
    {
        // Statistik user per role
        $userPerRole = User::selectRaw('role, COUNT(*) as jumlah')
            ->groupBy('role')
            ->get();

        $totalUser = User::count();

        // Total statistik
        $totalStats = [
            'total_siswa' => User::where('role', 'siswa')->count(),
            'total_guru' => User::where('role', 'guru')->count(),
            'total_admin' => User::where('role', 'admin')->count(),
            'total_tugas' => Tugas::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'user_per_role' => $userPerRole->map(function($item) use ($totalUser) {
                    return [
                        'role' => $item->role,
                        'jumlah' => $item->jumlah,
                        'persentase' => $totalUser > 0 ? round(($item->jumlah / $totalUser) * 100, 1) : 0
                    ];
                }),
                'total_stats' => $totalStats,
            ]
        ]);
    }
}

