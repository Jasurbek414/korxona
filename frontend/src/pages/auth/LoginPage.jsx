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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />
      
      {/* Premium background decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-[120px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-600/10 to-transparent rounded-full blur-[100px] animate-float" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in z-10">
        {/* Glowing Logo Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-5 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-violet-600 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <svg className="w-10 h-10 text-white relative z-10 transform group-hover:scale-115 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            {t('auth.loginSubtitle')}
          </h1>
          <p className="text-blue-300/50 mt-2 text-sm tracking-wide font-medium">
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Premium Glassmorphic Form Card */}
        <form onSubmit={handleSubmit} style={{ padding: '2.25rem 2rem' }} className="bg-slate-900/40 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Top subtle highlight border */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {/* Username Input Field */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">
              {t('auth.username')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none">
                <HiOutlineUser className="text-xl" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                style={{ paddingLeft: '3rem', paddingRight: '1rem' }}
                className="w-full py-3.5 bg-slate-950/40 border border-white/[0.06] rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-slate-950/60 transition-all duration-300"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">
              {t('auth.password')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none">
                <HiOutlineLockClosed className="text-xl" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '3rem', paddingRight: '3.25rem' }}
                className="w-full py-3.5 bg-slate-950/40 border border-white/[0.06] rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-slate-950/60 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-300"
              >
                {showPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold rounded-2xl shadow-xl shadow-blue-900/30 hover:shadow-blue-500/25 transform active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <span className="tracking-wide">{t('auth.loginBtn')}</span>
            )}
          </button>
        </form>

        {/* Language Switcher */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {['uz', 'ru'].map(lang => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                i18n.language === lang
                  ? 'bg-blue-600/15 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.02]'
              }`}
            >
              {lang === 'uz' ? "O'zbekcha" : 'Русский'}
            </button>
          ))}
        </div>
        <p className="text-center text-slate-600 text-xs mt-6 tracking-wide font-medium">
          © {new Date().getFullYear()} {t('auth.loginSubtitle')}
        </p>
      </div>
    </div>
  );
}
