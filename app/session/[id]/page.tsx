"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Car, MapPin, Clock, Calendar, ArrowLeft, CheckCircle } from "lucide-react"
import { formatRelativeDate, formatDuration } from "@/lib/format"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"

interface SessionDetails {
    id: string;
    status: string;
    start_time: string;
    end_time: string;
    actual_end_time: string | null;
    photo_url: string;
    car: {
        license_plate: string;
        id: string;
    };
    location: {
        name: string;
        id: string | null;
        coords: [number, number] | null;
    };
    manual_max_stay_mins: number | null;
}

export default function SessionDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [session, setSession] = useState<SessionDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [completing, setCompleting] = useState(false)

    useEffect(() => {
        if (!id) return

        const fetchSession = async () => {
            try {
                const data = await api.get<SessionDetails>(`/api/private/session/${id}`)
                setSession(data)
            } catch (err: any) {
                console.error("Failed to fetch session:", err)
                setError("Failed to load session details")
            } finally {
                setLoading(false)
            }
        }

        fetchSession()
    }, [id])

    const handleComplete = async () => {
        setCompleting(true)
        try {
            await api.post(`/api/private/session/${id}/complete`)
            // Refresh local state or re-fetch
            const updated = await api.get<SessionDetails>(`/api/private/session/${id}`)
            setSession(updated)
        } catch (err) {
            console.error("Failed to complete", err)
            // Show toast or alert
        } finally {
            setCompleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !session) {
        return (
            <div className="container max-w-md mx-auto py-8 px-4">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "Session not found"}</AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        )
    }

    const isActive = session.status.toLowerCase() === "active"
    const durationMins = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000
    // If we have manual_max_stay_mins, use that, otherwise calc from dates (handles location-based too)

    return (
        <div className="container max-w-md mx-auto py-6 space-y-6 pb-24 px-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Session Details</h1>
            </div>

            <Card className="overflow-hidden">
                <div className="relative aspect-video w-full bg-muted">
                    {/* Use standard img for now to avoid next/image domain config issues if any, or use configured loader */}
                    <img
                        src={session.photo_url}
                        alt="Proof of parking"
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm
                            ${isActive
                                ? "bg-primary text-primary-foreground animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}>
                            {session.status}
                        </span>
                    </div>
                </div>

                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        {session.car.license_plate}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {session.location.name}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Start
                            </span>
                            <p className="font-medium">
                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatRelativeDate(session.start_time)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> End
                            </span>
                            <p className="font-medium">
                                {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatRelativeDate(session.end_time)}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">{formatDuration(durationMins)}</span>
                        </div>
                        {session.actual_end_time && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 p-2 rounded">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                Ended manually on {new Date(session.actual_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                </CardContent>

                {isActive && (
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant="default"
                            size="lg"
                            onClick={handleComplete}
                            disabled={completing}
                        >
                            {completing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Finish Session
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
