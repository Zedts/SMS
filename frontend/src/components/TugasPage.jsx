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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Upload, Search, Calendar, User, FileText, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingCard } from './ui/loading';

const TugasPage = () => {
  const { user, token } = useAuth();
  const [tugas, setTugas] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tugasSubmissions, setTugasSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [filterMapel, setFilterMapel] = useState('all');
  const [activeFilterMapel, setActiveFilterMapel] = useState('all');
  const [activeTab, setActiveTab] = useState('tugas');

  // Create form states
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    mata_pelajaran: '',
    jurusan: '',
    deadline: '',
    file_tugas: null
  });

  // Submit form states
  const [submitData, setSubmitData] = useState({
    jawaban_text: '',
    file_jawaban: null
  });

  // Grade form states
  const [gradeForm, setGradeForm] = useState({
    nilai: '',
    feedback: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchTugas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilterMapel && activeFilterMapel !== 'all') params.mata_pelajaran = activeFilterMapel;
      if (activeSearchTerm) params.search = activeSearchTerm;

      const response = await api.getTugas(token, params);
      if (response.success) {
        setTugas(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tugas:', error);
    } finally {
      setLoading(false);
    }
  }, [token, activeFilterMapel, activeSearchTerm]);

  const fetchMySubmissions = useCallback(async () => {
    if (user.role !== 'siswa') return;
    
    setSubmissionsLoading(true);
    try {
      const response = await api.getMySubmissions(token);
      if (response.success) {
        setSubmissions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]); // Pastikan submissions tetap array jika error
    } finally {
      setSubmissionsLoading(false);
    }
  }, [token, user.role]);

  const fetchTugasSubmissions = async (tugasId) => {
    if (user.role !== 'guru') return;
    
    setSubmissionsLoading(true);
    try {
      const response = await api.getTugasSubmissions(token, tugasId);
      if (response.success) {
        setTugasSubmissions(response.data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching tugas submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // useEffect should come after all function definitions
  useEffect(() => {
    fetchTugas();
    if (user.role === 'siswa') {
      fetchMySubmissions();
    }
  }, [fetchTugas, fetchMySubmissions, user.role]);

  const handleCreateTugas = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('=== HANDLE CREATE TUGAS ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Token length:', token ? token.length : 0);
      console.log('Form Data:', formData);
      console.log('User:', user);
      
      const response = await api.createTugas(token, formData);
      if (response.success) {
        setShowCreateForm(false);
        setFormData({
          judul: '',
          deskripsi: '',
          mata_pelajaran: '',
          jurusan: '',
          deadline: '',
          file_tugas: null
        });
        fetchTugas();
        alert('Tugas berhasil dibuat!');
      } else {
        alert(response.message || 'Gagal membuat tugas');
      }
    } catch (error) {
      console.error('Error creating tugas:', error);
      alert('Terjadi kesalahan saat membuat tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTugas = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.submitTugas(token, selectedTugas.id, submitData);
      if (response.success) {
        setShowSubmitForm(false);
        setSubmitData({
          jawaban_text: '',
          file_jawaban: null
        });
        setSelectedTugas(null);
        fetchTugas();
        if (user.role === 'siswa') {
          fetchMySubmissions();
        }
        alert('Tugas berhasil dikumpulkan!');
      } else {
        alert(response.message || 'Gagal mengumpulkan tugas');
      }
    } catch (error) {
      console.error('Error submitting tugas:', error);
      alert('Terjadi kesalahan saat mengumpulkan tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmission = async (submissionId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengumpulan tugas ini?')) {
      return;
    }

    try {
      const response = await api.cancelSubmission(token, submissionId);
      if (response.success) {
        fetchMySubmissions();
        fetchTugas();
        alert('Pengumpulan tugas berhasil dibatalkan!');
      } else {
        alert(response.message || 'Gagal membatalkan pengumpulan tugas');
      }
    } catch (error) {
      console.error('Error canceling submission:', error);
      alert('Terjadi kesalahan saat membatalkan pengumpulan tugas');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const gradeData = {
        nilai: parseInt(gradeForm.nilai),
        feedback: gradeForm.feedback
      };

      const response = await api.gradeSubmission(token, selectedSubmission.id, gradeData);
      if (response.success) {
        setShowGradeDialog(false);
        setGradeForm({ nilai: '', feedback: '' });
        setSelectedSubmission(null);
        fetchTugasSubmissions(selectedTugas?.id);
        alert('Nilai berhasil diberikan!');
      } else {
        alert(response.message || 'Gagal memberikan nilai');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Terjadi kesalahan saat memberikan nilai');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveFilterMapel(filterMapel);
  };

  const handleReset = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setFilterMapel('all');
    setActiveFilterMapel('all');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isDeadlinePassed = (deadline) => {
    return new Date() > new Date(deadline);
  };

  const filteredTugas = Array.isArray(tugas) ? tugas.filter(item => {
    if (!item) return false;
    
    const matchesSearch = activeSearchTerm === '' || 
      (item.judul && item.judul.toLowerCase().includes(activeSearchTerm.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(activeSearchTerm.toLowerCase()));
    
    const matchesMapel = activeFilterMapel === 'all' || item.mata_pelajaran === activeFilterMapel;
    
    // Untuk siswa, sembunyikan tugas yang sudah dikumpulkan
    if (user.role === 'siswa' && Array.isArray(submissions)) {
      const alreadySubmitted = submissions.some(submission => 
        submission && submission.tugas && submission.tugas.id === item.id
      );
      return matchesSearch && matchesMapel && !alreadySubmitted;
    }
    
    return matchesSearch && matchesMapel;
  }) : [];

  if (loading) {
    return <LoadingCard message="Memuat data tugas..." />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-pink-500/5 rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-orange-500/5 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {user.role === 'siswa' ? 'Tugas Saya' : 'Kelola Tugas'}
            </h1>
            <p className="text-pink-200">
              {user.role === 'siswa' ? 'Lihat dan kerjakan tugas Anda' : 'Kelola dan distribusi tugas'}
            </p>
          </div>
          {user.role === 'guru' && (
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="sm:hidden">Buat Tugas</span>
                  <span className="hidden sm:inline">Buat Tugas Baru</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl backdrop-blur-sm bg-white/10 border border-white/20 mx-4">
                <DialogHeader>
                  <DialogTitle className="text-white font-bold">Buat Tugas Baru</DialogTitle>
                  <DialogDescription className="text-pink-200">
                    Isi form untuk membuat tugas baru
                  </DialogDescription>
                </DialogHeader>
              <form onSubmit={handleCreateTugas} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="judul" className="text-white font-medium">Judul Tugas</Label>
                  <Input
                    id="judul"
                    value={formData.judul}
                    onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Masukkan judul tugas..."
                    className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsi" className="text-white font-medium">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                    placeholder="Masukkan deskripsi tugas..."
                    className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mata_pelajaran" className="text-white font-medium">Mata Pelajaran</Label>
                    <Select value={formData.mata_pelajaran} onValueChange={(value) => setFormData(prev => ({ ...prev, mata_pelajaran: value }))}>
                      <SelectTrigger className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20">
                        <SelectValue placeholder="Pilih mata pelajaran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTK">Matematika</SelectItem>
                        <SelectItem value="ENGLISH">Bahasa Inggris</SelectItem>
                        <SelectItem value="JURUSAN">Mata Pelajaran Jurusan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.mata_pelajaran === 'JURUSAN' && (
                    <div className="space-y-2">
                      <Label htmlFor="jurusan" className="text-white font-medium">Jurusan</Label>
                      <Select value={formData.jurusan} onValueChange={(value) => setFormData(prev => ({ ...prev, jurusan: value }))}>
                        <SelectTrigger className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20">
                          <SelectValue placeholder="Pilih jurusan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RPL">RPL</SelectItem>
                          <SelectItem value="TKJ">TKJ</SelectItem>
                          <SelectItem value="MM">MM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-white font-medium">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file_tugas" className="text-white font-medium">File Tugas (Opsional)</Label>
                  <Input
                    id="file_tugas"
                    type="file"
                    onChange={(e) => setFormData(prev => ({ ...prev, file_tugas: e.target.files[0] }))}
                    className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {submitting ? 'Memproses...' : 'Buat Tugas'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="backdrop-blur-sm bg-white/10 border border-white/20 grid w-full grid-cols-2 rounded-lg">
            <TabsTrigger 
              value="tugas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white text-pink-200 font-medium"
            >
              {user.role === 'siswa' ? 'Tugas Tersedia' : 'Kelola Tugas'}
            </TabsTrigger>
            <TabsTrigger 
              value="submissions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white text-pink-200 font-medium"
            >
              {user.role === 'siswa' ? 'Tugas Dikumpulkan' : 'Pengumpulan Tugas'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tugas" className="space-y-6">
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
                        placeholder="Cari judul atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:border-pink-400 focus:ring-pink-400/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mata_pelajaran" className="text-white font-medium">Mata Pelajaran</Label>
                    <Select value={filterMapel} onValueChange={setFilterMapel}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Semua mata pelajaran" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/95 border border-white/20">
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="MTK">Matematika</SelectItem>
                        <SelectItem value="ENGLISH">Bahasa Inggris</SelectItem>
                        <SelectItem value="JURUSAN">Mata Pelajaran Jurusan</SelectItem>
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

          {/* Tugas List */}
          {loading ? (
            <LoadingCard message="Memuat data tugas..." />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {Array.isArray(filteredTugas) && filteredTugas.map((item) => (
                <div key={item.id} className={`backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 ${isDeadlinePassed(item.deadline) ? 'border-red-400/50' : ''}`}>
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.judul}</h3>
                        <p className="text-pink-200">
                          {item.mata_pelajaran} {item.jurusan && `- ${item.jurusan}`}
                        </p>
                      </div>
                      {isDeadlinePassed(item.deadline) && (
                        <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">Terlambat</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-pink-200">{item.deskripsi}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-pink-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline: {new Date(item.deadline).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Guru: {item.creator?.name}</span>
                      </div>
                    </div>

                    {item.file_tugas && (
                      <div className="flex items-center space-x-1 text-sm text-pink-400">
                        <FileText className="w-4 h-4" />
                        <span>File tugas tersedia</span>
                      </div>
                    )}

                    {user.role === 'siswa' && (
                      <div className="pt-3">
                        <Button
                          onClick={() => {
                            setSelectedTugas(item);
                            setShowSubmitForm(true);
                          }}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                          disabled={isDeadlinePassed(item.deadline)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isDeadlinePassed(item.deadline) ? 'Deadline Terlewat' : 'Kumpulkan Tugas'}
                        </Button>
                      </div>
                    )}

                    {user.role === 'guru' && (
                      <div className="pt-3">
                        <Button
                          onClick={() => {
                            setSelectedTugas(item);
                            fetchTugasSubmissions(item.id);
                            setActiveTab('submissions');
                          }}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Pengumpulan
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTugas.length === 0 && !loading && (
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-12 text-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <p className="text-white font-medium">Tidak ada tugas yang tersedia</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {user.role === 'siswa' ? (
            // Siswa: Tampilkan tugas yang sudah dikumpulkan
            <div>
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl mb-6">
                <h2 className="text-xl font-bold text-white">Tugas yang Sudah Dikumpulkan</h2>
                <p className="text-pink-200">Daftar tugas yang sudah Anda kumpulkan</p>
              </div>

              {submissionsLoading ? (
                <LoadingCard message="Memuat data pengumpulan..." />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Array.isArray(submissions) && submissions.map((submission) => (
                    <div key={submission.id} className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300">
                      <div className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{submission.tugas.judul}</h3>
                            <p className="text-pink-200">
                              {submission.tugas.mata_pelajaran} {submission.tugas.jurusan && `- ${submission.tugas.jurusan}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {submission.terlambat && (
                              <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">Terlambat</span>
                            )}
                            {submission.nilai !== null ? (
                              <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30 flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Dinilai</span>
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30 flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Belum Dinilai</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-sm text-pink-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Dikumpulkan: {new Date(submission.waktu_submit).toLocaleString()}</span>
                          </div>
                        </div>

                        {submission.jawaban_text && (
                          <div>
                            <p className="text-sm font-medium text-white">Jawaban:</p>
                            <p className="text-sm text-pink-200 mt-1">{submission.jawaban_text}</p>
                          </div>
                        )}

                        {submission.file_jawaban && (
                          <div className="flex items-center space-x-1 text-sm text-blue-300">
                            <FileText className="w-4 h-4" />
                            <span>File jawaban tersedia</span>
                          </div>
                        )}

                        {submission.nilai !== null && (
                          <div className="backdrop-blur-sm bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                            <div className="font-medium text-green-300">
                              Nilai: {submission.nilai}/100
                            </div>
                            {submission.feedback && (
                              <div className="text-sm text-green-200 mt-1">
                                Feedback: {submission.feedback}
                              </div>
                            )}
                          </div>
                        )}

                        {submission.nilai === null && (
                          <div className="pt-3 flex space-x-2">
                            <button
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-3 py-2 rounded-lg text-sm shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowPreviewDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              <span>Preview</span>
                            </button>
                            <button
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-3 py-2 rounded-lg text-sm shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                              onClick={() => handleCancelSubmission(submission.id)}
                            >
                              <X className="w-4 h-4" />
                              <span>Batal Submit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(submissions) && submissions.length === 0 && !submissionsLoading && (
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-12 text-center shadow-2xl">
                  <Upload className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                  <p className="text-white font-medium">Belum ada tugas yang dikumpulkan</p>
                </div>
              )}
            </div>
          ) : (
            // Guru: Tampilkan pengumpulan tugas dari siswa
            <div>
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl mb-6">
                <h2 className="text-xl font-bold text-white">Pengumpulan Tugas</h2>
                <p className="text-pink-200">
                  {selectedTugas ? `Pengumpulan untuk: ${selectedTugas.judul}` : 'Pilih tugas dari tab "Kelola Tugas" untuk melihat pengumpulan'}
                </p>
              </div>

              {selectedTugas && (
                <>
                  {submissionsLoading ? (
                    <LoadingCard message="Memuat data pengumpulan..." />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {tugasSubmissions.map((submission) => (
                        <div key={submission.id} className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300">
                          <div className="mb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{submission.user.name}</h3>
                                <p className="text-pink-200">
                                  {submission.user.email} - {submission.user.jurusan}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {submission.terlambat && (
                                  <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">Terlambat</span>
                                )}
                                {submission.nilai !== null ? (
                                  <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">
                                    Dinilai: {submission.nilai}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30">Belum Dinilai</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-sm text-pink-300">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Dikumpulkan: {new Date(submission.waktu_submit).toLocaleString()}</span>
                              </div>
                            </div>

                            {submission.jawaban_text && (
                              <div>
                                <p className="text-sm font-medium text-white">Jawaban:</p>
                                <p className="text-sm text-pink-200 mt-1">{submission.jawaban_text}</p>
                              </div>
                            )}

                            {submission.file_jawaban && (
                              <div className="flex items-center space-x-1 text-sm text-blue-300">
                                <FileText className="w-4 h-4" />
                                <span>File jawaban tersedia</span>
                              </div>
                            )}

                            
                            {submission.nilai !== null && submission.feedback && (
                              <div className="backdrop-blur-sm bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                                <div className="text-sm text-green-200">
                                  Feedback: {submission.feedback}
                                </div>
                              </div>
                            )}

                            <div className="pt-3">
                              <button
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setGradeForm({
                                    nilai: submission.nilai || '',
                                    feedback: submission.feedback || ''
                                  });
                                  setShowGradeDialog(true);
                                }}
                              >
                                {submission.nilai !== null ? 'Edit Nilai' : 'Beri Nilai'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tugasSubmissions.length === 0 && !submissionsLoading && (
                    <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-12 text-center shadow-2xl">
                      <Upload className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                      <p className="text-white font-medium">Belum ada pengumpulan untuk tugas ini</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Tugas Dialog */}
      <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
        <DialogContent className="max-w-lg backdrop-blur-sm bg-white/10 border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Kumpulkan Tugas</DialogTitle>
            <DialogDescription className="text-pink-200">
              {selectedTugas?.judul}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTugas} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jawaban_text" className="text-white font-medium">Jawaban (Opsional)</Label>
              <Textarea
                id="jawaban_text"
                value={submitData.jawaban_text}
                onChange={(e) => setSubmitData(prev => ({ ...prev, jawaban_text: e.target.value }))}
                placeholder="Masukkan jawaban tugas..."
                className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file_jawaban" className="text-white font-medium">File Jawaban (Opsional)</Label>
              <Input
                id="file_jawaban"
                type="file"
                onChange={(e) => setSubmitData(prev => ({ ...prev, file_jawaban: e.target.files[0] }))}
                className="bg-white/50 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              {submitting ? 'Memproses...' : 'Kumpulkan Tugas'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-lg backdrop-blur-sm bg-white/10 border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Beri Nilai</DialogTitle>
            <DialogDescription className="text-pink-200">
              Memberikan nilai untuk: {selectedSubmission?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGradeSubmission} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nilai" className="text-white font-medium">Nilai (0-100)</Label>
              <Input
                id="nilai"
                type="number"
                min="0"
                max="100"
                value={gradeForm.nilai}
                onChange={(e) => setGradeForm(prev => ({ ...prev, nilai: e.target.value }))}
                placeholder="Masukkan nilai..."
                className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-white font-medium">Feedback (Opsional)</Label>
              <Textarea
                id="feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Masukkan feedback untuk siswa..."
                className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              {submitting ? 'Memproses...' : 'Simpan Nilai'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Submission Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Pengumpulan Tugas</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.tugas?.judul}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Informasi Tugas:</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Judul:</strong> {selectedSubmission.tugas?.judul}</p>
                  <p><strong>Mata Pelajaran:</strong> {selectedSubmission.tugas?.mata_pelajaran}</p>
                  <p><strong>Deskripsi:</strong> {selectedSubmission.tugas?.deskripsi}</p>
                  <p><strong>Deadline:</strong> {new Date(selectedSubmission.tugas?.deadline).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Jawaban Anda:</h4>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p><strong>Waktu Submit:</strong> {new Date(selectedSubmission.waktu_submit).toLocaleString()}</p>
                  {selectedSubmission.terlambat && (
                    <Badge variant="destructive">Terlambat</Badge>
                  )}
                  {selectedSubmission.jawaban_text && (
                    <div>
                      <strong>Jawaban:</strong>
                      <p className="mt-1 whitespace-pre-wrap">{selectedSubmission.jawaban_text}</p>
                    </div>
                  )}
                  {selectedSubmission.file_jawaban && (
                    <p><strong>File:</strong> {selectedSubmission.file_jawaban}</p>
                  )}
                </div>
              </div>

              {selectedSubmission.nilai !== null && (
                <div>
                  <h4 className="font-medium mb-2">Penilaian:</h4>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p><strong>Nilai:</strong> {selectedSubmission.nilai}/100</p>
                    {selectedSubmission.feedback && (
                      <div>
                        <strong>Feedback:</strong>
                        <p className="mt-1">{selectedSubmission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default TugasPage;

