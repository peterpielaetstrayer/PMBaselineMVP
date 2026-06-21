interface FormErrorBannerProps {
  message: string
}

export function FormErrorBanner({ message }: FormErrorBannerProps) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  )
}
