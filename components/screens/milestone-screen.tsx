"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AppState, AppScreen, Milestone } from "@/lib/types"
import { storage } from "@/lib/storage"

interface MilestoneScreenProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  navigateToScreen: (screen: AppScreen) => void
}

export function MilestoneScreen({ appState, updateAppState, navigateToScreen }: MilestoneScreenProps) {
  const [step, setStep] = useState<"celebration" | "selection" | "form" | "dashboard">("celebration")
  const [selectedOption, setSelectedOption] = useState<"$50_gift" | "$100_reimbursement" | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    purchaseDescription: "",
    projectUpdate: "",
  })

  const user = appState.user!
  const currentStreak = storage.calculateStreak()
  const milestone = appState.milestone

  // If user already has milestone data, show dashboard
  if (milestone && milestone.funding_tier !== "none" && step === "celebration") {
    setStep("dashboard")
  }

  const handleOptionSelect = (option: "$50_gift" | "$100_reimbursement") => {
    setSelectedOption(option)
    setStep("form")
  }

  const handleFormSubmit = () => {
    if (!selectedOption || !user) return

    const newMilestone: Milestone = {
      user_id: user.id,
      fifty_day_achieved: new Date(),
      funding_tier: "tier1",
      funding_choice: selectedOption,
    }

    // Update user certification status
    const updatedUser = {
      ...user,
      is_certified: true,
    }

    storage.setMilestone(newMilestone)
    storage.setUser(updatedUser)

    updateAppState({
      user: updatedUser,
      milestone: newMilestone,
    })

    setStep("dashboard")
  }

  const renderCelebration = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center wave-shadow">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-success-green/20 to-success-green/40 flex items-center justify-center">
            <svg className="w-12 h-12 text-success-green" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-navy-text mb-4">Congratulations!</h1>
          <p className="text-lg text-navy-text/80 mb-2">You've demonstrated 50 days of consistent alignment</p>
          <p className="text-navy-text/70">You're ready for bigger waves</p>
        </div>

        <div className="bg-gradient-to-r from-ocean-light/20 to-ocean-deep/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-ocean-deep flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{currentStreak}</span>
            </div>
          </div>
          <p className="text-navy-text font-semibold">Certified Readiness Achieved</p>
          <p className="text-sm text-navy-text/60 mt-1">50+ days of consistent baseline alignment</p>
        </div>

        <div className="space-y-4">
          <div className="bg-ocean-light/10 rounded-lg p-4 border border-ocean-light/30">
            <h3 className="font-semibold text-navy-text mb-2">Universal Value Creation</h3>
            <p className="text-sm text-navy-text/70">
              Your consistency demonstrates readiness for growth and contribution. We're excited to support your next
              phase of development.
            </p>
          </div>

          <Button
            onClick={() => setStep("selection")}
            className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white py-3 gentle-transition"
          >
            Explore Opportunities
          </Button>

          <Button
            variant="outline"
            onClick={() => navigateToScreen("home")}
            className="w-full border-ocean-light text-ocean-deep hover:bg-ocean-light/10"
          >
            Continue Journey
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderSelection = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 wave-shadow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-text mb-2">Choose Your Recognition</h1>
          <p className="text-navy-text/70">Select how you'd like to receive support for your achievement</p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            onClick={() => handleOptionSelect("$50_gift")}
            className={`p-6 rounded-lg border-2 cursor-pointer gentle-transition ${
              selectedOption === "$50_gift"
                ? "border-ocean-deep bg-ocean-light/10"
                : "border-gray-200 hover:border-ocean-light"
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-success-green/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-success-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy-text mb-2">$50 Recognition Gift</h3>
                <p className="text-sm text-navy-text/70 mb-2">No strings attached</p>
                <p className="text-sm text-navy-text/60">
                  A simple acknowledgment of your consistency and commitment to personal alignment.
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleOptionSelect("$100_reimbursement")}
            className={`p-6 rounded-lg border-2 cursor-pointer gentle-transition ${
              selectedOption === "$100_reimbursement"
                ? "border-ocean-deep bg-ocean-light/10"
                : "border-gray-200 hover:border-ocean-light"
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-sun-accent/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-navy-text mb-2">$100 Growth Reimbursement</h3>
                <p className="text-sm text-navy-text/70 mb-2">For personal development purchase</p>
                <p className="text-sm text-navy-text/60">
                  Support for books, courses, tools, or experiences that contribute to your continued growth.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep("celebration")}
            className="flex-1 border-ocean-light text-ocean-deep hover:bg-ocean-light/10"
          >
            Back
          </Button>
          <Button
            onClick={() => selectedOption && setStep("form")}
            disabled={!selectedOption}
            className="flex-1 bg-ocean-deep hover:bg-ocean-deep/90 disabled:bg-gray-300 text-white gentle-transition"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderForm = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 wave-shadow">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-text mb-2">Complete Your Information</h1>
          <p className="text-navy-text/70">
            {selectedOption === "$50_gift" ? "We'll send your recognition gift" : "Tell us about your growth purchase"}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-navy-text font-medium mb-2 block">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-navy-text font-medium mb-2 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-navy-text font-medium mb-2 block">
              Mailing Address *
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, city, state, zip code"
              rows={3}
              required
            />
          </div>

          {selectedOption === "$100_reimbursement" && (
            <div>
              <Label htmlFor="purchase" className="text-navy-text font-medium mb-2 block">
                Describe Your Growth Purchase
              </Label>
              <Textarea
                id="purchase"
                value={formData.purchaseDescription}
                onChange={(e) => setFormData({ ...formData, purchaseDescription: e.target.value })}
                placeholder="What book, course, tool, or experience will you invest in?"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-ocean-light/10 rounded-lg p-4 border border-ocean-light/30">
            <p className="text-sm text-navy-text/70">
              Your information is used solely for processing your recognition. We respect your privacy and won't share
              your details.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setStep("selection")}
              className="flex-1 border-ocean-light text-ocean-deep hover:bg-ocean-light/10"
            >
              Back
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={!formData.name || !formData.email || !formData.address}
              className="flex-1 bg-ocean-deep hover:bg-ocean-deep/90 disabled:bg-gray-300 text-white gentle-transition"
            >
              Submit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderDashboard = () => (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-8 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToScreen("home")}
            className="border-ocean-light text-ocean-deep"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-navy-text">UVC Dashboard</h1>
          <div className="w-16"></div>
        </div>

        {/* Certification Status */}
        <Card className="p-6 text-center wave-shadow">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-success-green/20 to-success-green/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-success-green" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-navy-text mb-2">Certified Member</h2>
          <p className="text-navy-text/70 mb-4">Universal Value Creation Tier 1</p>
          <div className="bg-ocean-light/10 rounded-lg p-4">
            <p className="text-sm text-navy-text/70">
              Recognition: {milestone?.funding_choice === "$50_gift" ? "$50 Gift" : "$100 Growth Reimbursement"}
            </p>
            <p className="text-xs text-navy-text/60 mt-1">
              Achieved:{" "}
              {milestone?.fifty_day_achieved ? new Date(milestone.fifty_day_achieved).toLocaleDateString() : ""}
            </p>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-6 wave-shadow">
          <h3 className="text-lg font-semibold text-navy-text mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-navy-text/70">Current Streak</span>
              <span className="font-semibold text-ocean-deep">{currentStreak} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-navy-text/70">Total Check-ins</span>
              <span className="font-semibold text-navy-text">{user.total_checkins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-navy-text/70">Member Since</span>
              <span className="font-semibold text-navy-text">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        {/* Tier 2 Path */}
        <Card className="p-6 wave-shadow">
          <h3 className="text-lg font-semibold text-navy-text mb-4 flex items-center">
            <div className="w-8 h-8 rounded-full bg-sun-accent/30 flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            Path to Tier 2
          </h3>
          <div className="space-y-4">
            <p className="text-navy-text/70">
              Continue your consistent practice to unlock Tier 2 benefits, including $500 seed funding for value
              creation projects.
            </p>
            <div className="bg-ocean-light/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-navy-text/70">Progress to Tier 2</span>
                <span className="text-sm font-medium text-navy-text">{Math.min(currentStreak, 100)}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-sun-accent/70 to-sun-accent h-2 rounded-full gentle-transition"
                  style={{ width: `${Math.min((currentStreak / 100) * 100, 100)}%` }}
                ></div>
              </div>
              {currentStreak < 100 && (
                <p className="text-xs text-navy-text/60 mt-2">{100 - currentStreak} days until Tier 2 eligibility</p>
              )}
            </div>
          </div>
        </Card>

        {/* Project Updates */}
        <Card className="p-6 wave-shadow">
          <h3 className="text-lg font-semibold text-navy-text mb-4">Share Your Journey</h3>
          <div className="space-y-4">
            <Textarea
              value={formData.projectUpdate}
              onChange={(e) => setFormData({ ...formData, projectUpdate: e.target.value })}
              placeholder="Share how your consistent practice is creating value in your life or work..."
              rows={4}
            />
            <Button className="w-full bg-ocean-deep hover:bg-ocean-deep/90 text-white gentle-transition">
              Share Update
            </Button>
          </div>
        </Card>

        {/* Community */}
        <Card className="p-6 wave-shadow">
          <h3 className="text-lg font-semibold text-navy-text mb-4">Community</h3>
          <div className="space-y-3">
            <p className="text-navy-text/70">
              Connect with other certified members who are creating value through consistent practice.
            </p>
            <Button
              variant="outline"
              className="w-full border-ocean-light text-ocean-deep hover:bg-ocean-light/10 bg-transparent"
            >
              Join Community (Coming Soon)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  // Render appropriate step
  if (step === "celebration") return renderCelebration()
  if (step === "selection") return renderSelection()
  if (step === "form") return renderForm()
  if (step === "dashboard") return renderDashboard()

  return null
}
