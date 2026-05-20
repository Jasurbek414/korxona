import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Username va parolni kiriting');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Tizimga xush kelibsiz!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login xatosi';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      
      <div className="relative w-full max-w-[400px] animate-fade-in z-10 flex flex-col gap-8">
        {/* Glowing Logo Card Header */}
        <div className="text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg className="w-10 h-10 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight">
              {t('auth.loginSubtitle')}
            </h1>
            <p className="text-blue-200/60 text-[14px] tracking-wide font-medium">
              {t('auth.loginTitle')}
            </p>
          </div>
        </div>

        {/* Premium Glassmorphic Form Card */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }} className="flex flex-col gap-5 bg-[#0F172A]/40 backdrop-blur-[32px] border border-white/[0.08] rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative">
          {/* Top subtle highlight border */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

          {/* Username Input Field */}
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.15em] ml-1">
              {t('auth.username')}
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none">
                <HiOutlineUser className="text-[20px]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                style={{ padding: '0.875rem', paddingLeft: '2.75rem' }}
                className="w-full bg-black/20 border border-white/[0.05] rounded-xl text-white placeholder:text-slate-500/50 focus:outline-none focus:border-blue-500/50 focus:ring-[2px] focus:ring-blue-500/20 focus:bg-black/40 transition-all duration-300 text-[14px]"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.15em] ml-1">
              {t('auth.password')}
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none">
                <HiOutlineLockClosed className="text-[20px]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ padding: '0.875rem', paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                className="w-full bg-black/20 border border-white/[0.05] rounded-xl text-white placeholder:text-slate-500/50 focus:outline-none focus:border-blue-500/50 focus:ring-[2px] focus:ring-blue-500/20 focus:bg-black/40 transition-all duration-300 text-[14px] font-medium tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500/80 hover:text-slate-300 transition-colors duration-300"
              >
                {showPassword ? <HiOutlineEyeSlash className="text-[20px]" /> : <HiOutlineEye className="text-[20px]" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.875rem' }}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] transform active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer text-[14px] tracking-wide relative overflow-hidden"
          >
            {/* Inner button highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-white/30" />
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <span>{t('auth.loginBtn')}</span>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-6 items-center">
          {/* Language Switcher */}
          <div className="flex items-center justify-center gap-3">
            {['uz', 'ru'].map(lang => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`flex items-center justify-center px-4 h-8 rounded-full text-[10.5px] font-bold tracking-[0.1em] uppercase transition-all duration-300 border cursor-pointer leading-none pt-[2px] ${
                  i18n.language === lang
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                {lang === 'uz' ? "O'zbekcha" : 'Русский'}
              </button>
            ))}
          </div>
          <p className="text-center text-slate-500/60 text-[11px] font-medium">
            © {new Date().getFullYear()} {t('auth.loginSubtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}
