"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BASELINE_ROUTES } from "@/lib/baseline/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export interface AuthFormProps {
  /** Override default navigation to /today after authentication. */
  onAuthenticated?: () => void
  /** Show message when user arrives from email confirmation link. */
  emailConfirmed?: boolean
  title?: string
  subtitle?: string
}

export function AuthForm({
  onAuthenticated,
  emailConfirmed = false,
  title = "PMBaseline",
  subtitle = "Sign in to choose the right next move for today.",
}: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null)

  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const completeAuthentication = () => {
    if (onAuthenticated) {
      onAuthenticated()
      return
    }

    router.replace(BASELINE_ROUTES.today)
    router.refresh()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back",
          description: "You're signed in.",
        })
        completeAuthentication()
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (!email || !password || !name || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await signUp(email, password, name)
      if (!result.ok) {
        toast({
          title: "Sign up failed",
          description: result.error.message,
          variant: "destructive",
        })
        return
      }

      if (result.status === "confirmation_required") {
        setPendingConfirmationEmail(result.email)
        return
      }

      toast({
        title: "Welcome to PMBaseline",
        description: "Your account is ready.",
      })
      completeAuthentication()
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (pendingConfirmationEmail) {
    return (
      <Card className="max-w-md w-full p-8 wave-shadow">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-navy-text">Check your email</h1>
          <p className="text-navy-text/70">
            We sent a confirmation link to{" "}
            <span className="font-medium text-navy-text">
              {pendingConfirmationEmail}
            </span>
            . Confirm your email, then sign in to continue.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setPendingConfirmationEmail(null)
              setActiveTab("signin")
            }}
          >
            Back to sign in
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="max-w-md w-full p-8 wave-shadow">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-navy-text mb-2">{title}</h1>
        <p className="text-navy-text/70">{subtitle}</p>
        {emailConfirmed ? (
          <p className="mt-4 rounded-md border border-ocean-light bg-ocean-light/20 px-3 py-2 text-sm text-navy-text">
            Email confirmed — sign in to continue.
          </p>
        ) : null}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <Input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
