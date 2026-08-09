import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    college: '',
    department: 'Computer Science',
    year: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <div className="page-head text-center">
        <h2>Join Bookify</h2>
        <p>Create your student account with minimal details</p>
      </div>

      <form onSubmit={handleSubmit} className="paper-form space-y-4 bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-xs">
        {error && (
          <div className="bg-[#F2DCD5] text-[var(--clay-dark)] p-3 rounded-lg text-xs font-bold">
            {error}
          </div>
        )}

        <div>
          <label>Full Name *</label>
          <input
            name="fullName"
            type="text"
            required
            placeholder="e.g. Arun Kumar"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email Address *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="arun@college.edu"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Password *</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>College / University *</label>
          <input
            name="college"
            type="text"
            required
            placeholder="e.g. MIT College of Engineering"
            value={formData.college}
            onChange={handleChange}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-bookify btn-forest w-full justify-center py-2.5"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-[var(--ink-soft)]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--forest-dark)] hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};
