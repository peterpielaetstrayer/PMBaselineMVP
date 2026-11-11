import { GuestWorkspace } from "@/components/baseline/guest-workspace"

export const metadata = {
  title: "PMBaseline Guest Mode — Local Workspace",
  robots: { index: false, follow: false },
}

export default function GuestPage() {
  return <GuestWorkspace />
}
