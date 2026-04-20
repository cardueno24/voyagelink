import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      login(data.access_token)
      navigate('/')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex bg-[#060C16]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 relative overflow-hidden border-r border-[#0D1525]">
        {/* Background layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/[0.06] blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-violet-600/[0.05] blur-[60px]" />
          {/* Dot grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #1E2D4A 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.4,
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Anchor size={17} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">VoyageLink</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-[0.2em] mb-4">AI-Native Platform</p>
          <h2 className="text-[2.4rem] font-bold text-white leading-[1.15] tracking-tight mb-5">
            The operating system<br />for your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              supply chain
            </span>
          </h2>
          <p className="text-[#334155] text-base leading-relaxed max-w-xs">
            Track shipments, manage inventory, and forecast demand with AI-powered insights in real time.
          </p>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '15K+', label: 'Containers tracked' },
              { value: '80%', label: 'Less D&D costs' },
              { value: '60+', label: 'Countries' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-[#0D1525] border border-[#1A2540] rounded-xl p-4">
                <p className="text-xl font-bold text-white font-mono tabular-nums">{value}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[#162030] text-xs">© 2025 VoyageLink · Supply Chain AI</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Anchor size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">VoyageLink</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-600 text-sm mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all"
                  value={form.username}
                  onChange={set('username')}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="password"
                  className="w-full bg-[#0D1525] border border-[#1E2D4A] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/60 transition-all"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.username || !form.password}
              className="bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] mt-1 cursor-pointer"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
