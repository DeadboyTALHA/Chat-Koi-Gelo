import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AddPeopleModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const search = async () => {
    if (!query.trim()) {
      toast.error('Please enter a username to search');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.get(`/people/search?q=${query}`);
      setResults(data);
      if (data.length === 0) {
        toast.info('No users found');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const sendReq = async (userId) => {
    try {
      await api.post('/people/request', { toUserId: userId });
      toast.success('Request sent!');
      // Remove the user from results after request
      setResults(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-bold text-lg text-primary dark:text-primary'>Add People</h3>
          <X className='cursor-pointer dark:text-gray-400 dark:hover:text-white' onClick={onClose} />
        </div>
        
        <div className='flex gap-2 mb-4'>
          <input 
            className='flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
            placeholder='Search by username...'
            value={query} 
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()} 
          />
          <button 
            onClick={search} 
            disabled={loading}
            className='bg-accent text-white px-4 rounded-lg hover:bg-primary transition-colors disabled:opacity-50'
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>
        
        <div className='space-y-2 max-h-60 overflow-y-auto'>
          {results.length === 0 && !loading && query && (
            <p className='text-center text-gray-500 dark:text-gray-400 py-4'>No users found</p>
          )}
          {results.map(u => (
            <div key={u._id} className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'>
              <div>
                <p className='font-medium dark:text-white'>{u.fullName}</p>
                <p className='text-sm text-gray-500 dark:text-gray-400'>@{u.username}</p>
              </div>
              <button onClick={() => sendReq(u._id)}
                className='bg-accent text-white text-sm px-3 py-1 rounded-full hover:bg-primary transition-colors'>
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}