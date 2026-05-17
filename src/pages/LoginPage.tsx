import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Icon from '@/components/ui/icon'
import { getEmployeeCode } from '@/lib/employee'
import { Squares } from '@/components/landing/squares-background'

export default function LoginPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = () => {
    const saved = getEmployeeCode()
    if (saved && code.trim().toUpperCase() === saved.toUpperCase()) {
      navigate('/dashboard', { replace: true })
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
        <Squares direction="diagonal" speed={0.5} squareSize={40} borderColor="#333" hoverFillColor="#222" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <Icon name="Shield" size={40} className="text-[#FF4D00] mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight text-center">Колония «Заря-1»</h1>
          <p className="text-neutral-500 text-sm mt-1 text-center">Введите ваш код доступа</p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Например: З1-AB3X7K"
            value={code}
            onChange={e => { setCode(e.target.value); setError(false) }}
            onKeyDown={handleKeyDown}
            className={`bg-white/5 border text-white placeholder:text-neutral-600 focus:ring-0 text-center font-mono text-lg tracking-widest h-12 transition-colors ${
              error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#FF4D00]'
            }`}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              Код не найден. Проверьте правильность ввода.
            </motion.p>
          )}
          <Button
            onClick={handleLogin}
            disabled={!code.trim()}
            className="w-full bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 h-12 text-base"
          >
            Войти
          </Button>
          <button
            onClick={() => navigate('/anketa')}
            className="w-full text-sm text-neutral-500 hover:text-neutral-300 transition-colors py-1"
          >
            Нет кода? Заполнить анкету →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
