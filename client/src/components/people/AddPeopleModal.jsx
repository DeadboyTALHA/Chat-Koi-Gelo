import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AddPeopleModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    if (!query.trim()) return;
    const { data } = await api.get(`/people/search?q=${query}`);
    setResults(data);
  };

  const sendReq = async (userId) => {
    try {
      await api.post('/people/request', { toUserId: userId });
      toast.success('Request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
      {/* MODAL CONTAINER - Added dark mode background */}
      <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        
        <div className='flex justify-between items-center mb-4'>
          {/* HEADER TEXT - Added dark mode text color */}
          <h3 className='font-bold text-lg text-primary dark:text-primary'>Add People</h3>
          {/* CLOSE ICON - Added dark mode hover effect */}
          <X className='cursor-pointer dark:text-gray-400 dark:hover:text-white' onClick={onClose} />
        </div>
        
        <div className='flex gap-2 mb-4'>
          {/* INPUT - Already has dark mode classes */}
          <input 
            className='flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
            placeholder='Search by username...'
            value={query} 
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()} 
          />
          {/* SEARCH BUTTON - Added dark mode hover */}
          <button 
            onClick={search} 
            className='bg-accent text-white px-4 rounded-lg hover:bg-primary transition-colors'
          >
            Go
          </button>
        </div>
        
        <div className='space-y-2 max-h-60 overflow-y-auto'>
          {results.map(u => (
            // RESULT ITEM - Added dark mode hover and background
            <div key={u._id} className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'>
              <div>
                {/* NAME - Added dark mode text color */}
                <p className='font-medium dark:text-white'>{u.fullName}</p>
                {/* USERNAME - Added dark mode text color */}
                <p className='text-sm text-gray-500 dark:text-gray-400'>@{u.username}</p>
              </div>
              {/* ADD BUTTON - Already has good styling */}
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