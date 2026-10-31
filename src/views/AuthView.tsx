import React, { useState } from 'react';
import { ShieldCheck, Github, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
        toast('Account created successfully!', 'success');
      } else {
        await login(email, password);
        toast('Welcome back to DevLens!', 'success');
      }
      onSuccess();
    } catch (err: unknown) {
      toast((err as Error).message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'developer' | 'tech_lead') => {
    setLoading(true);
    try {
      await demoLogin(role);
      toast(`Signed in as Demo ${role === 'developer' ? 'Senior Engineer' : 'Tech Lead'}!`, 'success');
      onSuccess();
    } catch {
      toast('Demo sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isRegister ? 'Create DevLens Account' : 'Sign in to DevLens'}
          </h2>
          <p className="text-xs text-gray-400">
            Access automated pull request reviews and static security scans
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#0d1117] border border-indigo-500/30 space-y-2">
          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
            <span>Instant Demo Sign-In</span>
            <span className="text-[10px] font-mono text-emerald-400">Evaluator Ready</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemo('developer')}
              className="px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-medium text-white transition-colors"
            >
              Demo Engineer
            </button>
            <button
              onClick={() => handleDemo('tech_lead')}
              className="px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-medium text-white transition-colors"
            >
              Demo Tech Lead
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#30363d] w-full" />
          <span className="bg-[#161b22] px-3 text-[11px] font-mono text-gray-400 uppercase">
            or standard auth
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
