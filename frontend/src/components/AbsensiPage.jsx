import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, Camera, Search, Filter } from 'lucide-react';
import { LoadingCard } from './ui/loading';

const AbsensiPage = () => {
  const { user, token } = useAuth();
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAbsenForm, setShowAbsenForm] = useState(false);
  const [filters, setFilters] = useState({
    tanggal: '',
    status: 'all'
  });
  const [activeFilters, setActiveFilters] = useState({
    tanggal: '',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  // Form states
  const [keterangan, setKeterangan] = useState('');
  const [buktiPhoto, setBuktiPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAbsensi = useCallback(async () => {
    setLoading(true);
    try {
      console.log('=== FETCH ABSENSI ===');
      console.log('User role:', user.role);
      console.log('Active Filters:', activeFilters);
      console.log('Active search term:', activeSearchTerm);
      
      const response = await api.getAbsensi(token, activeFilters);
      console.log('Absensi API response:', response);
      
      if (response.success) {
        const absensiData = response.data.data || response.data || [];
        console.log('Setting absensi data:', absensiData);
        console.log('Absensi count:', absensiData.length);
        setAbsensi(absensiData);
      } else {
        console.error('Fetch absensi failed:', response.message);
        setAbsensi([]);
      }
    } catch (error) {
      console.error('Error fetching absensi:', error);
      setAbsensi([]);
    } finally {
      setLoading(false);
    }
  }, [user.role, activeFilters, activeSearchTerm, token]);

  useEffect(() => {
    fetchAbsensi();
  }, [fetchAbsensi]);

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveFilters(filters);
  };

  const handleReset = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setFilters({
      tanggal: '',
      status: 'all'
    });
    setActiveFilters({
      tanggal: '',
      status: 'all'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSubmitAbsen = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = {
        keterangan,
        bukti_foto: buktiPhoto
      };

      const response = await api.createAbsensi(token, formData);
      if (response.success) {
        setShowAbsenForm(false);
        setKeterangan('');
        setBuktiPhoto(null);
        fetchAbsensi();
        alert('Absensi berhasil disubmit!');
      } else {
        alert(response.message || 'Gagal submit absensi');
      }
    } catch (error) {
      console.error('Error submitting absensi:', error);
      alert('Terjadi kesalahan saat submit absensi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAbsen = async (id) => {
    try {
      const response = await api.approveAbsensi(token, id);
      if (response.success) {
        fetchAbsensi();
        alert('Absensi berhasil disetujui!');
      }
    } catch (error) {
      console.error('Error approving absensi:', error);
      alert('Gagal menyetujui absensi');
    }
  };

  const handleRejectAbsen = async (id) => {
    const keterangan = prompt('Masukkan alasan penolakan:');
    if (!keterangan) return;

    try {
      const response = await api.rejectAbsensi(token, id, keterangan);
      if (response.success) {
        fetchAbsensi();
        alert('Absensi berhasil ditolak!');
      }
    } catch (error) {
      console.error('Error rejecting absensi:', error);
      alert('Gagal menolak absensi');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hadir':
        return <Badge className="bg-green-100 text-green-800">Hadir</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'tidak_hadir':
        return <Badge className="bg-red-100 text-red-800">Tidak Hadir</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAbsensi = absensi.filter(item => {
    const matchesSearch = activeSearchTerm === '' || 
      item.user?.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      item.keterangan?.toLowerCase().includes(activeSearchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingCard message="Memuat data absensi..." />;
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
              {user.role === 'siswa' ? 'Absensi Saya' : 'Kelola Absensi'}
            </h1>
            <p className="text-pink-200 text-sm sm:text-base">
              {user.role === 'siswa' ? 'Lihat dan kelola absensi Anda' : 'Kelola dan approve absensi siswa'}
            </p>
          </div>
          {user.role === 'siswa' && (
            <Dialog open={showAbsenForm} onOpenChange={setShowAbsenForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                  <Clock className="w-4 h-4 mr-2" />
                  Absen Sekarang
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white font-bold">Form Absensi</DialogTitle>
                  <DialogDescription className="text-pink-200">
                    Isi form absensi untuk hari ini
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitAbsen} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="keterangan" className="text-white font-medium">Keterangan (Opsional)</Label>
                    <Textarea
                      id="keterangan"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Masukkan keterangan absensi..."
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bukti_foto" className="text-white font-medium">Bukti Foto (Opsional)</Label>
                    <Input
                      id="bukti_foto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBuktiPhoto(e.target.files[0])}
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-pink-400 focus:ring-pink-400/50 focus:bg-white/15 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-500/20 file:text-pink-300 hover:file:bg-pink-500/30"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {submitting ? 'Memproses...' : 'Submit Absensi'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
                    placeholder="Cari nama atau keterangan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal" className="text-white font-medium">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={filters.tanggal}
                  onChange={(e) => setFilters(prev => ({ ...prev, tanggal: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white font-medium">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/10 border border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-white/20">Semua Status</SelectItem>
                    <SelectItem value="pending" className="text-white hover:bg-white/20">Pending</SelectItem>
                    <SelectItem value="hadir" className="text-white hover:bg-white/20">Hadir</SelectItem>
                    <SelectItem value="tidak_hadir" className="text-white hover:bg-white/20">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button 
                onClick={handleSearch} 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex-1 sm:flex-none"
              >
                <Search className="w-4 h-4 mr-2" />
                Cari & Filter
              </Button>
              <Button 
                onClick={handleReset} 
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex-1 sm:flex-none"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Absensi List */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Daftar Absensi</CardTitle>
            <CardDescription className="text-pink-200">
              {user.role === 'siswa' ? 'Riwayat absensi Anda' : 'Daftar absensi siswa'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAbsensi.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      {user.role !== 'siswa' && (
                        <div>
                          <h4 className="font-medium text-white">{item.user?.name}</h4>
                          <p className="text-sm text-pink-200">{item.user?.jurusan}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-pink-200">
                          Tanggal: {new Date(item.tanggal).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-pink-200">
                          Waktu: {new Date(item.waktu_absen).toLocaleTimeString()}
                        </p>
                        {item.keterangan && (
                          <p className="text-sm text-gray-300">
                            Keterangan: {item.keterangan}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(item.status)}
                    {user.role === 'guru' && item.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveAbsen(item.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded shadow transform hover:scale-105 transition-all duration-200"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded shadow transform hover:scale-105 transition-all duration-200"
                          onClick={() => handleRejectAbsen(item.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredAbsensi.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                  <p className="text-pink-200">Tidak ada data absensi</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AbsensiPage;

