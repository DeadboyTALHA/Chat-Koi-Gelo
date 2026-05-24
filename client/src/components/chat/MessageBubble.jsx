export default function MessageBubble({ message, isOwn, displayName }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
        isOwn ? 'bg-accent text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none border dark:border-gray-700'
      }`}>
        {!isOwn && displayName && (
          <p className='text-xs font-semibold text-accent mb-1'>
            @{displayName}
          </p>
        )}
        <p>{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}