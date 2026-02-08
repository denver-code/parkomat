"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Plus, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

import { ParkingLocation } from "@/components/session/types"

export default function LocationsListPage() {
    const router = useRouter()
    const [locations, setLocations] = useState<ParkingLocation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await api.get<ParkingLocation[]>("/api/private/parking")
                setLocations(res)
            } catch (err) {
                console.error("Failed to fetch locations", err)
            } finally {
                setLoading(false)
            }
        }
        fetchLocations()
    }, [])

    return (
        <div className="container max-w-md mx-auto p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Link href="/location/new">
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Location
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Saved Locations</h1>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No locations saved yet.</p>
                        <Link href="/location/new" className="mt-4 inline-block">
                            <Button variant="outline">Add your first spot</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {locations.map((loc) => (
                            <Card key={loc.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                            <MapPin className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{loc.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                                            </p>
                                            {loc.max_stay && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    Max {loc.max_stay} min
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
