import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent text-white px-4'>
      <h1 className='text-5xl font-bold mb-4 text-center'>Vanish Chat</h1>
      <p className='text-xl text-center max-w-md mb-10'>
        Chat with your friends, family and your closed ones safely and securely.
      </p>
      <button
        onClick={() => navigate('/register')}
        className='bg-white text-accent font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all'
      >
        Let's Start
      </button>
      <p className='mt-6 text-sm'>
        Already registered?{' '}
        <span className='underline cursor-pointer' onClick={() => navigate('/login')}>Log in</span>
      </p>
    </div>
  );
}