import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingCard } from '@/components/ui/loading';
import { Users, Plus, Search, Edit, Trash2, UserCheck, GraduationCap, Settings } from 'lucide-react';

const UsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeFilterRole, setActiveFilterRole] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    jurusan: '',
    mata_pelajaran: '',
    nisn: '',
    nip: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilterRole && activeFilterRole !== 'all') params.role = activeFilterRole;
      if (activeSearchTerm) params.search = activeSearchTerm;
      
      // Request all users (no pagination limit)
      params.per_page = 'all';

      console.log('=== FETCH USERS ===');
      console.log('Params:', params);
      console.log('Active Filter Role:', activeFilterRole);
      console.log('Active Search Term:', activeSearchTerm);

      const response = await api.getUsers(token, params);
      console.log('Fetch users response:', response);
      
      if (response.success) {
        // Handle both paginated and non-paginated responses
        const userData = response.data.data || response.data || [];
        console.log('Setting users data:', userData);
        console.log('Users count:', userData.length);
        setUsers(userData);
      } else {
        console.error('Fetch users failed:', response.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token, activeFilterRole, activeSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('=== HANDLE CREATE USER ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Raw Form Data:', formData);
      
      // Clean data - hapus field kosong
      const cleanData = { ...formData };
      
      // Hapus password jika kosong
      if (!cleanData.password || cleanData.password.trim() === '') {
        delete cleanData.password;
      }
      
      // Hapus field kosong lainnya
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      console.log('Cleaned Data:', cleanData);
      
      const response = await api.createUser(token, cleanData);
      console.log('Create user response:', response);
      
      if (response.success) {
        console.log('User created successfully, refreshing list...');
        setShowCreateForm(false);
        resetForm();
        
        // Reset filter untuk memastikan user baru tampil
        setFilterRole('all');
        setSearchTerm('');
        
        // Refresh data users
        await fetchUsers();
        alert('User berhasil dibuat!');
      } else {
        alert(response.message || 'Gagal membuat user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Terjadi kesalahan saat membuat user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('=== HANDLE UPDATE USER ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Selected User ID:', selectedUser?.id);
      console.log('Raw Form Data:', formData);
      
      // Clean data - hapus field kosong dan password jika kosong
      const cleanData = { ...formData };
      
      // Hapus password jika kosong
      if (!cleanData.password || cleanData.password.trim() === '') {
        delete cleanData.password;
      }
      
      // Hapus field kosong lainnya
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      console.log('Cleaned Data:', cleanData);
      
      const response = await api.updateUser(token, selectedUser.id, cleanData);
      if (response.success) {
        setShowEditForm(false);
        resetForm();
        setSelectedUser(null);
        fetchUsers();
        alert('User berhasil diupdate!');
      } else {
        alert(response.message || 'Gagal mengupdate user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Terjadi kesalahan saat mengupdate user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    try {
      const response = await api.deleteUser(token, id);
      if (response.success) {
        fetchUsers();
        alert('User berhasil dihapus!');
      } else {
        alert(response.message || 'Gagal menghapus user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Terjadi kesalahan saat menghapus user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      jurusan: user.jurusan || '',
      mata_pelajaran: user.mata_pelajaran || '',
      nisn: user.nisn || '',
      nip: user.nip || ''
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      jurusan: '',
      mata_pelajaran: '',
      nisn: '',
      nip: ''
    });
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveFilterRole(filterRole);
  };

  const handleReset = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setFilterRole('all');
    setActiveFilterRole('all');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Settings className="w-4 h-4" />;
      case 'guru':
        return <UserCheck className="w-4 h-4" />;
      case 'siswa':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'guru':
        return <Badge className="bg-green-100 text-green-800">Guru</Badge>;
      case 'siswa':
        return <Badge className="bg-pink-100 text-pink-800">Siswa</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nisn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nip?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-pink-500/5 rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-orange-500/5 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Kelola Pengguna
            </h1>
            <p className="text-pink-200 text-sm sm:text-base">
              Manajemen pengguna dan akses sistem
            </p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Tambah User</span>
                <span className="hidden sm:inline">Tambah User Baru</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl backdrop-blur-sm bg-white/10 border border-white/20 mx-4">
              <DialogHeader>
                <DialogTitle className="text-white font-bold">Tambah User Baru</DialogTitle>
                <DialogDescription className="text-pink-200">
                  Isi form untuk menambah user baru
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama lengkap..."
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Masukkan email..."
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Masukkan password..."
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white font-medium">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                        <SelectItem value="admin" className="text-white hover:bg-white/20">Admin</SelectItem>
                        <SelectItem value="guru" className="text-white hover:bg-white/20">Guru</SelectItem>
                        <SelectItem value="siswa" className="text-white hover:bg-white/20">Siswa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              
              {formData.role === 'siswa' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jurusan" className="text-white font-medium">Jurusan</Label>
                    <Select value={formData.jurusan} onValueChange={(value) => setFormData(prev => ({ ...prev, jurusan: value }))}>
                      <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15">
                        <SelectValue placeholder="Pilih jurusan" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                        <SelectItem value="RPL" className="text-white hover:bg-white/20">RPL</SelectItem>
                        <SelectItem value="TKJ" className="text-white hover:bg-white/20">TKJ</SelectItem>
                        <SelectItem value="MM" className="text-white hover:bg-white/20">MM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nisn" className="text-white font-medium">NISN</Label>
                    <Input
                      id="nisn"
                      value={formData.nisn}
                      onChange={(e) => setFormData(prev => ({ ...prev, nisn: e.target.value }))}
                      placeholder="Masukkan NISN..."
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                    />
                  </div>
                </div>
              )}

              {formData.role === 'guru' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mata_pelajaran" className="text-white font-medium">Mata Pelajaran</Label>
                    <Select value={formData.mata_pelajaran} onValueChange={(value) => setFormData(prev => ({ ...prev, mata_pelajaran: value }))}>
                      <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15">
                        <SelectValue placeholder="Pilih mata pelajaran" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                        <SelectItem value="MTK" className="text-white hover:bg-white/20">Matematika</SelectItem>
                        <SelectItem value="ENGLISH" className="text-white hover:bg-white/20">Bahasa Inggris</SelectItem>
                        <SelectItem value="JURUSAN" className="text-white hover:bg-white/20">Mata Pelajaran Jurusan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nip" className="text-white font-medium">NIP</Label>
                    <Input
                      id="nip"
                      value={formData.nip}
                      onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                      placeholder="Masukkan NIP..."
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {submitting ? 'Memproses...' : 'Tambah User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>

        {/* Filters */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-white font-medium">Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Cari nama, email, NISN, atau NIP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white font-medium">Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Semua role" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/95 border border-white/20">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guru">Guru</SelectItem>
                    <SelectItem value="siswa">Siswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="flex space-x-2 w-full">
                  <Button 
                    onClick={handleSearch} 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex-1"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Cari & Filter
                  </Button>
                  <Button 
                    onClick={handleReset} 
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Daftar Pengguna</CardTitle>
            <CardDescription className="text-pink-200">
              Total: {filteredUsers.length} pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-pink-200 min-w-[150px]">Nama</TableHead>
                    <TableHead className="text-pink-200 min-w-[200px]">Email</TableHead>
                    <TableHead className="text-pink-200 min-w-[100px]">Role</TableHead>
                    <TableHead className="text-pink-200 min-w-[150px]">Info Tambahan</TableHead>
                    <TableHead className="text-pink-200 min-w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-pink-200">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-pink-200">
                    {user.role === 'siswa' && (
                      <div className="text-sm">
                        <div>Jurusan: {user.jurusan}</div>
                        {user.nisn && <div>NISN: {user.nisn}</div>}
                      </div>
                    )}
                    {user.role === 'guru' && (
                      <div className="text-sm">
                        <div>Mapel: {user.mata_pelajaran}</div>
                        {user.nip && <div>NIP: {user.nip}</div>}
                      </div>
                    )}
                  </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                <p className="text-pink-200">Tidak ada pengguna yang ditemukan</p>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl backdrop-blur-sm bg-white/10 border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Edit User</DialogTitle>
            <DialogDescription className="text-pink-200">
              Edit informasi user
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name" className="text-white font-medium">Nama Lengkap</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Masukkan nama lengkap..."
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email" className="text-white font-medium">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Masukkan email..."
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_password" className="text-white font-medium">Password (Kosongkan jika tidak ingin mengubah)</Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Masukkan password baru..."
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_role" className="text-white font-medium">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                    <SelectItem value="admin" className="text-white hover:bg-white/20">Admin</SelectItem>
                    <SelectItem value="guru" className="text-white hover:bg-white/20">Guru</SelectItem>
                    <SelectItem value="siswa" className="text-white hover:bg-white/20">Siswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.role === 'siswa' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_jurusan" className="text-white font-medium">Jurusan</Label>
                  <Select value={formData.jurusan} onValueChange={(value) => setFormData(prev => ({ ...prev, jurusan: value }))}>
                    <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15">
                      <SelectValue placeholder="Pilih jurusan" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                      <SelectItem value="RPL" className="text-white hover:bg-white/20">RPL</SelectItem>
                      <SelectItem value="TKJ" className="text-white hover:bg-white/20">TKJ</SelectItem>
                      <SelectItem value="MM" className="text-white hover:bg-white/20">MM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_nisn" className="text-white font-medium">NISN</Label>
                  <Input
                    id="edit_nisn"
                    value={formData.nisn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nisn: e.target.value }))}
                    placeholder="Masukkan NISN..."
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                  />
                </div>
              </div>
            )}

            {formData.role === 'guru' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_mata_pelajaran" className="text-white font-medium">Mata Pelajaran</Label>
                  <Select value={formData.mata_pelajaran} onValueChange={(value) => setFormData(prev => ({ ...prev, mata_pelajaran: value }))}>
                    <SelectTrigger className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15">
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                      <SelectItem value="MTK" className="text-white hover:bg-white/20">Matematika</SelectItem>
                      <SelectItem value="ENGLISH" className="text-white hover:bg-white/20">Bahasa Inggris</SelectItem>
                      <SelectItem value="JURUSAN" className="text-white hover:bg-white/20">Mata Pelajaran Jurusan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_nip" className="text-white font-medium">NIP</Label>
                  <Input
                    id="edit_nip"
                    value={formData.nip}
                    onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                    placeholder="Masukkan NIP..."
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
              {submitting ? 'Memproses...' : 'Update User'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default UsersPage;

