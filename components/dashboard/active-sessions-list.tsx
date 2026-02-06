"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { RemainingTimer } from "./remaining-timer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Car, Clock, MapPin, AlertCircle, Timer } from "lucide-react"
import { formatDuration, formatRelativeDate } from "@/lib/format"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ActiveSession {
    id: string;
    car_id: string;
    parking_location_id?: string;
    start_time: string;
    end_time: string;
    status: string;
    car_details?: {
        license_plate: string;
        photo_filename: string;
    };
    location_details?: {
        name: string;
    };
    manual_max_stay_mins?: number;
}

export function ActiveSessionsList() {
    const router = useRouter()
    const [sessions, setSessions] = useState<ActiveSession[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sessions, cars, and parking locations in parallel
                const [sessionsData, carsData, locationsData] = await Promise.all([
                    api.get<ActiveSession[]>('/api/private/session?status=active'),
                    api.get<{ cars: any[] }>('/api/private/car'),
                    api.get<any[]>('/api/private/parking')
                ])

                // Guard: Ensure sessionsData is an array. If 204 No Content, it might be {}
                const rawSessions = Array.isArray(sessionsData) ? sessionsData : [];
                const rawCars = carsData && Array.isArray(carsData.cars) ? carsData.cars : [];
                const rawLocations = Array.isArray(locationsData) ? locationsData : [];

                // Create maps for quick lookup
                const carMap = new Map(rawCars.map((c: any) => [c.id, c]))
                const locationMap = new Map(rawLocations.map((l: any) => [l.id, l]))

                // Enrich sessions with details and map _id to id
                const enrichedSessions = rawSessions.map((session: any) => ({
                    ...session,
                    id: session._id || session.id, // Handle backend returning _id
                    car_details: carMap.get(session.car_id),
                    location_details: session.parking_location_id ? locationMap.get(session.parking_location_id) : undefined
                }))

                setSessions(enrichedSessions)
            } catch (err) {
                console.error("Failed to fetch sessions:", err)
                // Don't show error to user for now, just show empty or "failed" state?
                // Actually, let's just stick to default error handling but ensure state is safe
                setError("Failed to load active sessions")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!sessions || sessions.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                    <Car className="h-10 w-10 opacity-20" />
                    <p>No active parking sessions.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Active Sessions</h2>
            {sessions.map(session => (
                <Card
                    key={session.id}
                    className="relative overflow-hidden border-primary/20 bg-primary/5 cursor-pointer transition-colors hover:bg-primary/10"
                    onClick={() => router.push(`/session/${session.id}`)}
                >
                    <div className="absolute top-0 right-0 p-2">
                        <span className="inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-primary-foreground animate-pulse">
                            Active
                        </span>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            {session.car_details?.license_plate || "Unknown Car"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            {session.location_details?.name ? (
                                <>
                                    <MapPin className="h-3.5 w-3.5" />
                                    {session.location_details.name}
                                </>
                            ) : (
                                <>
                                    <Clock className="h-3.5 w-3.5" />
                                    Manual Timer
                                </>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Live Timer */}
                        <RemainingTimer endTime={session.end_time} />

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                                Ends at {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
