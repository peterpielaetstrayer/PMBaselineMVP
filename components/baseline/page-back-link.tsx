import Link from "next/link"

interface PageBackLinkProps {
  href: string
  label: string
  className?: string
}

export function PageBackLink({ href, label, className = "mb-6" }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center text-sm font-medium text-ocean-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-deep/40 focus-visible:ring-offset-2 rounded-sm ${className}`}
    >
      ← {label}
    </Link>
  )
}
