<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\TugasController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotifikasiController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard routes
    Route::get('/dashboard/siswa', [DashboardController::class, 'siswa']);
    Route::get('/dashboard/guru', [DashboardController::class, 'guru']);
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);
    
    // Absensi routes
    Route::apiResource('absensi', AbsensiController::class);
    Route::patch('/absensi/{id}/approve', [AbsensiController::class, 'approve']);
    Route::patch('/absensi/{id}/reject', [AbsensiController::class, 'reject']);
    
    // Tugas routes
    Route::apiResource('tugas', TugasController::class);
    Route::post('/tugas/{id}/submit', [TugasController::class, 'submit']);
    Route::get('/tugas/{id}/submissions', [TugasController::class, 'getSubmissions']);
    Route::patch('/submissions/{id}/grade', [TugasController::class, 'gradeSubmission']);
    Route::get('/my-submissions', [TugasController::class, 'getMySubmissions']);
    Route::get('/all-submissions', [TugasController::class, 'getAllSubmissions']);
    Route::delete('/submissions/{id}/cancel', [TugasController::class, 'cancelSubmission']);
    
    // Notifikasi routes
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/{id}/read', [NotifikasiController::class, 'markAsRead']);
    Route::patch('/notifikasi/read-all', [NotifikasiController::class, 'markAllAsRead']);
    Route::get('/notifikasi/unread-count', [NotifikasiController::class, 'getUnreadCount']);
    
    // User management (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        // Explicit PATCH route for debugging
        Route::patch('/users/{id}', [UserController::class, 'update']);
    });
    
    // File upload
    Route::post('/upload', function (Request $request) {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);
        
        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('uploads', $filename, 'public');
        
        return response()->json([
            'success' => true,
            'filename' => $filename,
            'path' => $path,
            'url' => asset('storage/' . $path)
        ]);
    });
});

// Broadcast auth for private channels
Broadcast::routes(['middleware' => ['auth:sanctum']]);

