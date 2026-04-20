import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#060C16]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto max-w-full min-w-0">
        {children}
      </main>
    </div>
  )
}
