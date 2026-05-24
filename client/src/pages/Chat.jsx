import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/chat/MessageBubble';

export default function Chat() {
  const { type, id } = useParams(); // type = 'dm' | 'group'
  const { user } = useAuth();
  const socket = useSocket();
  const { dmMessages, groupMessages } = useChat();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  // Determine messages to show
  const messages = type === 'group'
    ? (groupMessages[id] || [])
    : Object.entries(dmMessages).find(([k]) => k.includes(id))?.[1] || [];

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

  const send = () => {
    if (!text.trim() || !socket) return;
    if (type === 'group') {
      socket.emit('send_group_msg', { groupId: id, content: text.trim() });
    } else {
      socket.emit('send_dm', { toUserId: id, content: text.trim() });
    }
    setText('');
  };

  useEffect(() => {
    // Block right-click context menu
    const blockCtx = e => e.preventDefault();
    document.addEventListener('contextmenu', blockCtx);

    // Block common print/screenshot keyboard shortcuts
    const blockKeys = e => {
        // PrintScreen, Ctrl+P, Ctrl+Shift+S, Cmd+Shift+3/4
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

  return (
    <div className='no-screenshot flex flex-col h-screen bg-gray-50'
      onContextMenu={e => e.preventDefault()}>
      {/* Header */}
      <div className='bg-primary text-white px-4 py-3 flex items-center gap-3'>
        <ArrowLeft className='cursor-pointer' onClick={() => navigate('/people')} />
        <span className='font-bold'>{type === 'group' ? 'Group Chat' : 'Chat'}</span>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-3 space-y-2'>
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} isOwn={m.from === user._id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className='border-t bg-white px-4 py-3 flex gap-2'>
        <input
          className='flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
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