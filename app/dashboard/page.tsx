import Link from "next/link"
import { Car, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActiveSessionsList } from "@/components/dashboard/active-sessions-list"
import { NewSessionButton } from "@/components/dashboard/new-session-button"

export default function Page() {
  return (
    <div className="container max-w-md mx-auto py-6 space-y-8 pb-24 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/car">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
            <Car className="h-6 w-6" />
            <span>Cars</span>
          </Button>
        </Link>
        <Link href="/location">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
            <MapPin className="h-6 w-6" />
            <span>Locations</span>
          </Button>
        </Link>
      </div>

      <ActiveSessionsList />

      <NewSessionButton />
    </div>
  )
}