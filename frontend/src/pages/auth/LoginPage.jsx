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
      
      <div className="relative w-full max-w-[440px] animate-fade-in z-10">
        {/* Glowing Logo Card Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-violet-600 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] mb-6 relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg className="w-10 h-10 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">
            {t('auth.loginSubtitle')}
          </h1>
          <p className="text-blue-200/60 mt-2 text-[15px] tracking-wide font-medium">
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Premium Glassmorphic Form Card */}
        <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }} className="bg-[#0F172A]/40 backdrop-blur-[32px] border border-white/[0.08] rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative">
          {/* Top subtle highlight border */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

          {/* Username Input Field */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-400/80 uppercase tracking-[0.15em] mb-2.5 ml-1">
              {t('auth.username')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none">
                <HiOutlineUser className="text-[22px]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                style={{ paddingLeft: '3.25rem', paddingRight: '1rem' }}
                className="w-full py-4 bg-black/20 border border-white/[0.05] rounded-2xl text-white placeholder:text-slate-500/50 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/20 focus:bg-black/40 transition-all duration-300 text-[15px]"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="mb-8">
            <label className="block text-[11px] font-bold text-slate-400/80 uppercase tracking-[0.15em] mb-2.5 ml-1">
              {t('auth.password')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/80 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none">
                <HiOutlineLockClosed className="text-[22px]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
                className="w-full py-4 bg-black/20 border border-white/[0.05] rounded-2xl text-white placeholder:text-slate-500/50 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/20 focus:bg-black/40 transition-all duration-300 text-[15px] font-medium tracking-wide"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500/80 hover:text-slate-300 transition-colors duration-300"
              >
                {showPassword ? <HiOutlineEyeSlash className="text-[22px]" /> : <HiOutlineEye className="text-[22px]" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] transform active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer text-[15px] tracking-wide relative overflow-hidden"
          >
            {/* Inner button highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-white/30" />
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <span>{t('auth.loginBtn')}</span>
            )}
          </button>
        </form>

        {/* Language Switcher */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {['uz', 'ru'].map(lang => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold tracking-[0.1em] uppercase transition-all duration-300 border cursor-pointer ${
                i18n.language === lang
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.03]'
              }`}
            >
              {lang === 'uz' ? "O'zbekcha" : 'Русский'}
            </button>
          ))}
        </div>
        <p className="text-center text-slate-500/60 text-[12px] mt-8 font-medium">
          © {new Date().getFullYear()} {t('auth.loginSubtitle')}
        </p>
      </div>
    </div>
  );
}
