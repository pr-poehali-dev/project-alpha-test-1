import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Icon from '@/components/ui/icon'
import {
  isAdminLoggedIn, adminLogout, getEmployees, updateEmployeeStatus,
  type Employee, ADMIN_SESSION_KEY
} from '@/lib/admin'

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

const CHAT_STORAGE_KEY = 'colony_chat_messages'
const REQUESTS_STORAGE_KEY = 'colony_requests_messages'

type Tab = 'employees' | 'chat' | 'requests'

interface Message {
  id: number
  author: string
  text: string
  time: string
  isMe?: boolean
}

function getTime() {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

const STATUS_LABELS = {
  pending: { label: 'На проверке', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
  approved: { label: 'Одобрен', color: 'text-green-400 border-green-400/30 bg-green-400/5' },
  rejected: { label: 'Отклонён', color: 'text-red-400 border-red-400/30 bg-red-400/5' },
}

export default function AdminPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate('/admin/login', { replace: true })
  }, [navigate])

  const [activeTab, setActiveTab] = useState<Tab>('employees')
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees())
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [requestMessages, setRequestMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(REQUESTS_STORAGE_KEY) || '[]') } catch { return [] }
  })

  const [chatInput, setChatInput] = useState('')
  const [reqInput, setReqInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const reqEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages, activeTab])
  useEffect(() => { reqEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [requestMessages, activeTab])

  const handleStatusChange = (code: string, status: Employee['status']) => {
    updateEmployeeStatus(code, status)
    const updated = getEmployees()
    setEmployees(updated)
    if (selectedEmployee?.code === code) {
      setSelectedEmployee(updated.find(e => e.code === code) || null)
    }
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg: Message = { id: Date.now(), author: 'Администратор', text: chatInput.trim(), time: getTime(), isMe: true }
    const updated = [...chatMessages, msg]
    setChatMessages(updated)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated))
    setChatInput('')
  }

  const sendReq = () => {
    if (!reqInput.trim()) return
    const msg: Message = { id: Date.now(), author: 'Руководство', text: reqInput.trim(), time: getTime(), isMe: true }
    const updated = [...requestMessages, msg]
    setRequestMessages(updated)
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated))
    setReqInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fn() }
  }

  const handleLogout = () => {
    adminLogout()
    navigate('/')
  }

  const tabs = [
    { id: 'employees' as Tab, label: 'Досье', icon: 'Users' },
    { id: 'chat' as Tab, label: 'Чат', icon: 'MessageCircle' },
    { id: 'requests' as Tab, label: 'Запросы', icon: 'Send' },
  ]

  const counts = {
    pending: employees.filter(e => e.status === 'pending').length,
    approved: employees.filter(e => e.status === 'approved').length,
    rejected: employees.filter(e => e.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="ShieldCheck" size={20} className="text-[#FF4D00]" />
          <span className="font-semibold tracking-tight">Администратор</span>
          <span className="text-neutral-600 text-sm">· Колония «Заря-1»</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-neutral-500 hover:text-white gap-2"
        >
          <Icon name="LogOut" size={14} />
          Выйти
        </Button>
      </header>

      {/* Stats */}
      <div className="border-b border-white/10 px-6 py-3 flex gap-6 flex-shrink-0">
        <span className="text-sm text-neutral-500">Всего: <span className="text-white font-medium">{employees.length}</span></span>
        <span className="text-sm text-yellow-400">На проверке: <span className="font-medium">{counts.pending}</span></span>
        <span className="text-sm text-green-400">Одобрено: <span className="font-medium">{counts.approved}</span></span>
        <span className="text-sm text-red-400">Отклонено: <span className="font-medium">{counts.rejected}</span></span>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-6 flex gap-1 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedEmployee(null) }}
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
      <div className="flex-1 overflow-hidden flex">

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <>
            {/* List */}
            <div className="w-72 border-r border-white/10 overflow-y-auto flex-shrink-0">
              {employees.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 text-sm">
                  <Icon name="Users" size={32} className="mx-auto mb-2 opacity-30" />
                  Анкет пока нет
                </div>
              ) : (
                employees.map((emp, i) => (
                  <motion.button
                    key={emp.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      selectedEmployee?.code === emp.code ? 'bg-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate flex-1">{emp.name}</span>
                      <Badge variant="outline" className={`text-[10px] ml-2 flex-shrink-0 ${STATUS_LABELS[emp.status].color}`}>
                        {STATUS_LABELS[emp.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span className="font-mono">{emp.code}</span>
                      <span>·</span>
                      <span>{emp.submittedAt}</span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {selectedEmployee ? (
                <motion.div
                  key={selectedEmployee.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-sm text-neutral-500">{selectedEmployee.code}</span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-sm text-neutral-500">{selectedEmployee.submittedAt}</span>
                        <Badge variant="outline" className={`text-xs ${STATUS_LABELS[selectedEmployee.status].color}`}>
                          {STATUS_LABELS[selectedEmployee.status].label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Status controls */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedEmployee.code, 'approved')}
                      disabled={selectedEmployee.status === 'approved'}
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 gap-2"
                      variant="ghost"
                    >
                      <Icon name="CheckCircle" size={14} />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedEmployee.code, 'pending')}
                      disabled={selectedEmployee.status === 'pending'}
                      className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 gap-2"
                      variant="ghost"
                    >
                      <Icon name="Clock" size={14} />
                      На проверку
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedEmployee.code, 'rejected')}
                      disabled={selectedEmployee.status === 'rejected'}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 gap-2"
                      variant="ghost"
                    >
                      <Icon name="XCircle" size={14} />
                      Отклонить
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(QUESTIONS_LABELS).map(([id, label]) => (
                      <div key={id} className="space-y-1">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</label>
                        <div className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-200 min-h-[38px] whitespace-pre-wrap">
                          {selectedEmployee.answers[id] || <span className="text-neutral-600 italic">Не заполнено</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-600 text-sm">
                  <div className="text-center">
                    <Icon name="FileText" size={40} className="mx-auto mb-3 opacity-20" />
                    Выберите сотрудника для просмотра досье
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-neutral-600 text-sm text-center pt-8">Чат пуст</p>
              )}
              {chatMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-neutral-500 mb-1 px-1">{msg.author} · {msg.time}</span>
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.isMe ? 'bg-[#FF4D00] text-white rounded-br-sm' : 'bg-white/10 text-neutral-200 rounded-bl-sm'
                  }`}>{msg.text}</div>
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
              <Button size="icon" onClick={sendChat} disabled={!chatInput.trim()}
                className="bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 flex-shrink-0">
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-3 border-b border-white/10 flex-shrink-0">
              <p className="text-sm text-neutral-500">Обращения сотрудников к руководству. Отвечайте прямо здесь.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {requestMessages.length === 0 && (
                <p className="text-neutral-600 text-sm text-center pt-8">Запросов пока нет</p>
              )}
              {requestMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-neutral-500 mb-1 px-1">{msg.author} · {msg.time}</span>
                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.isMe ? 'bg-[#FF4D00] text-white rounded-br-sm' : 'bg-white/10 text-neutral-200 rounded-bl-sm'
                  }`}>{msg.text}</div>
                </motion.div>
              ))}
              <div ref={reqEndRef} />
            </div>
            <div className="border-t border-white/10 px-6 py-3 flex gap-2 flex-shrink-0">
              <Input
                placeholder="Ответить на запрос..."
                value={reqInput}
                onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => handleKeyDown(e, sendReq)}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-[#FF4D00] focus:ring-0"
              />
              <Button size="icon" onClick={sendReq} disabled={!reqInput.trim()}
                className="bg-[#FF4D00] hover:bg-[#e04400] text-white border-0 flex-shrink-0">
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
