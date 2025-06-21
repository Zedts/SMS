import { GraduationCap, UserCheck, Settings, BookOpen, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-black overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-500/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="mb-8 animate-bounce-slow">
            <GraduationCap className="w-20 h-20 text-pink-300 mx-auto mb-4" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 animate-slide-up">
            <span className="bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
              Sistem Manajemen
            </span>
            <br />
            <span className="text-white">Siswa</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-200 mb-10 max-w-4xl mx-auto leading-relaxed animate-slide-up delay-200">
            Platform pembelajaran digital yang menghubungkan siswa, guru, dan admin dalam satu ekosistem pendidikan yang terintegrasi. 
            Kelola absensi, tugas, dan monitoring pembelajaran dengan mudah dan efisien.
          </p>
          
          <Button
            onClick={onLogin}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 rounded-xl font-semibold text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up delay-300"
          >
            <BookOpen className="w-6 h-6 mr-3" />
            Masuk Sekarang
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:bg-white/15 animate-slide-up delay-400">
            <div className="mb-6 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full opacity-70 animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-pink-300">Untuk Siswa</h3>
            <ul className="space-y-3 text-pink-200">
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-pink-400" />
                Absensi digital dengan mudah
              </li>
              <li className="flex items-center">
                <BookOpen className="w-4 h-4 mr-3 text-pink-400" />
                Akses tugas dari berbagai mata pelajaran
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-3 text-pink-400" />
                Upload dan submit tugas online
              </li>
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-pink-400" />
                Notifikasi deadline tugas
              </li>
            </ul>
          </div>
          
          <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:bg-white/15 animate-slide-up delay-500">
            <div className="mb-6 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full opacity-70 animate-ping delay-200"></div>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-orange-300">Untuk Guru</h3>
            <ul className="space-y-3 text-pink-200">
              <li className="flex items-center">
                <UserCheck className="w-4 h-4 mr-3 text-orange-400" />
                Kelola absensi siswa
              </li>
              <li className="flex items-center">
                <BookOpen className="w-4 h-4 mr-3 text-orange-400" />
                Buat dan distribusi tugas
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-3 text-orange-400" />
                Evaluasi hasil pengerjaan siswa
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-3 text-orange-400" />
                Dashboard analytics siswa
              </li>
            </ul>
          </div>
          
          <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 hover:bg-white/15 animate-slide-up delay-600">
            <div className="mb-6 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full opacity-70 animate-ping delay-400"></div>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-300">Untuk Admin</h3>
            <ul className="space-y-3 text-pink-200">
              <li className="flex items-center">
                <Settings className="w-4 h-4 mr-3 text-gray-400" />
                Manajemen pengguna lengkap
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                Monitoring sistem keseluruhan
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                Laporan dan statistik
              </li>
              <li className="flex items-center">
                <Settings className="w-4 h-4 mr-3 text-gray-400" />
                Kontrol akses penuh
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center animate-slide-up delay-700">
            <div className="text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-pink-300">Digital</div>
          </div>
          <div className="text-center animate-slide-up delay-800">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-pink-300">Akses</div>
          </div>
          <div className="text-center animate-slide-up delay-900">
            <div className="text-4xl font-bold text-white mb-2">Real-time</div>
            <div className="text-pink-300">Data</div>
          </div>
          <div className="text-center animate-slide-up delay-1000">
            <div className="text-4xl font-bold text-white mb-2">Secure</div>
            <div className="text-pink-300">System</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;