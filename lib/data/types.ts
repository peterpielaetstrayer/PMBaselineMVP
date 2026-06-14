export type DataErrorCode =
  | 'NOT_CONFIGURED'
  | 'NOT_AUTHENTICATED'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'DATABASE_ERROR'
  | 'RPC_ERROR'

export interface DataError {
  code: DataErrorCode
  message: string
}

export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: DataError }

export function dataError(
  code: DataErrorCode,
  message: string
): { ok: false; error: DataError } {
  return { ok: false, error: { code, message } }
}
