"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function NewSessionButton() {
    const router = useRouter()

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <Button
                size="lg"
                className="rounded-full shadow-lg h-14 w-14 p-0 pointer-events-auto hover:scale-105 transition-transform"
                onClick={() => router.push('/session/new')}
            >
                <Plus className="h-6 w-6" />
                <span className="sr-only">New Session</span>
            </Button>
        </div>
    )
}
