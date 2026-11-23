import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Lock, Phone, User, Eye, EyeOff, 
  GraduationCap, Bus, CheckCircle2, ShieldCheck, Sparkles, ArrowRight 
} from 'lucide-react';
import YathraBrandLogo from '../components/YathraBrandLogo';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('type') === 'sliit' ? 'sliit' : 'standard';

  const [authMode, setAuthMode] = useState(initialMode); // 'standard' | 'sliit'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('type') === 'sliit') {
      setAuthMode('sliit');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (authMode === 'sliit') {
      const isSliit = trimmedEmail.toLowerCase().endsWith('@my.sliit.lk') || trimmedEmail.toLowerCase().endsWith('@sliit.lk');
      if (!isSliit) {
        setError('⚠️ Invalid Email');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        let cachedUser = {};
        try {
          const userStr = localStorage.getItem('yathra_user') || localStorage.getItem('tripzo_user');
          if (userStr && userStr !== 'undefined') {
            cachedUser = JSON.parse(userStr);
          }
        } catch (e) {
          cachedUser = {};
        }
        if (cachedUser && (cachedUser.role === 'Admin' || cachedUser.role === 'Operator')) {
          navigate('/admin');
        } else if (authMode === 'sliit' || cachedUser?.isSliitStudent || trimmedEmail.toLowerCase().endsWith('@my.sliit.lk') || trimmedEmail.toLowerCase().endsWith('@sliit.lk')) {
          navigate('/sliit-transit');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Could not connect to authentication server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-6 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <YathraBrandLogo className="h-14 sm:h-18 w-auto mb-2" />
          <h2 className="mt-1 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {authMode === 'sliit' ? 'SLIIT Transit Portal' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {authMode === 'sliit' 
              ? 'SLIIT Student Email Authentication' 
              : 'Log in to manage your Yathra journeys'}
          </p>
        </div>

        {/* Portal Mode Tabs (Standard Passenger vs SLIIT Student Portal) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setAuthMode('standard');
              setError('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'standard'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-primary-500" />
            <span>Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('sliit');
              setError('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'sliit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>🎓 SLIIT Student</span>
          </button>
        </div>


        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-xs font-semibold rounded-2xl border border-rose-200/50 dark:border-rose-900/30">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              {authMode === 'sliit' ? 'SLIIT Email' : 'Username or Email'}
            </label>
            <div className="relative">
              {authMode === 'sliit' ? (
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-blue-500" />
              ) : (
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              )}
              <input
                type={authMode === 'sliit' ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={authMode === 'sliit' ? 'Enter sliit mail' : 'John Doe or you@example.com'}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none transition-all dark:text-white ${
                  authMode === 'sliit'
                    ? 'border-blue-300 dark:border-blue-800 focus:ring-2 focus:ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember" className="ml-2 font-semibold text-slate-500 dark:text-slate-400">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="font-semibold text-primary-500 hover:text-primary-600">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-black text-white shadow-md transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer ${
              authMode === 'sliit'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/10'
            }`}
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>{authMode === 'sliit' ? '🎓 Enter SLIIT Transit Portal' : 'Log In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs font-semibold text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link 
            to={authMode === 'sliit' ? '/register?type=sliit' : '/register'} 
            className="text-primary-500 hover:text-primary-600 font-bold"
          >
            {authMode === 'sliit' ? 'Register with SLIIT Email' : 'Create an account'}
          </Link>
        </p>

      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('type') === 'sliit' ? 'sliit' : 'standard';

  const [registerMode, setRegisterMode] = useState(initialMode); // 'standard' | 'sliit'
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('type') === 'sliit') {
      setRegisterMode('sliit');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (registerMode === 'sliit') {
      const isSliit = trimmedEmail.toLowerCase().endsWith('@my.sliit.lk') || trimmedEmail.toLowerCase().endsWith('@sliit.lk');
      if (!isSliit) {
        setError('⚠️ Invalid Email');
        return;
      }
      if (!studentId.trim()) {
        setError('⚠️ කරුණාකර ඔබගේ SLIIT Student ID (e.g. IT21004567) ඇතුළත් කරන්න.');
        return;
      }
    }

    setLoading(true);

    try {
      const isSliitStudent = registerMode === 'sliit';
      const res = await register(username, fullName, trimmedEmail, phone, password, isSliitStudent, studentId);
      if (res.success) {
        if (isSliitStudent) {
          navigate('/sliit-transit');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreFillStudent = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setUsername(`sliit_student_${randomNum}`);
    setFullName('Kavindu Perera');
    setEmail(`it22${randomNum}@my.sliit.lk`);
    setStudentId(`IT22${randomNum}`);
    setPhone('+94 77 987 6543');
    setPassword('sliit123');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-6 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <YathraBrandLogo className="h-14 sm:h-18 w-auto mb-2" />
          <h2 className="mt-1 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {registerMode === 'sliit' ? 'SLIIT Student Registration' : 'Create an account'}
          </h2>
          <p className="mt-1 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {registerMode === 'sliit'
              ? 'SLIIT Student Registration'
              : 'Join Yathra for premium road transit booking'}
          </p>
        </div>

        {/* Portal Mode Tabs (Passenger vs SLIIT Student) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setRegisterMode('standard');
              setError('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              registerMode === 'standard'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-primary-500" />
            <span>Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRegisterMode('sliit');
              setError('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              registerMode === 'sliit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>🎓 SLIIT Student</span>
          </button>
        </div>

        {/* Quick Pre-fill in SLIIT Mode */}
        {registerMode === 'sliit' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePreFillStudent}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>⚡ Pre-fill Sample Data</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-xs font-semibold rounded-2xl border border-rose-200/50 dark:border-rose-900/30">
            {error}
          </div>
        )}

        <form className="space-y-3.5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe123"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          {registerMode === 'sliit' && (
            <div>
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">
                SLIIT Student ID (ශිෂ්‍ය අංකය)
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3.5 w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="IT21004567"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-blue-300 dark:border-blue-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              {registerMode === 'sliit' ? 'SLIIT Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-3.5 w-4 h-4 ${registerMode === 'sliit' ? 'text-blue-500' : 'text-slate-400'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={registerMode === 'sliit' ? 'Enter sliit mail' : 'john@example.com'}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none transition-all dark:text-white ${
                  registerMode === 'sliit'
                    ? 'border-blue-300 dark:border-blue-800 focus:ring-2 focus:ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-black text-white shadow-md transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer ${
              registerMode === 'sliit'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/10'
            }`}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>{registerMode === 'sliit' ? '🎓 Register as SLIIT Student' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <Link 
            to={registerMode === 'sliit' ? '/login?type=sliit' : '/login'} 
            className="text-primary-500 hover:text-primary-600 font-bold"
          >
            Log in instead
          </Link>
        </p>

      </div>
    </div>
  );
}
