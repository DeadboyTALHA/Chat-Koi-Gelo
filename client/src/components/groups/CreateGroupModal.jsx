import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreateGroupModal({ people, onClose }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const create = async () => {
    if (!name.trim() || selected.length < 1)
      return toast.error('Enter a name and select at least 1 person');
    try {
      await api.post('/groups', { name, memberIds: selected });
      toast.success('Group created!');
      onClose();
    } catch { toast.error('Failed to create group'); }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4'>
      <div className='bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-bold text-lg text-primary'>Create Group</h3>
          <X className='cursor-pointer' onClick={onClose} />
        </div>
        <input className='w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-accent'
          placeholder='Group name...' value={name} onChange={e => setName(e.target.value)} />
        <p className='text-sm font-medium text-gray-600 mb-2'>Select members:</p>
        <div className='space-y-2 max-h-48 overflow-y-auto mb-4'>
          {people.map(p => (
            <label key={p._id} className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg'>
              <input type='checkbox' checked={selected.includes(p._id)} onChange={() => toggle(p._id)} />
              <span>{p.fullName} <span className='text-gray-400'>@{p.username}</span></span>
            </label>
          ))}
        </div>
        <button onClick={create} className='w-full bg-accent text-white py-2 rounded-lg font-bold hover:bg-primary transition-colors'>
          Create Group
        </button>
      </div>
    </div>
  );
}