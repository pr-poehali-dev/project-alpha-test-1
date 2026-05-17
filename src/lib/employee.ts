export const STORAGE_KEY = 'anketa_answers'
export const STORAGE_SUBMITTED_KEY = 'anketa_submitted'
export const STORAGE_CODE_KEY = 'anketa_employee_code'

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'З1-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function getEmployeeCode(): string | null {
  return localStorage.getItem(STORAGE_CODE_KEY)
}

export function getAnswers(): Record<string, string> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function isSubmitted(): boolean {
  return localStorage.getItem(STORAGE_SUBMITTED_KEY) === 'true'
}
