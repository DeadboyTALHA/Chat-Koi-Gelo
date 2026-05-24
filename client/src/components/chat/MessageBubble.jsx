export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
        isOwn ? 'bg-accent text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border'
      }`}>
        {!isOwn && (
          <p className='text-xs font-semibold text-accent mb-1'>@{message.from}</p>
        )}
        <p>{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}