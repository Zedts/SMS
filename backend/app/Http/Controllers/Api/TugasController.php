<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\User;
use App\Models\Notifikasi;
use Carbon\Carbon;
use App\Events\NotificationSent;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Tugas::with('creator');

        if ($user->role === 'siswa') {
            // Siswa hanya melihat tugas sesuai jurusannya
            $query->where(function($q) use ($user) {
                $q->where('mata_pelajaran', '!=', 'JURUSAN')
                  ->orWhere(function($subQ) use ($user) {
                      $subQ->where('mata_pelajaran', 'JURUSAN')
                           ->where('jurusan', $user->jurusan);
                  });
            });
        } elseif ($user->role === 'guru') {
            // Guru hanya melihat tugas yang dia buat
            $query->where('created_by', $user->id);
        }

        // Filter berdasarkan mata pelajaran jika ada
        if ($request->has('mata_pelajaran')) {
            $query->where('mata_pelajaran', $request->mata_pelajaran);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        $tugas = $query->orderBy('deadline', 'asc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $tugas
        ]);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('TugasController store called', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'mata_pelajaran' => $request->mata_pelajaran,
                'jurusan' => $request->jurusan
            ]);
            
            $request->validate([
                'judul' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'mata_pelajaran' => 'required|in:MTK,ENGLISH,JURUSAN',
                'jurusan' => 'required_if:mata_pelajaran,JURUSAN|nullable|string',
                'deadline' => 'required|date|after:now',
                'file_tugas' => 'nullable|file|max:10240'
            ]);

            $data = $request->only(['judul', 'deskripsi', 'mata_pelajaran', 'deadline']);
            $data['created_by'] = $request->user()->id;
            
            // Tambahkan jurusan hanya jika mata_pelajaran adalah JURUSAN dan jurusan tidak kosong
            if ($request->mata_pelajaran === 'JURUSAN' && !empty($request->jurusan)) {
                $data['jurusan'] = $request->jurusan;
            }

        // Handle file upload
        if ($request->hasFile('file_tugas')) {
            $file = $request->file('file_tugas');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('tugas', $filename, 'public');
            $data['file_tugas'] = $path;
        }

        $tugas = Tugas::create($data);

        // Kirim notifikasi ke siswa yang relevan
        $this->sendTaskNotification($tugas);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dibuat',
            'data' => $tugas->load('creator')
        ]);
        
        } catch (\Exception $e) {
            \Log::error('Error creating tugas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tugas: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $tugas = Tugas::with(['creator', 'pengumpulan.user'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $tugas
        ]);
    }

    public function submit(Request $request, $id)
    {
        $request->validate([
            'jawaban_text' => 'nullable|string',
            'file_jawaban' => 'nullable|file|max:10240'
        ]);

        $tugas = Tugas::findOrFail($id);
        $user = $request->user();

        // Cek apakah sudah submit
        $existingSubmission = PengumpulanTugas::where('tugas_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingSubmission) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah mengumpulkan tugas ini'
            ], 400);
        }

        $data = [
            'tugas_id' => $id,
            'user_id' => $user->id,
            'jawaban_text' => $request->jawaban_text,
            'waktu_submit' => Carbon::now(),
            'terlambat' => Carbon::now()->isAfter($tugas->deadline)
        ];

        // Handle file upload
        if ($request->hasFile('file_jawaban')) {
            $file = $request->file('file_jawaban');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('submissions', $filename, 'public');
            $data['file_jawaban'] = $path;
        }

        $submission = PengumpulanTugas::create($data);

        // Kirim notifikasi ke guru tentang pengumpulan tugas
        $this->sendSubmissionNotification($tugas, $user, $data['terlambat']);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dikumpulkan',
            'data' => $submission->load(['tugas', 'user'])
        ]);
    }

    public function getSubmissions($id)
    {
        $tugas = Tugas::findOrFail($id);
        $submissions = PengumpulanTugas::where('tugas_id', $id)
            ->with('user')
            ->orderBy('waktu_submit', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'tugas' => $tugas,
                'submissions' => $submissions
            ]
        ]);
    }

    public function gradeSubmission(Request $request, $id)
    {
        try {
            $request->validate([
                'nilai' => 'required|integer|min:0|max:100',
                'feedback' => 'nullable|string'
            ]);

            $submission = PengumpulanTugas::with(['tugas', 'user'])->findOrFail($id);
            
            $submission->update([
                'nilai' => $request->nilai,
                'feedback' => $request->feedback
            ]);

            // Kirim notifikasi ke siswa bahwa tugas sudah dinilai
            $this->sendGradedNotification($submission);

            return response()->json([
                'success' => true,
                'message' => 'Nilai berhasil diberikan',
                'data' => $submission->load(['tugas', 'user'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Error grading submission: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memberikan nilai: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAllSubmissions(Request $request)
    {
        $user = $request->user();
        
        // Hanya guru yang bisa mengakses semua pengumpulan
        if ($user->role !== 'guru') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        // Log untuk debugging
        \Log::info('getAllSubmissions called for user: ' . $user->id);
        
        // Ambil semua pengumpulan dari tugas yang dibuat oleh guru ini
        $submissions = PengumpulanTugas::with(['tugas', 'user'])
            ->whereHas('tugas', function($query) use ($user) {
                $query->where('created_by', $user->id);
            })
            ->orderBy('waktu_submit', 'desc')
            ->paginate(20);

        \Log::info('Submissions found: ' . $submissions->total());

        return response()->json([
            'success' => true,
            'data' => $submissions
        ]);
    }

    public function getMySubmissions(Request $request)
    {
        $user = $request->user();
        
        // Hanya siswa yang bisa mengakses pengumpulan sendiri
        if ($user->role !== 'siswa') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $submissions = PengumpulanTugas::with(['tugas'])
            ->where('user_id', $user->id)
            ->orderBy('waktu_submit', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $submissions
        ]);
    }

    public function cancelSubmission(Request $request, $id)
    {
        $user = $request->user();
        $submission = PengumpulanTugas::findOrFail($id);
        
        // Pastikan hanya pemilik yang bisa cancel dan belum dinilai
        if ($submission->user_id !== $user->id || $submission->nilai !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this submission'
            ], 403);
        }
        
        $submission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengumpulan tugas berhasil dibatalkan'
        ]);
    }

    private function sendTaskNotification($tugas)
    {
        // Tentukan siswa yang akan menerima notifikasi
        $siswaQuery = User::where('role', 'siswa');
        
        if ($tugas->mata_pelajaran === 'JURUSAN') {
            $siswaQuery->where('jurusan', $tugas->jurusan);
        }
        
        $siswa = $siswaQuery->get();

        foreach ($siswa as $s) {
            $notifikasi = Notifikasi::create([
                'user_id' => $s->id,
                'judul' => 'Tugas Baru: ' . $tugas->judul,
                'pesan' => 'Tugas baru telah ditambahkan untuk mata pelajaran ' . $tugas->mata_pelajaran,
                'tipe' => 'tugas_baru'
            ]);

            // Broadcast notifikasi real-time
            broadcast(new NotificationSent($notifikasi))->toOthers();
        }
    }

    private function sendSubmissionNotification($tugas, $user, $isLate)
    {
        $guru = User::find($tugas->created_by);
        
        if ($guru) {
            if ($isLate) {
                // Notifikasi untuk pengumpulan terlambat
                $notifikasi = Notifikasi::create([
                    'user_id' => $guru->id,
                    'judul' => 'Pengumpulan Terlambat: ' . $tugas->judul,
                    'pesan' => $user->name . ' mengumpulkan tugas "' . $tugas->judul . '" terlambat',
                    'tipe' => 'tugas_terlambat'
                ]);
            } else {
                // Notifikasi untuk pengumpulan tepat waktu
                $notifikasi = Notifikasi::create([
                    'user_id' => $guru->id,
                    'judul' => 'Pengumpulan Tugas: ' . $tugas->judul,
                    'pesan' => $user->name . ' telah mengumpulkan tugas "' . $tugas->judul . '"',
                    'tipe' => 'tugas_baru'
                ]);
            }

            // Broadcast notifikasi real-time
            broadcast(new NotificationSent($notifikasi))->toOthers();
        }
    }

    private function sendLateSubmissionNotification($tugas, $user)
    {
        $guru = User::find($tugas->created_by);
        
        if ($guru) {
            $notifikasi = Notifikasi::create([
                'user_id' => $guru->id,
                'judul' => 'Pengumpulan Terlambat',
                'pesan' => $user->name . ' mengumpulkan tugas "' . $tugas->judul . '" terlambat',
                'tipe' => 'tugas_terlambat'
            ]);

            // Broadcast notifikasi real-time
            broadcast(new NotificationSent($notifikasi))->toOthers();
        }
    }

    private function sendGradedNotification($submission)
    {
        $notifikasi = Notifikasi::create([
            'user_id' => $submission->user_id,
            'judul' => 'Tugas Dinilai',
            'pesan' => 'Tugas "' . $submission->tugas->judul . '" sudah dinilai dengan nilai ' . $submission->nilai,
            'tipe' => 'tugas_dinilai'
        ]);

        // Broadcast notifikasi real-time
        broadcast(new NotificationSent($notifikasi))->toOthers();
    }
}

