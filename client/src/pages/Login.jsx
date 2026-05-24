import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/people');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // Updated input classes for dark mode
  const inputCls = 'w-full border rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500';

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-sm'>
        <h2 className='text-2xl font-bold text-primary dark:text-primary mb-6 text-center'>Welcome Back</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Username / Email / Phone</label>
            <input 
              className={inputCls}
              value={identifier} 
              onChange={e => setIdentifier(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Password</label>
            <input 
              type='password'
              className={inputCls}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            disabled={loading}
            className='w-full bg-accent text-white py-2 rounded-lg font-bold hover:bg-primary transition-colors'
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className='text-center mt-4 text-sm text-gray-600 dark:text-gray-400'>
          No account?{' '}
          <span className='text-accent cursor-pointer underline'
            onClick={() => navigate('/register')}>Register</span>
        </p>
      </div>
    </div>
  );
}