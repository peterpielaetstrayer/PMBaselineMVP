import Link from "next/link"

export default function CheckInResultNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-navy-text">Result not found</h1>
      <p className="mt-3 text-sm text-navy-text/70">
        This check-in may have been removed or belongs to another account.
      </p>
      <Link
        href="/today"
        className="mt-6 inline-block text-sm font-medium text-ocean-deep hover:underline"
      >
        Return to today
      </Link>
    </div>
  )
}
