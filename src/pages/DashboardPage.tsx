import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Icon from '@/components/ui/icon'
import { getAnswers, getEmployeeCode } from '@/lib/employee'

const QUESTIONS_LABELS: Record<string, string> = {
  name: 'ФИО',
  age: 'Возраст, пол, рост, вес',
  nationality: 'Национальность',
  character: 'Характер',
  skills: 'Профессиональные навыки',
  occupation: 'Род деятельности',
  workplace: 'Место работы',
  biography: 'Биография',
  baggage: 'Багаж',
}

type Tab = 'anketa' | 'chat' | 'requests'

interface Message {
  id: number
  author: string
  text: string
  time: string
  isMe?: boolean
}

const CHAT_STORAGE_KEY = 'colony_chat_messages'
const REQUESTS_STORAGE_KEY = 'colony_requests_messages'

function getTime() {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('anketa')
  const answers = getAnswers() || {}
  const code = getEmployeeCode() || ''
  const employeeName = answers['name'] || 'Сотрудник'

  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : [
        { id: 1, author: 'Система', text: 'Добро пожаловать в общий чат колонии «Заря-1». Соблюдайте порядок.', time: '09:00', isMe: false },
      ]
    } catch { return [] }
  })

  const [requestMessages, setRequestMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(REQUESTS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : [
        { id: 1, author: 'Руководство', text: 'Канал запросов активен. Ваши обращения рассматриваются в течение 24 часов.', time: '09:00', isMe: false },
      ]
    } catch { return [] }
  })

  const [chatInput, setChatInput] = useState('')
  const [requestInput, setRequestInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const reqEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, activeTab])

  useEffect(() => {
    reqEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [requestMessages, activeTab])

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg: Message = { id: Date.now(), author: employeeName, text: chatInput.trim(), time: getTime(), isMe: true }
    const updated = [...chatMessages, msg]
    setChatMessages(updated)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
    setChatInput('')
  }

  const sendRequest = () => {
    if (!requestInput.trim()) return
    const msg: Message = { id: Date.now(), author: employeeName, text: requestInput.trim(), time: getTime(), isMe: true }
    const updated = [...requestMessages, msg]
    setRequestMessages(updated)
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated))
    setRequestInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fn() }
  }

  const tabs = [
    { id: 'anketa' as Tab, label: 'Моё досье', icon: 'FileText' },
    { id: 'chat' as Tab, label: 'Чат', icon: 'MessageCircle' },
    { id: 'requests' as Tab, label: 'Запросы', icon: 'Send' },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="Shield" size={20} className="text-[#FF4D00]" />
          <div>
            <span className="font-semibold tracking-tight">Колония «Заря-1»</span>
            <span className="ml-3 text-xs text-neutral-500 font-mono">{code}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Icon name="User" size={14} />
          <span>{employeeName}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10 px-6 flex gap-1 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#FF4D00] text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">

        {/* Anketa Tab */}
        {activeTab === 'anketa' && (
          <div className="h-full overflow-y-auto px-6 py-8 md:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Моя анкета</h2>
                <p className="mt-1 text-neutral-500 text-sm">Анкета отправлена на проверку. Редактирование недоступно.</p>
              </div>
              {Object.entries(QUESTIONS_LABELS).map(([id, label], i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</label>
                  <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 min-h-[38px]">
                    {answers[id] || <span className="text-neutral-600 italic">Не заполнено</span>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {chatMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-neutral-500 mb-1 px-1">
                    {msg.author} · {msg.time}
                  </span>
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.isMe ? 'bg-[#FF4D00] text-white rounded-br-sm' : 'bg-white/10 text-neutral-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-white/10 px-6 py-3 flex gap-2 flex-shrink-0">
              <Input
                placeholder="Написать в общий чат..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => handleKeyDown(e, sendChat)}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#FF4D00] focus:ring-0"
              />
              <Button
                size="icon"
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 flex-shrink-0"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
              <p className="text-sm text-neutral-400">Канал для обращений к руководству колонии «Заря-1». Запросы рассматриваются в течение 24 часов.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {requestMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-neutral-500 mb-1 px-1">
                    {msg.author} · {msg.time}
                  </span>
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.isMe ? 'bg-[#FF4D00] text-white rounded-br-sm' : 'bg-white/10 text-neutral-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={reqEndRef} />
            </div>
            <div className="border-t border-white/10 px-6 py-3 flex gap-2 flex-shrink-0">
              <Textarea
                placeholder="Написать запрос руководству..."
                value={requestInput}
                onChange={e => setRequestInput(e.target.value)}
                onKeyDown={e => handleKeyDown(e, sendRequest)}
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#FF4D00] focus:ring-0 resize-none"
              />
              <Button
                size="icon"
                onClick={sendRequest}
                disabled={!requestInput.trim()}
                className="bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 flex-shrink-0 self-end"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}