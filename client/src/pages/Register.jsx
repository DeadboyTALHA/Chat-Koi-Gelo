import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', username: '', phone: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      // Convert to lowercase as user types
      setForm({ ...form, [name]: value.toLowerCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/people');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full border rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white';

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
        <h2 className='text-2xl font-bold text-primary mb-6 text-center'>Create Account</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {[
            { label: 'Full Name', name: 'fullName', type: 'text' },
            { label: 'Username (cannot contain your name)', name: 'username', type: 'text' },
            { label: 'Phone Number', name: 'phone', type: 'tel' },
            { label: 'Email Address', name: 'email', type: 'email' },
            { label: 'Password', name: 'password', type: 'password' },
            { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className='text-sm font-medium text-gray-700'>{label}</label>
              <input className={inputCls} type={type} name={name}
                value={form[name]} onChange={handleChange} required />
            </div>
          ))}
          <button disabled={loading}
            className='w-full bg-accent text-white py-2 rounded-lg font-bold hover:bg-primary transition-colors'>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className='text-center mt-4 text-sm'>
          Already have an account?{' '}
          <span className='text-accent cursor-pointer underline'
            onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
}