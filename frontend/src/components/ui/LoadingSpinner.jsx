export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center h-40 gap-3 text-slate-600 text-sm">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-[#1A2540]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <span>{message}</span>
    </div>
  )
}
