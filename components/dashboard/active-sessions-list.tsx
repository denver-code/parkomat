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
    const [filter, setFilter] = useState<"active" | "all">("active")

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch sessions, cars, and parking locations in parallel
                // Construct query based on filter
                const query = filter === "active" ? "?status=active" : ""

                const [sessionsData, carsData, locationsData] = await Promise.all([
                    api.get<ActiveSession[]>(`/api/private/session${query}`),
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

                // Sort by start_time desc
                enrichedSessions.sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

                setSessions(enrichedSessions)
            } catch (err) {
                console.error("Failed to fetch sessions:", err)
                setError("Failed to load sessions")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [filter])

    if (loading && sessions.length === 0) {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Your Parking</h2>
                <div className="flex items-center space-x-2 bg-secondary rounded-lg p-1">
                    <button
                        onClick={() => setFilter("active")}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${filter === "active"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${filter === "all"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {sessions.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                        <Car className="h-10 w-10 opacity-20" />
                        <p>{filter === "active" ? "No active parking sessions." : "No parking history found."}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sessions.map(session => {
                        const isExpired = session.status === "completed" || new Date(session.end_time).getTime() < new Date().getTime()
                        const isActive = session.status === "active"

                        return (
                            <Card
                                key={session.id}
                                className={`relative overflow-hidden cursor-pointer transition-colors 
                                    ${isActive
                                        ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                                        : "hover:bg-accent/50 opacity-80"
                                    }`}
                                onClick={() => router.push(`/session/${session.id}`)}
                            >
                                <div className="absolute top-0 right-0 p-2">
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors
                                        ${isActive
                                            ? "border-transparent bg-primary text-primary-foreground animate-pulse"
                                            : "border-transparent bg-secondary text-secondary-foreground"
                                        }`}>
                                        {session.status}
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
                                    {isActive ? (
                                        <RemainingTimer endTime={session.end_time} />
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Ended {formatRelativeDate(session.end_time)}</span>
                                        </div>
                                    )}

                                    {isActive && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                Ends at {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
