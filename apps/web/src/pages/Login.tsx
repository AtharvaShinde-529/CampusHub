import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import { Hexagon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Role-based routing
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-md w-full p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 z-10 relative">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-600 p-3 rounded-2xl">
            <Hexagon className="text-white fill-white/20" size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-slate-900">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8">Sign in to CampusHub</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-semibold text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white/50" 
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white/50" 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" className="w-full bg-brand-600 text-white p-3 rounded-xl font-bold hover:bg-brand-500 transition-colors shadow-sm">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-slate-600 text-sm">
          Don't have an account? <Link to="/register" className="text-brand-600 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
