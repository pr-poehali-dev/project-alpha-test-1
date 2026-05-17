export const ADMIN_PASSWORD = 'zarya-1-admin'
export const ADMIN_SESSION_KEY = 'admin_session'
export const EMPLOYEES_STORAGE_KEY = 'colony_employees'

export interface Employee {
  code: string
  name: string
  answers: Record<string, string>
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
}

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    return true
  }
  return false
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

export function getEmployees(): Employee[] {
  try {
    const saved = localStorage.getItem(EMPLOYEES_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees))
}

export function registerEmployee(code: string, answers: Record<string, string>): void {
  const employees = getEmployees()
  const existing = employees.find(e => e.code === code)
  if (!existing) {
    employees.push({
      code,
      name: answers['name'] || 'Без имени',
      answers,
      status: 'pending',
      submittedAt: new Date().toLocaleString('ru-RU'),
    })
    saveEmployees(employees)
  }
}

export function updateEmployeeStatus(code: string, status: Employee['status']): void {
  const employees = getEmployees()
  const idx = employees.findIndex(e => e.code === code)
  if (idx !== -1) {
    employees[idx].status = status
    saveEmployees(employees)
  }
}
