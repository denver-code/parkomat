"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParkingLocation } from "./types"
import { Loader2, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"
import { formatDuration } from "@/lib/format"

interface LocationStepProps {
    onSelect: (location: ParkingLocation | null) => void;
    onManual: (coords: { lat: number; lng: number } | null) => void;
}

interface ProximityResponse {
    saved: ParkingLocation[];
    public: ParkingLocation[];
}

export function LocationStep({ onSelect, onManual }: LocationStepProps) {
    const [locations, setLocations] = useState<ParkingLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [viewMode, setViewMode] = useState<'proximity' | 'all'>('proximity')

    // Get Geolocation
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            // Fallback to fetching all locations if geo fails?
            // User requirement emphasizes proximity, but if no geo, we can't do proximity.
            // Let's set viewMode to 'all' so the next effect fetches everything.
            setViewMode('all')
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (err) => {
                // If geo denied, fallback to all
                setViewMode('all')
                // We don't necessarily need to show an error if we fallback gracefully,
                // but nice to let user know why they see 'all' immediately.
                // setError("Unable to retrieve your location. Showing all locations.") 
                setLoading(false)
            }
        )
    }, [])

    // Fetch Locations (Proximity or All)
    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true)
            setError(null)
            try {
                if (viewMode === 'proximity' && coords) {
                    const data = await api.get<ProximityResponse>(`/api/private/parking/proximity?lat=${coords.lat}&lng=${coords.lng}`)

                    const nearby = [...data.saved, ...data.public]

                    if (nearby.length === 0) {
                        // If no near locations, switch to all automatically
                        setViewMode('all')
                        // Effect will run again because viewMode changed? 
                        // No, viewMode is in dependency array? Yes.
                        return
                    }

                    // Sort by distance if present (API returns it, but robust to sort anyway)
                    nearby.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))

                    setLocations(nearby)
                } else {
                    // Fetch all
                    const data = await api.get<ParkingLocation[]>('/api/private/parking')

                    // If we have coords, we can still sort by distance client-side for UX
                    let sorted = data
                    if (coords) {
                        sorted = data.sort((a, b) => {
                            const distA = Math.pow(a.lat - coords.lat, 2) + Math.pow(a.lng - coords.lng, 2)
                            const distB = Math.pow(b.lat - coords.lat, 2) + Math.pow(b.lng - coords.lng, 2)
                            return distA - distB
                        })
                    }

                    setLocations(sorted)
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load parking locations")
            } finally {
                setLoading(false)
            }
        }

        // Only run if we have coords OR if viewMode is 'all' (which doesn't strictly need coords)
        // If viewMode is proximity but no coords, we wait for coords (first effect).
        if (viewMode === 'all' || coords) {
            fetchLocations()
        }
    }, [coords, viewMode])

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Select Location</CardTitle>
                            <CardDescription>
                                {viewMode === 'proximity' ? "Nearby parking zones." : "All parking zones."}
                            </CardDescription>
                        </div>
                        {viewMode === 'proximity' && (
                            <Button variant="ghost" size="sm" onClick={() => setViewMode('all')}>
                                Show All
                            </Button>
                        )}
                        {viewMode === 'all' && coords && (
                            <Button variant="ghost" size="sm" onClick={() => setViewMode('proximity')}>
                                Show Nearby
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Finding parking spots...</p>
                        </div>
                    ) : (
                        <>
                            {locations.length > 0 ? (
                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="flex flex-col gap-2">
                                        {locations.map((loc) => (
                                            <Button
                                                key={loc.id}
                                                variant="outline"
                                                className="h-auto p-4 justify-start text-left flex flex-col items-start gap-1"
                                                onClick={() => onSelect(loc)}
                                            >
                                                <div className="flex w-full justify-between items-start">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                        {loc.name}
                                                    </div>
                                                    {loc.distance && (
                                                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                            {~~loc.distance}m
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>Max: {formatDuration(loc.max_stay)}</span>
                                                    {loc.no_return_time ? (
                                                        <span>No return: {formatDuration(loc.no_return_time)}</span>
                                                    ) : null}
                                                    {loc.is_public && <span className="text-primary font-medium">Public</span>}
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No locations found.
                                    {viewMode === 'proximity' && (
                                        <div className="mt-2">
                                            <Button variant="link" onClick={() => setViewMode('all')}>
                                                Try searching all locations
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => onManual(coords)}
                    >
                        I don't see my location
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
