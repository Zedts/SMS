<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notifikasi;

class NotifikasiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifikasi = Notifikasi::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifikasi
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notifikasi = Notifikasi::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notifikasi->update(['dibaca' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil ditandai sebagai dibaca'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        Notifikasi::where('user_id', $request->user()->id)
            ->where('dibaca', false)
            ->update(['dibaca' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi berhasil ditandai sebagai dibaca'
        ]);
    }

    public function getUnreadCount(Request $request)
    {
        $count = Notifikasi::where('user_id', $request->user()->id)
            ->where('dibaca', false)
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }
}

