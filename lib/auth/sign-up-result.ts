export interface AuthErrorResult {
  message: string
}

export type SignUpResult =
  | { ok: false; error: AuthErrorResult }
  | { ok: true; status: 'confirmation_required'; email: string }
  | { ok: true; status: 'session_created' }

export function deriveSignUpResult(
  email: string,
  error: AuthErrorResult | null,
  session: { user: unknown } | null | undefined
): SignUpResult {
  if (error) {
    return { ok: false, error: { message: error.message } }
  }

  if (session?.user) {
    return { ok: true, status: 'session_created' }
  }

  return { ok: true, status: 'confirmation_required', email }
}
