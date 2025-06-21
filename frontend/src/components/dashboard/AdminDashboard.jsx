import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, UserCheck, Settings } from 'lucide-react';
import { LoadingCard } from '../ui/loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getDashboard('admin', token);
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
          <LoadingCard message="Memuat dashboard admin..." />
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
          Dashboard Admin
        </h1>
        <p className="text-pink-200 mt-2 text-sm sm:text-base">
          Kelola dan pantau aktivitas sistem secara keseluruhan
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-pink-200">Total Siswa</h3>
            <Users className="h-4 w-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
            {data.total_stats.total_siswa}
          </div>
          <p className="text-xs text-pink-300 mt-1">Siswa terdaftar</p>
        </div>

        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-pink-200">Total Guru</h3>
            <UserCheck className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            {data.total_stats.total_guru}
          </div>
          <p className="text-xs text-pink-300 mt-1">Guru aktif</p>
        </div>

        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-pink-200">Total Admin</h3>
            <Settings className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            {data.total_stats.total_admin}
          </div>
          <p className="text-xs text-pink-300 mt-1">Administrator</p>
        </div>

        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-pink-200">Total Tugas</h3>
            <BookOpen className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            {data.total_stats.total_tugas}
          </div>
          <p className="text-xs text-pink-300 mt-1">Tugas dibuat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Distribusi Pengguna per Role</h2>
            <p className="text-pink-200">Persentase pengguna berdasarkan peran</p>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <PieChart>
              <Pie
                data={data.user_per_role}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, persentase }) => `${role} (${persentase}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="jumlah"
              >
                {data.user_per_role.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Statistik Sistem</h2>
            <p className="text-pink-200">Ringkasan data sistem</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-pink-500" />
                <span className="font-medium text-white">Total Siswa</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                {data.total_stats.total_siswa}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-green-500" />
                <span className="font-medium text-white">Total Guru</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                {data.total_stats.total_guru}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-white">Total Admin</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {data.total_stats.total_admin}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-white">Total Tugas</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {data.total_stats.total_tugas}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Detail Distribusi Pengguna</h2>
          <p className="text-pink-200">Breakdown detail pengguna berdasarkan role</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.user_per_role.map((item, index) => (
            <div key={item.role} className="text-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {item.jumlah}
              </div>
              <h3 className="font-semibold text-lg capitalize text-white">{item.role}</h3>
              <p className="text-sm text-pink-300">{item.persentase}% dari total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

