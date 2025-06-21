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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, User, Eye, CheckCircle, Clock, GraduationCap } from 'lucide-react';
import { LoadingCard } from './ui/loading';

const ManageSubmissionsPage = () => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState(() => {
    console.log('ManageSubmissionsPage: Initializing submissions state');
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [grading, setGrading] = useState(false);
  const [gradeData, setGradeData] = useState({
    nilai: '',
    feedback: ''
  });
  // Debug submissions state changes
  useEffect(() => {
    console.log('Submissions updated:', submissions.length);
  }, [submissions]);const fetchSubmissions = useCallback(async () => {
    console.log('=== ManageSubmissionsPage: fetchSubmissions START ===');
    console.log('Token available:', !!token);
    console.log('Token value preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.log('No token available, skipping fetch');
      return;
    }
    
    setLoading(true);
    try {      const response = await api.getAllSubmissions(token);
      
      if (response && response.success) {
        // Handle paginated response structure
        let submissionsData = [];
        
        if (response.data && response.data.data) {
          submissionsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          submissionsData = response.data;
        } else {
          submissionsData = [];
        }
        
        setSubmissions(submissionsData);
      } else {
        console.error('Failed to fetch submissions:', response?.message || 'Unknown error');
        setSubmissions([]);
      }    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [token]);  // Debug component mount  
  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run on mount
  // Watch for token changes
  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token, fetchSubmissions]);

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setGrading(true);

    try {
      const response = await api.gradeSubmission(token, selectedSubmission.id, gradeData);
      if (response.success) {
        setShowGradeDialog(false);
        setGradeData({ nilai: '', feedback: '' });
        setSelectedSubmission(null);
        fetchSubmissions();
        alert('Nilai berhasil diberikan!');
      } else {
        alert(response.message || 'Gagal memberikan nilai');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Terjadi kesalahan saat memberikan nilai');
    } finally {
      setGrading(false);
    }
  };
  const getStatusBadge = (submission) => {
    if (submission.terlambat) {
      return <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">Terlambat</span>;
    }
    return <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">Tepat Waktu</span>;
  };if (loading) {
    return <LoadingCard message="Memuat pengumpulan tugas..." />;
  }  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Kelola Pengumpulan Tugas
          </h1>
          <p className="text-pink-200 text-sm sm:text-base">
            Pantau dan nilai pengumpulan tugas siswa
          </p>
        </div>
        <button 
          onClick={fetchSubmissions}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          Refresh Data
        </button>
      </div>{/* Submissions Table */}
      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Daftar Pengumpulan Tugas</h2>
          <p className="text-pink-200">Total pengumpulan: {submissions.length}</p>
        </div>
        
        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white font-semibold">Siswa</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Tugas</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Mata Pelajaran</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Waktu Submit</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-white font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-pink-400" />
                        <div>
                          <div className="font-medium text-white">{submission.user?.name}</div>
                          <div className="text-sm text-pink-300">{submission.user?.jurusan}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{submission.tugas?.judul}</div>
                        <div className="text-sm text-pink-300">
                          Deadline: {new Date(submission.tugas?.deadline).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{submission.tugas?.mata_pelajaran}</td>
                    <td className="py-3 px-4 text-pink-200">
                      {new Date(submission.waktu_submit).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(submission)}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                        <button
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowGradeDialog(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Nilai</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <p className="text-white font-medium">Tidak ada pengumpulan tugas ditemukan</p>
            <p className="text-sm text-pink-300 mt-2">
              Debug info: Submissions array length = {submissions.length}, 
              Loading = {loading.toString()}, 
              Token = {token ? 'available' : 'missing'}
            </p>
            <button 
              onClick={fetchSubmissions} 
              className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Coba Muat Ulang
            </button>
          </div>
        )}
      </div>      {/* Grade Dialog */}      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-lg backdrop-blur-sm bg-white/10 border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Berikan Nilai</DialogTitle>
            <DialogDescription className="text-pink-200">
              {selectedSubmission?.tugas?.judul} - {selectedSubmission?.user?.name}
            </DialogDescription>
          </DialogHeader><form onSubmit={handleGradeSubmission} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nilai" className="text-white font-medium">Nilai (0-100)</Label>
              <Input
                id="nilai"
                type="number"
                min="0"
                max="100"
                value={gradeData.nilai}
                onChange={(e) => setGradeData(prev => ({ ...prev, nilai: e.target.value }))}
                placeholder="Masukkan nilai..."
                className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-white font-medium">Feedback (Opsional)</Label>
              <Textarea
                id="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Masukkan feedback untuk siswa..."
                className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div><button 
              type="submit" 
              disabled={grading} 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {grading ? 'Memproses...' : 'Berikan Nilai'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Pengumpulan Tugas</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.tugas?.judul} - {selectedSubmission?.user?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Informasi Siswa:</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Nama:</strong> {selectedSubmission.user?.name}</p>
                  <p><strong>Jurusan:</strong> {selectedSubmission.user?.jurusan}</p>
                  <p><strong>NISN:</strong> {selectedSubmission.user?.nisn}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Informasi Tugas:</h4>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p><strong>Judul:</strong> {selectedSubmission.tugas?.judul}</p>
                  <p><strong>Mata Pelajaran:</strong> {selectedSubmission.tugas?.mata_pelajaran}</p>
                  <p><strong>Deadline:</strong> {new Date(selectedSubmission.tugas?.deadline).toLocaleString()}</p>
                  <p><strong>Waktu Submit:</strong> {new Date(selectedSubmission.waktu_submit).toLocaleString()}</p>
                  {selectedSubmission.terlambat && (
                    <Badge variant="destructive">Terlambat</Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Jawaban Siswa:</h4>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSubmissionsPage;
