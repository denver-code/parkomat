import { ActiveSessionsList } from "@/components/dashboard/active-sessions-list"
import { NewSessionButton } from "@/components/dashboard/new-session-button"

export default function Page() {
  return (
    <div className="container max-w-md mx-auto py-6 space-y-8 pb-24 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back.</p>
      </div>

      <ActiveSessionsList />

      <NewSessionButton />
    </div>
  )
}