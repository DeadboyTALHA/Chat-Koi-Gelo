import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import api from '../api/axios';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const { setNotifications } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications').then(r => {
      setNotifs(r.data);
      setNotifications(0);
    });
  }, []);

  const respond = async (notifId, action) => {
    try {
      await api.post('/notifications/respond', { notifId, action });
      setNotifs(prev => prev.filter(n => n._id !== notifId));
      toast.success(action === 'accept' ? 'Added!' : 'Rejected');
    } catch { toast.error('Something went wrong'); }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-primary text-white px-4 py-3 flex items-center gap-3'>
        <ArrowLeft className='cursor-pointer' onClick={() => navigate('/people')} />
        <span className='font-bold'>Notifications</span>
      </div>
      <div className='max-w-lg mx-auto mt-4 space-y-3 px-3'>
        {notifs.length === 0 && (
          <p className='text-center text-gray-400 mt-10'>No new notifications</p>
        )}
        {notifs.map(n => (
          <div key={n._id} className='bg-white rounded-xl shadow p-4 flex items-center justify-between'>
            <div>
              <p className='font-semibold'>{n.from.fullName}</p>
              <p className='text-sm text-gray-500'>@{n.from.username} wants to add you</p>
            </div>
            <div className='flex gap-2'>
              <button onClick={() => respond(n._id, 'accept')}
                className='bg-green-500 text-white p-2 rounded-full hover:bg-green-600'>
                <Check size={16} />
              </button>
              <button onClick={() => respond(n._id, 'reject')}
                className='bg-red-500 text-white p-2 rounded-full hover:bg-red-600'>
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}