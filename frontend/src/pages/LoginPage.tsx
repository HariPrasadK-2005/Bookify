import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="page-head text-center">
        <h2>Welcome back</h2>
        <p>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="paper-form space-y-4 bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-xs">
        {error && (
          <div className="bg-[#F2DCD5] text-[var(--clay-dark)] p-3 rounded-lg text-xs font-bold">
            {error}
          </div>
        )}

        <div>
          <label>Email address</label>
          <input
            type="email"
            required
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-bookify btn-forest w-full justify-center py-2.5 mt-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="text-center pt-2 text-xs text-[var(--ink-soft)]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[var(--forest-dark)] hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};
