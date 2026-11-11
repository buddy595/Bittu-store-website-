import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { adminLogin } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = adminLogin(email, password);
      setLoading(false);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid username or password.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Camo Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-700/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Top Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="text-xs text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cadet Store</span>
          </button>
          
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
            RESTRICTED ACCESS
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-900/40 border border-red-700/50 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Merchant &amp; Stock Admin
          </h1>
          <p className="text-xs text-stone-400">
            Manage uniform inventory, set custom photos &amp; prices, and configure direct bank payouts.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter admin username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-medium text-white placeholder-stone-500 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Secret Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-medium text-white placeholder-stone-500 focus:outline-hidden focus:border-red-600 focus:ring-1 focus:ring-red-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 cursor-pointer transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Security Footer */}
        <div className="pt-2 border-t border-stone-800 text-center text-[11px] text-stone-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Encrypted Session • Verified Store Owner Only</span>
          </p>
        </div>

      </div>
    </div>
  );
};
