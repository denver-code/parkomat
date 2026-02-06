"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"

interface RemainingTimerProps {
    endTime: string;
}

export function RemainingTimer({ endTime }: RemainingTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [isOverdue, setIsOverdue] = useState(false)

    useEffect(() => {
        const calculateTime = () => {
            const end = new Date(endTime).getTime()
            const now = new Date().getTime()
            const diff = end - now

            if (diff <= 0) {
                // Overdue
                const overdueDiff = Math.abs(diff)
                const hours = Math.floor(overdueDiff / (1000 * 60 * 60))
                const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60))

                setTimeLeft(`Overdue by ${hours}h ${minutes}m`)
                setIsOverdue(true)
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            let text = ""
            if (days > 0) text += `${days}d `
            text += `${hours}h ${minutes}m ${seconds}s`

            setTimeLeft(text)
            setIsOverdue(false)
        }

        // Calculate immediately
        calculateTime()

        // Update every second
        const interval = setInterval(calculateTime, 1000)

        return () => clearInterval(interval)
    }, [endTime])

    // Wait for client-side hydration to avoid mismatch
    if (!timeLeft) return <span className="text-muted-foreground">Calculating...</span>

    return (
        <div className={`flex items-center gap-2 text-sm font-medium ${isOverdue ? "text-destructive" : "text-primary"}`}>
            <Timer className="h-4 w-4" />
            <span>{isOverdue ? "Expired: " : "Remaining: "}{timeLeft}</span>
        </div>
    )
}
