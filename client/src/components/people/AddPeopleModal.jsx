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
      <div className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-bold text-lg text-primary'>Add People</h3>
          <X className='cursor-pointer' onClick={onClose} />
        </div>
        <div className='flex gap-2 mb-4'>
          <input className='flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
            placeholder='Search by username...'
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()} />
          <button onClick={search} className='bg-accent text-white px-4 rounded-lg'>Go</button>
        </div>
        <div className='space-y-2 max-h-60 overflow-y-auto'>
          {results.map(u => (
            <div key={u._id} className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'>
              <div>
                <p className='font-medium'>{u.fullName}</p>
                <p className='text-sm text-gray-500'>@{u.username}</p>
              </div>
              <button onClick={() => sendReq(u._id)}
                className='bg-accent text-white text-sm px-3 py-1 rounded-full'>Add</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}