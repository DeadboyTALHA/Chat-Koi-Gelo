import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreateGroupModal({ people, onClose }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const create = async () => {
    if (!name.trim() || selected.length < 1) {
      toast.error('Enter a name and select at least 1 person');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/groups', { name, memberIds: selected });
      toast.success('Group created!');
      onClose();
    } catch (err) { 
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-bold text-lg text-primary dark:text-primary'>Create Group</h3>
          <X className='cursor-pointer dark:text-gray-400 dark:hover:text-white' onClick={onClose} />
        </div>
        
        <input 
          className='w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
          placeholder='Group name...' 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        
        <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>Select members:</p>
        
        <div className='space-y-2 max-h-48 overflow-y-auto mb-4'>
          {people.map(p => (
            <label key={p._id} className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg'>
              <input type='checkbox' checked={selected.includes(p._id)} onChange={() => toggle(p._id)} />
              <span className='dark:text-white'>{p.fullName} <span className='text-gray-400 dark:text-gray-500'>@{p.username}</span></span>
            </label>
          ))}
        </div>
        
        <button 
          onClick={create} 
          disabled={loading}
          className='w-full bg-accent text-white py-2 rounded-lg font-bold hover:bg-primary transition-colors disabled:opacity-50'
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}