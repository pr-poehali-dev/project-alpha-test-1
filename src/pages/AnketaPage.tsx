import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'

const QUESTIONS = [
  { id: 'name', label: 'ФИО', placeholder: 'Иванов Иван Иванович', type: 'input' },
  { id: 'age', label: 'Возраст, пол, рост, вес', placeholder: 'Например: 28 лет, мужской, 180 см, 75 кг', type: 'input' },
  { id: 'nationality', label: 'Национальность', placeholder: 'Укажите вашу национальность', type: 'input' },
  { id: 'character', label: 'Характер', placeholder: 'Опишите ваш характер, темперамент, особенности личности...', type: 'textarea' },
  { id: 'occupation', label: 'Род деятельности', placeholder: 'Чем занимаетесь? Профессия, сфера работы...', type: 'textarea' },
  { id: 'biography', label: 'Биография', placeholder: 'Расскажите о себе: откуда вы, как прошли ваши годы, ключевые события жизни...', type: 'textarea' },
]

interface Message {
  id: number
  author: 'reviewer' | 'applicant'
  text: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    author: 'reviewer',
    text: 'Здравствуйте! Я ваш проверяющий. Заполняйте анкету — я буду рядом, если появятся вопросы.',
    time: '10:00',
  },
]

export default function AnketaPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages(prev => [
      ...prev,
      { id: Date.now(), author: 'applicant', text: newMessage.trim(), time },
    ])
    setNewMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filledCount = Object.values(answers).filter(v => v.trim()).length
  const progress = Math.round((filledCount / QUESTIONS.length) * 100)

  const handleSubmit = () => {
    setSubmitted(true)
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        author: 'applicant',
        text: 'Анкета отправлена на проверку.',
        time,
      },
    ])
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="FileText" size={20} className="text-[#FF4D00]" />
          <span className="font-semibold text-lg tracking-tight">Анкета кандидата</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">Заполнено: {filledCount}/{QUESTIONS.length}</span>
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FF4D00] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-sm text-[#FF4D00] font-medium">{progress}%</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Anketa */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Заполните анкету</h1>
              <p className="mt-2 text-neutral-400">Ответьте на все вопросы — проверяющий будет видеть ваши ответы в реальном времени.</p>
            </div>

            {QUESTIONS.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-xs flex items-center justify-center text-neutral-400">
                    {i + 1}
                  </span>
                  {q.label}
                  {answers[q.id]?.trim() && (
                    <Icon name="CheckCircle" size={14} className="text-[#FF4D00] ml-auto" />
                  )}
                </label>
                {q.type === 'input' ? (
                  <Input
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#FF4D00] focus:ring-0 transition-colors"
                  />
                ) : (
                  <Textarea
                    placeholder={q.placeholder}
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                    rows={3}
                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#FF4D00] focus:ring-0 transition-colors resize-none"
                  />
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              {submitted ? (
                <div className="flex items-center gap-2 text-[#FF4D00]">
                  <Icon name="CheckCircle" size={18} />
                  <span className="font-medium">Анкета отправлена на проверку</span>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={filledCount === 0}
                  className="bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 px-8"
                  size="lg"
                >
                  Отправить анкету
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="w-px bg-white/10 flex-shrink-0" />

        {/* Chat */}
        <div className="w-80 lg:w-96 flex flex-col flex-shrink-0">
          <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 flex-shrink-0">
            <Icon name="MessageCircle" size={16} className="text-[#FF4D00]" />
            <span className="font-medium text-sm">Чат с проверяющим</span>
            <Badge variant="outline" className="ml-auto text-xs text-green-400 border-green-400/30 bg-green-400/5">
              Онлайн
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col ${msg.author === 'applicant' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-neutral-500 mb-1 px-1">
                  {msg.author === 'reviewer' ? 'Проверяющий' : 'Вы'} · {msg.time}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.author === 'applicant'
                      ? 'bg-[#FF4D00] text-white rounded-br-sm'
                      : 'bg-white/10 text-neutral-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-white/10 px-4 py-3 flex gap-2 flex-shrink-0">
            <Input
              placeholder="Написать сообщение..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#FF4D00] focus:ring-0 text-sm"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 flex-shrink-0"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}