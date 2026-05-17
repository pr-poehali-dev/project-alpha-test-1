import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Icon from '@/components/ui/icon'
import { adminLogin } from '@/lib/admin'
import { Squares } from '@/components/landing/squares-background'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {
    if (adminLogin(password)) {
      navigate('/admin', { replace: true })
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="h-screen bg-black relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Squares direction="diagonal" speed={0.3} squareSize={40} borderColor="#1a1a1a" hoverFillColor="#111" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#FF4D00]/10 border border-[#FF4D00]/30 flex items-center justify-center mb-4">
            <Icon name="Lock" size={24} className="text-[#FF4D00]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center">Панель администратора</h1>
          <p className="text-neutral-500 text-sm mt-1 text-center">Колония «Заря-1»</p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль администратора"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              onKeyDown={handleKeyDown}
              className={`bg-white/5 border text-white placeholder:text-neutral-600 focus:ring-0 pr-10 transition-colors ${
                error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#FF4D00]'
              }`}
            />
            <button
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              Неверный пароль. Попробуйте ещё раз.
            </motion.p>
          )}

          <Button
            onClick={handleLogin}
            disabled={!password.trim()}
            className="w-full bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 h-11"
          >
            Войти
          </Button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-sm text-neutral-600 hover:text-neutral-400 transition-colors py-1"
          >
            ← На главную
          </button>
        </div>
      </motion.div>
    </div>
  )
}
