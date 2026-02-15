"use client"

import { NotificationOverlay } from "@/components/global/notification-overlay"
import { UserProfileMenu } from "@/components/global/user-profile-menu"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-outfit text-primary">IELTS Lover</span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationOverlay />
          <UserProfileMenu />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-5xl font-bold font-outfit tracking-tight">
            Master the IELTS with <span className="text-primary italic">AI</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The ultimate platform for automated scoring, detailed feedback, and personalized learning.
          </p>
        </div>
        <div className="flex gap-4">
          <Button size="lg" className="rounded-full px-8">Get Started</Button>
          <Button size="lg" variant="outline" className="rounded-full px-8">Learn More</Button>
        </div>
      </main>
    </div>
  )
}
