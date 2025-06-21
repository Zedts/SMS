import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { LoadingCard } from '../ui/loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SiswaDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getDashboard('siswa', token);
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
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg">Memuat dashboard siswa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-white text-lg">Gagal memuat data dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
        Dashboard Siswa
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="group backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-300">Tugas Pending</CardTitle>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{data.total_tugas_pending}</div>
            <p className="text-xs text-pink-200">
              Tugas yang belum dikumpulkan
            </p>
          </CardContent>
        </Card>

        <Card className="group backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-slide-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-300">Status Absen Hari Ini</CardTitle>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {data.absen_hari_ini ? data.absen_hari_ini.status : 'Belum Absen'}
            </div>
            <p className="text-xs text-orange-200">
              {data.absen_hari_ini ? 
                `Waktu: ${new Date(data.absen_hari_ini.waktu_absen).toLocaleTimeString()}` : 
                'Silakan lakukan absensi'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="group backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105 animate-slide-up delay-400 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Total Tugas</CardTitle>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{data.tugas_belum_dikumpulkan.length}</div>
            <p className="text-xs text-green-200">
              Tugas yang tersedia
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white animate-slide-up delay-600">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-pink-300">Tugas Terbaru</CardTitle>
            <CardDescription className="text-pink-200">Daftar tugas yang belum dikumpulkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.tugas_belum_dikumpulkan.slice(0, 5).map((tugas) => (
                <div key={tugas.id} className="flex justify-between items-center p-3 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <h4 className="font-medium text-white">{tugas.judul}</h4>
                    <p className="text-sm text-pink-200">{tugas.mata_pelajaran}</p>
                    <p className="text-xs text-orange-200">
                      Deadline: {new Date(tugas.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-pink-300">
                      {tugas.creator.name}
                    </span>
                  </div>
                </div>
              ))}
              {data.tugas_belum_dikumpulkan.length === 0 && (
                <p className="text-center text-pink-300 py-4">
                  Tidak ada tugas yang belum dikumpulkan
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white animate-slide-up delay-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-orange-300">Informasi Absensi</CardTitle>
            <CardDescription className="text-orange-200">Status absensi hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            {data.absen_hari_ini ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Status:</span>
                  <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                    data.absen_hari_ini.status === 'hadir' ? 'bg-green-500/20 text-green-300' :
                    data.absen_hari_ini.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {data.absen_hari_ini.status}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Waktu Absen:</span>
                  <span className="text-pink-300">{new Date(data.absen_hari_ini.waktu_absen).toLocaleTimeString()}</span>
                </div>
                {data.absen_hari_ini.keterangan && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-white block mb-2">Keterangan:</span>
                    <span className="text-orange-200">{data.absen_hari_ini.keterangan}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-pink-300">Anda belum melakukan absensi hari ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiswaDashboard;

