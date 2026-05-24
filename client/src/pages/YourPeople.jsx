import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import AddPeopleModal from '../components/people/AddPeopleModal';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import PeopleCard from '../components/people/PeopleCard';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function YourPeople() {
  const { user, logout } = useAuth();
  const { notifications } = useChat();
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const fetchData = async () => {
    const [pRes, gRes] = await Promise.all([api.get('/people'), api.get('/groups')]);
    setPeople(pRes.data);
    setGroups(gRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Topbar */}
      <div className='bg-primary text-white px-4 py-3 flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Your People</h1>
        <div className='flex gap-3 items-center'>
          <button onClick={() => navigate('/notifications')} className='relative'>
            <Bell size={22} />
            {notifications > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                {notifications}
              </span>
            )}
          </button>
          <button onClick={() => setShowAdd(true)}><UserPlus size={22} /></button>
          <button onClick={() => setShowGroup(true)}><Users size={22} /></button>
          <button onClick={toggleDarkMode} className='text-white'>
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button 
            onClick={handleLogout} 
            className='text-sm bg-white dark:bg-gray-700 text-primary dark:text-white px-3 py-1 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className='max-w-lg mx-auto mt-4 space-y-2 px-3'>
        {groups.map(g => (
          <PeopleCard key={g._id} name={g.name} sub={`${g.members.length} members`}
            onClick={() => navigate(`/chat/group/${g._id}`)} isGroup />
        ))}
        {people.map(p => (
          <PeopleCard key={p._id} name={p.fullName} sub={`@${p.username}`}
            onClick={() => navigate(`/chat/dm/${p._id}`)} />
        ))}
        {people.length === 0 && groups.length === 0 && (
          <p className='text-center text-gray-400 mt-10'>No people yet. Add someone to get started!</p>
        )}
      </div>

      {showAdd && <AddPeopleModal onClose={() => setShowAdd(false)} />}
      {showGroup && <CreateGroupModal people={people} onClose={() => { setShowGroup(false); fetchData(); }} />}
    </div>
  );
}