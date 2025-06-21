<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Absensi;
use App\Models\Notifikasi;
use Carbon\Carbon;
use App\Events\NotificationSent;

class AbsensiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = Absensi::with(['user', 'approver']);

            // Jika role siswa, hanya tampilkan absensi milik sendiri
            if ($user->role === 'siswa') {
                $query->where('user_id', $user->id);
            }
            // Jika role guru atau admin, tampilkan semua absensi siswa
            // (tidak ada filter tambahan untuk guru/admin)

            // Filter berdasarkan tanggal jika ada
            if ($request->has('tanggal') && $request->tanggal) {
                $query->whereDate('tanggal', $request->tanggal);
            }

            // Filter berdasarkan status jika ada
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Order by tanggal terbaru dan waktu absen
            $absensi = $query->orderBy('tanggal', 'desc')
                             ->orderBy('waktu_absen', 'desc')
                             ->paginate(20); // Tingkatkan per page untuk guru

            return response()->json([
                'success' => true,
                'data' => $absensi
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching absensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data absensi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'keterangan' => 'nullable|string',
                'bukti_foto' => 'nullable|image|max:2048'
            ]);

            $user = $request->user();

            // Cek apakah sudah absen hari ini
            $existingAbsen = Absensi::where('user_id', $user->id)
                ->where('tanggal', Carbon::today())
                ->first();

            if ($existingAbsen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan absensi hari ini'
                ], 400);
            }

            $data = [
                'user_id' => $user->id,
                'tanggal' => Carbon::today(),
                'waktu_absen' => Carbon::now(),
                'status' => 'pending',
                'keterangan' => $request->keterangan
            ];

            // Handle file upload
            if ($request->hasFile('bukti_foto')) {
                $file = $request->file('bukti_foto');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('absensi', $filename, 'public');
                $data['bukti_foto'] = $path;
            }

            $absensi = Absensi::create($data);

            // Kirim notifikasi ke guru/admin bahwa ada absensi pending
            $this->sendAbsensiPendingNotification($absensi);

            return response()->json([
                'success' => true,
                'message' => 'Absensi berhasil disubmit',
                'data' => $absensi->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Error submitting absensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal submit absensi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id)
    {
        try {
            $absensi = Absensi::with(['user'])->findOrFail($id);
            
            $absensi->update([
                'status' => 'hadir',
                'approved_by' => $request->user()->id
            ]);

            // Kirim notifikasi ke siswa bahwa absensi telah disetujui
            $this->sendAbsensiApprovedNotification($absensi);

            return response()->json([
                'success' => true,
                'message' => 'Absensi berhasil disetujui',
                'data' => $absensi->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Error approving absensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui absensi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        try {
            $request->validate([
                'keterangan' => 'required|string'
            ]);

            $absensi = Absensi::with(['user'])->findOrFail($id);
            
            $absensi->update([
                'status' => 'tidak_hadir',
                'approved_by' => $request->user()->id,
                'keterangan' => $request->keterangan
            ]);

            // Kirim notifikasi ke siswa bahwa absensi telah ditolak
            $this->sendAbsensiRejectedNotification($absensi, $request->keterangan);

            return response()->json([
                'success' => true,
                'message' => 'Absensi berhasil ditolak',
                'data' => $absensi->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Error rejecting absensi: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak absensi: ' . $e->getMessage()
            ], 500);
        }
    }

    private function sendAbsensiPendingNotification($absensi)
    {
        try {
            // Kirim notifikasi ke semua guru dan admin
            $recipients = \App\Models\User::whereIn('role', ['guru', 'admin'])->get();
            
            foreach ($recipients as $recipient) {
                $notifikasi = Notifikasi::create([
                    'user_id' => $recipient->id,
                    'judul' => 'Absensi Pending: ' . $absensi->user->name,
                    'pesan' => $absensi->user->name . ' telah mengajukan absensi pada ' . $absensi->tanggal->format('d/m/Y') . ' dan menunggu persetujuan',
                    'tipe' => 'absen_pending'
                ]);

                // Broadcast notifikasi real-time
                broadcast(new NotificationSent($notifikasi))->toOthers();
            }
        } catch (\Exception $e) {
            \Log::error('Error sending absensi pending notification: ' . $e->getMessage());
        }
    }

    private function sendAbsensiApprovedNotification($absensi)
    {
        try {
            $siswa = $absensi->user;
            
            if ($siswa) {
                $notifikasi = Notifikasi::create([
                    'user_id' => $siswa->id,
                    'judul' => 'Absensi Disetujui',
                    'pesan' => 'Absensi Anda pada tanggal ' . $absensi->tanggal->format('d/m/Y') . ' telah disetujui',
                    'tipe' => 'absen_approved'
                ]);

                // Broadcast notifikasi real-time
                broadcast(new NotificationSent($notifikasi))->toOthers();
            }
        } catch (\Exception $e) {
            \Log::error('Error sending absensi approved notification: ' . $e->getMessage());
        }
    }

    private function sendAbsensiRejectedNotification($absensi, $reason)
    {
        try {
            $siswa = $absensi->user;
            
            if ($siswa) {
                $notifikasi = Notifikasi::create([
                    'user_id' => $siswa->id,
                    'judul' => 'Absensi Ditolak',
                    'pesan' => 'Absensi Anda pada tanggal ' . $absensi->tanggal->format('d/m/Y') . ' ditolak. Alasan: ' . $reason,
                    'tipe' => 'absen_rejected'
                ]);

                // Broadcast notifikasi real-time
                broadcast(new NotificationSent($notifikasi))->toOthers();
            }
        } catch (\Exception $e) {
            \Log::error('Error sending absensi rejected notification: ' . $e->getMessage());
        }
    }
}

