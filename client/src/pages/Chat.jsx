import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/chat/MessageBubble';
import api from '../api/axios';

export default function Chat() {
  const { type, id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const { dmMessages, groupMessages } = useChat();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const [chatName, setChatName] = useState('');
  const [userMap, setUserMap] = useState({});

  // Fetch chat partner's name for DM
  useEffect(() => {
    if (type === 'dm' && id) {
      api.get(`/people`)
        .then(res => {
          const person = res.data.find(p => p._id === id);
          if (person) {
            setChatName(person.fullName);
          }
        })
        .catch(err => console.error('Error fetching chat partner:', err));
    } else if (type === 'group' && id) {
      api.get(`/groups`)
        .then(res => {
          const group = res.data.find(g => g._id === id);
          if (group) {
            setChatName(group.name);
          }
        })
        .catch(err => console.error('Error fetching group:', err));
    }
  }, [type, id]);

  // Determine messages to show
  const messages = type === 'group'
    ? (groupMessages[id] || [])
    : Object.entries(dmMessages).find(([k]) => k.includes(id))?.[1] || [];

  // Build user map for display names
  useEffect(() => {
    const fetchUsersForMessages = async () => {
      const userIds = [...new Set(messages.map(m => m.from).filter(uid => uid !== user?._id))];
      if (userIds.length === 0) return;
      
      const newMap = { ...userMap };
      let hasNew = false;
      
      for (const uid of userIds) {
        if (!newMap[uid]) {
          try {
            const response = await api.get(`/people`);
            const found = response.data.find(p => p._id === uid);
            if (found) {
              newMap[uid] = found.username;
              hasNew = true;
            }
          } catch (err) {
            console.error('Error fetching user:', err);
          }
        }
      }
      
      if (hasNew) {
        setUserMap(newMap);
      }
    };
    
    if (messages.length > 0) {
      fetchUsersForMessages();
    }
  }, [messages, user?._id]);

  useEffect(() => {
    if (!socket) return;
    if (type === 'group') {
      socket.emit('join_group', id);
    } else {
      socket.emit('get_dm_history', { withUserId: id });
    }
  }, [socket, id, type]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Screenshot prevention
  useEffect(() => {
    const blockCtx = e => e.preventDefault();
    document.addEventListener('contextmenu', blockCtx);

    const blockKeys = e => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.shiftKey && e.key === 's') ||
        (e.metaKey && e.shiftKey && ['3','4','5'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', blockKeys);

    return () => {
      document.removeEventListener('contextmenu', blockCtx);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  const send = () => {
    if (!text.trim() || !socket) return;
    if (type === 'group') {
      socket.emit('send_group_msg', { groupId: id, content: text.trim() });
    } else {
      socket.emit('send_dm', { toUserId: id, content: text.trim() });
    }
    setText('');
  };

  // Function to get display name from message
  const getDisplayName = (message) => {
    if (message.fromUsername) return message.fromUsername;
    if (userMap[message.from]) return userMap[message.from];
    if (message.from === user?._id) return 'You';
    return message.from.substring(0, 8); // Fallback: show first 8 chars of ID
  };

  return (
    <div className='no-screenshot flex flex-col h-screen bg-gray-50 dark:bg-gray-900'
      onContextMenu={e => e.preventDefault()}>
      {/* Header with working back button */}
      <div className='bg-primary text-white px-4 py-3 flex items-center gap-3'>
        <button 
          onClick={() => navigate('/people')}
          className='cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center p-1 rounded hover:bg-white/10'
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <span className='font-bold text-lg'>{chatName || (type === 'group' ? 'Group Chat' : 'Loading...')}</span>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-3 space-y-2'>
        {messages.map((m, i) => (
          <MessageBubble 
            key={i} 
            message={m} 
            isOwn={m.from === user?._id}
            displayName={getDisplayName(m)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='border-t bg-white dark:bg-gray-800 px-4 py-3 flex gap-2'>
        <input
          className='flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
          placeholder='Type a message...'
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send}
          className='bg-accent text-white p-2 rounded-full hover:bg-primary transition-colors'>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}