"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { MapPicker } from "@/components/ui/map-picker"
import { api } from "@/lib/api"

export default function AddLocationPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [maxStay, setMaxStay] = useState<string>("")
    const [noReturnTime, setNoReturnTime] = useState<string>("")
    const [isPublic, setIsPublic] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !coords) {
            setError("Please provide a name and pick a location on the map.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            await api.post("/api/private/parking", {
                location_name: name,
                latitude: coords.lat,
                longitude: coords.lng,
                max_stay: maxStay ? parseInt(maxStay) : null,
                no_return_time: noReturnTime ? parseInt(noReturnTime) : null,
                is_public: isPublic,
                fee_classification: "free" // Default for now
            })
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Failed to add location:", err)
            setError(err.message || "Failed to add location. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-md mx-auto p-4 space-y-6">
            <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Add Parking Location</CardTitle>
                    <CardDescription>
                        Save a new parking spot for quick access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Location Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Home, Work, Gym"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Location on Map</Label>
                            <MapPicker
                                onLocationSelect={(lat, lng) => setCoords({ lat, lng })}
                                height="400px"
                            />
                            {coords && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxStay">Max Stay (mins)</Label>
                                <Input
                                    id="maxStay"
                                    type="number"
                                    placeholder="Optional"
                                    value={maxStay}
                                    onChange={(e) => setMaxStay(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="noReturn">No Return (mins)</Label>
                                <Input
                                    id="noReturn"
                                    type="number"
                                    placeholder="Optional"
                                    value={noReturnTime}
                                    onChange={(e) => setNoReturnTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                            <Label htmlFor="public">Make Pbulic</Label>
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Public locations can be seen by other users.
                        </p>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Location
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
