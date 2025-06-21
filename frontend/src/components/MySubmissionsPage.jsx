import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Calendar, User, Trash2, Eye, Clock, CheckCircle } from 'lucide-react';
import { LoadingCard } from './ui/loading';

const MySubmissionsPage = () => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getMySubmissions(token);
      if (response.success) {
        setSubmissions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleCancelSubmission = async (submissionId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengumpulan tugas ini?')) return;

    try {
      const response = await api.cancelSubmission(token, submissionId);
      if (response.success) {
        fetchSubmissions();
        alert('Pengumpulan tugas berhasil dibatalkan!');
      } else {
        alert(response.message || 'Gagal membatalkan pengumpulan tugas');
      }
    } catch (error) {
      console.error('Error cancelling submission:', error);
      alert('Terjadi kesalahan saat membatalkan pengumpulan tugas');
    }
  };
  const getStatusBadge = (submission) => {
    if (submission.nilai !== null) {
      return <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">Sudah Dinilai</span>;
    }
    return <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30">Menunggu Penilaian</span>;
  };

  if (loading) {
    return <LoadingCard message="Memuat pengumpulan tugas..." />;
  }
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Pengumpulan Tugas Saya
        </h1>
        <p className="text-pink-200 text-sm sm:text-base">
          Lihat daftar tugas yang sudah dikumpulkan dan nilainya
        </p>
      </div>{/* Submissions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {submissions.map((submission) => (
          <Card key={submission.id} className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-white">{submission.tugas?.judul}</CardTitle>
                  <CardDescription className="text-pink-200">
                    {submission.tugas?.mata_pelajaran} {submission.tugas?.jurusan && `- ${submission.tugas?.jurusan}`}
                  </CardDescription>
                </div>
                {getStatusBadge(submission)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-pink-300">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Dikumpulkan: {new Date(submission.waktu_submit).toLocaleString()}</span>
                  </div>
                </div>

                {submission.terlambat && (
                  <span className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 text-xs font-semibold rounded-full border border-red-500/30">
                    Terlambat
                  </span>
                )}                {submission.nilai !== null && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-green-300">Nilai: {submission.nilai}/100</span>
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-green-200 mt-2">
                        Feedback: {submission.feedback}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setShowPreview(true);
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  
                  {submission.nilai === null && (
                    <Button
                      size="sm"
                      onClick={() => handleCancelSubmission(submission.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Batalkan
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>      {submissions.length === 0 && (
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-12 text-center shadow-2xl">
          <FileText className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <p className="text-white font-medium">Belum ada tugas yang dikumpulkan</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
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
                  {selectedSubmission.jawaban_text && (
                    <div>
                      <strong>Jawaban:</strong>
                      <p className="mt-1 whitespace-pre-wrap">{selectedSubmission.jawaban_text}</p>
                    </div>
                  )}
                  {selectedSubmission.file_jawaban && (
                    <p><strong>File:</strong> {selectedSubmission.file_jawaban}</p>
                  )}
                  {selectedSubmission.terlambat && (
                    <Badge variant="destructive">Terlambat</Badge>
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
  );
};

export default MySubmissionsPage;
