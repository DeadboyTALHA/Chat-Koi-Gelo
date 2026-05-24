export default function PeopleCard({ name, sub, onClick, isGroup }) {
  return (
    <div onClick={onClick}
      className='bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors'>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${isGroup ? 'bg-green-500' : 'bg-accent'}`}>
        {name[0].toUpperCase()}
      </div>
      <div>
        <p className='font-semibold text-gray-800'>{name}</p>
        <p className='text-sm text-gray-500'>{sub}</p>
      </div>
    </div>
  );
}