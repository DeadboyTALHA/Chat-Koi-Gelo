import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const socket = useSocket();
  // dmMessages: { [roomId]: Message[] }
  const [dmMessages, setDmMessages] = useState({});
  // groupMessages: { [groupId]: Message[] }
  const [groupMessages, setGroupMessages] = useState({});
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_dm', ({ roomId, message }) => {
      setDmMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message],
      }));
    });

    socket.on('dm_history', ({ withUserId, messages }) => {
      // history comes keyed by the room, reconstruct using sorted pair
      // The server sends withUserId to help reconstruct roomId client-side
      // Tip: you can set it directly if you pass roomId from server
    });

    socket.on('receive_group_msg', ({ groupId, message }) => {
      setGroupMessages(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), message],
      }));
    });

    socket.on('group_history', ({ groupId, messages }) => {
      setGroupMessages(prev => ({ ...prev, [groupId]: messages }));
    });

    socket.on('new_notification', () => {
      setNotifications(n => n + 1);
    });

    return () => {
      socket.off('receive_dm');
      socket.off('dm_history');
      socket.off('receive_group_msg');
      socket.off('group_history');
      socket.off('new_notification');
    };
  }, [socket]);

  return (
    <ChatContext.Provider value={{ dmMessages, groupMessages, notifications, setNotifications }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);