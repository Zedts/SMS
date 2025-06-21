import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { LoadingCard } from '../ui/loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const GuruDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getDashboard('guru', token);
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-fade-in">
          <LoadingCard message="Memuat dashboard guru..." />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">Error loading dashboard data</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Dashboard Guru
        </h1>
        <p className="text-pink-200 text-sm sm:text-base">
          Kelola dan pantau aktivitas pembelajaran siswa
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-300">Total Siswa</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.siswa_per_jurusan.reduce((total, item) => total + item.jumlah, 0)}
            </div>
            <p className="text-xs text-pink-200">
              Semua jurusan
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-300">Absensi Pending</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.absensi_pending.length}</div>
            <p className="text-xs text-orange-200">
              Menunggu persetujuan
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-300">Tugas Terlambat</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{data.tugas_terlambat.length}</div>
            <p className="text-xs text-red-200">
              Perlu ditinjau
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Absensi Hari Ini</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.absensi_hari_ini.reduce((total, item) => total + item.jumlah, 0)}
            </div>
            <p className="text-xs text-green-200">
              Total absensi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Distribusi Siswa per Jurusan</CardTitle>
            <CardDescription className="text-pink-200">Persentase siswa berdasarkan jurusan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={data.siswa_per_jurusan}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ jurusan, persentase }) => `${jurusan} (${persentase}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="jumlah"
                >
                  {data.siswa_per_jurusan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Status Absensi Hari Ini</CardTitle>
            <CardDescription className="text-pink-200">Distribusi status absensi siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={data.absensi_hari_ini}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="status" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }} 
                />
                <Legend />
                <Bar dataKey="jumlah" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Absensi Pending</CardTitle>
            <CardDescription className="text-pink-200">Daftar absensi yang menunggu persetujuan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.absensi_pending.map((absen) => (
                <div key={absen.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-white">{absen.user.name}</h4>
                    <p className="text-sm text-pink-200">{absen.user.jurusan}</p>
                    <p className="text-xs text-pink-300">
                      {new Date(absen.waktu_absen).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 rounded-full border border-yellow-500/30">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
              {data.absensi_pending.length === 0 && (
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                  <p className="text-pink-200 font-medium">Tidak ada absensi yang pending</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Tugas Terlambat</CardTitle>
            <CardDescription className="text-pink-200">Daftar pengumpulan tugas yang terlambat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.tugas_terlambat.map((submission) => (
                <div key={submission.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-white">{submission.user.name}</h4>
                    <p className="text-sm text-pink-200">{submission.tugas.judul}</p>
                    <p className="text-xs text-pink-300">
                      Submit: {new Date(submission.waktu_submit).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium px-2 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 rounded-full border border-red-500/30">
                      Terlambat
                    </span>
                  </div>
                </div>
              ))}
              {data.tugas_terlambat.length === 0 && (
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                  <p className="text-pink-200 font-medium">Tidak ada tugas yang terlambat</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuruDashboard;

