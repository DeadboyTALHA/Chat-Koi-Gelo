import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import YourPeople from './pages/YourPeople';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to='/people' />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <BrowserRouter>
            <Toaster position='top-right' />
            <Routes>
              <Route path='/' element={<PublicRoute><Home /></PublicRoute>} />
              <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
              <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
              <Route path='/people' element={<PrivateRoute><YourPeople /></PrivateRoute>} />
              <Route path='/chat/:type/:id' element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path='/notifications' element={<PrivateRoute><Notifications /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}