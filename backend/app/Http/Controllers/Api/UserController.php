<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filter berdasarkan role jika ada
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        // Pagination with configurable per_page
        $perPage = $request->get('per_page', 10);
        
        // Allow unlimited results if per_page is 'all'
        if ($perPage === 'all') {
            $users = $query->orderBy('name')->get();
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        }

        $users = $query->orderBy('name')->paginate((int)$perPage);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,guru,siswa',
            'jurusan' => 'required_if:role,siswa|nullable|string',
            'mata_pelajaran' => 'required_if:role,guru|nullable|string',
            'nisn' => 'nullable|string|unique:users',
            'nip' => 'nullable|string|unique:users'
        ]);

        $data = $request->all();
        
        // Clean empty fields
        $data = array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
        
        $data['password'] = Hash::make($request->password);

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat',
            'data' => $user
        ]);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,guru,siswa',
            'jurusan' => 'required_if:role,siswa|nullable|string',
            'mata_pelajaran' => 'required_if:role,guru|nullable|string',
            'nisn' => 'nullable|string|unique:users,nisn,' . $id,
            'nip' => 'nullable|string|unique:users,nip,' . $id
        ]);

        $data = $request->except('password');
        
        // Clean empty fields
        $data = array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diupdate',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus'
        ]);
    }
}

