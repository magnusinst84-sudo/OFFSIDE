/**
 * Disposable & temporary email domain blacklist.
 * Prevents automated account creation with throwaway inboxes.
 */
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'dispostable.com',
  'trashmail.com',
  'trashmail.net',
  'throwawaymail.com',
  'getairmail.com',
  'mohmal.com',
  'fakemailgenerator.com',
  'emailondeck.com',
  'burnermail.io',
  'nada.ltd',
  'getnada.com',
  'crazymailing.com',
  'mytemp.email',
  'generator.email',
  'maildrop.cc',
  'inboxkitten.com',
  'dropmail.me',
  'temp-mail.io',
  'minuteinbox.com',
  'chacuo.net',
  'tempail.com',
  'internxt.com',
  'tmailor.com',
  'disposablemail.com',
  'luxusmail.org',
  'privatemail.com',
])

export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' }
  }

  // Basic RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' }
  }

  const parts = trimmed.split('@')
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email format.' }
  }

  const domain = parts[1]

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not permitted. Please use an official or personal address.',
    }
  }

  return { isValid: true }
}
