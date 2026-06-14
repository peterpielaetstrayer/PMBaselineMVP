import { z } from 'zod'

export const ActionErrorCodeSchema = z.enum([
  'NOT_AUTHENTICATED',
  'AUTH_ERROR',
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'FORBIDDEN',
  'DATABASE_ERROR',
  'RPC_ERROR',
  'NOT_CONFIGURED',
])

export type ActionErrorCode = z.infer<typeof ActionErrorCodeSchema>

export interface ActionError {
  code: ActionErrorCode
  message: string
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError }

export function actionError(
  code: ActionErrorCode,
  message: string
): { ok: false; error: ActionError } {
  return { ok: false, error: { code, message } }
}

export function actionSuccess<T>(data: T): { ok: true; data: T } {
  return { ok: true, data }
}

/** Maps DAL error codes to action error codes. */
export function fromDataError(error: {
  code: string
  message: string
}): ActionError {
  switch (error.code) {
    case 'NOT_AUTHENTICATED':
    case 'AUTH_ERROR':
    case 'VALIDATION_ERROR':
    case 'NOT_FOUND':
    case 'DATABASE_ERROR':
    case 'NOT_CONFIGURED':
    case 'RPC_ERROR':
    case 'FORBIDDEN':
      return { code: error.code as ActionErrorCode, message: error.message }
    default:
      return { code: 'DATABASE_ERROR', message: error.message }
  }
}
