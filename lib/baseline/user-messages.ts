import type { ActionError } from '@/lib/validation/result'

const USER_MESSAGES: Partial<Record<ActionError['code'], string>> = {
  NOT_AUTHENTICATED: 'Please sign in to continue.',
  AUTH_ERROR: 'We could not verify your session. Try signing in again.',
  NOT_FOUND: 'We could not find that record. It may belong to another account.',
  FORBIDDEN: 'That action is not available for this check-in.',
  NOT_CONFIGURED: 'The app is not fully configured yet. Try again later.',
  DATABASE_ERROR: 'Something went wrong saving your data. Please try again.',
  RPC_ERROR: 'Something went wrong submitting your check-in. Please try again.',
  VALIDATION_ERROR: 'Some details look off. Review the form and try again.',
}

const MESSAGE_OVERRIDES: Record<string, string> = {
  'Reflection already exists for this check-in':
    'You already saved a reflection for this check-in.',
  'Action record not found for check-in':
    'Choose a next move on the result page first.',
}

export function formatActionErrorForUser(error: ActionError): string {
  const override = MESSAGE_OVERRIDES[error.message]
  if (override) {
    return override
  }

  return USER_MESSAGES[error.code] ?? USER_MESSAGES.DATABASE_ERROR!
}

export function isDuplicateReflectionError(error: ActionError): boolean {
  return (
    error.code === 'FORBIDDEN' &&
    error.message.includes('Reflection already exists')
  )
}

export function isDuplicateCheckInReplay(error: ActionError): boolean {
  return error.code === 'RPC_ERROR' && error.message.toLowerCase().includes('duplicate')
}
