"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionData } from "./types"
import { Clock, MapPin, Loader2, CarFront } from "lucide-react"
import { formatDuration } from "@/lib/format"

interface DetailsStepProps {
    data: SessionData;
    onSubmit: (finalData: SessionData) => Promise<void>;
    onBack: () => void;
    loading: boolean;
}

export function DetailsStep({ data, onSubmit, onBack, loading }: DetailsStepProps) {
    const [manualDuration, setManualDuration] = useState<string>("")
    const isManual = !data.location

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const finalData = { ...data }

        if (isManual) {
            const minutes = parseInt(manualDuration)
            if (isNaN(minutes) || minutes <= 0) return
            finalData.manual_max_stay_mins = minutes
        }

        onSubmit(finalData)
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card>
                <CardHeader>
                    <CardTitle>Confirm Details</CardTitle>
                    <CardDescription>Review your parking session details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">

                            {/* Car Info */}
                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                <div className="w-10 h-10 rounded bg-background flex items-center justify-center overflow-hidden flex-shrink-0 border">
                                    {data.car?.photo_url ? (
                                        <img src={data.car.photo_url} alt={data.car.license_plate} className="w-full h-full object-cover" />
                                    ) : (
                                        <CarFront className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium">{data.car?.license_plate || "No Car Selected"}</h4>
                                    <p className="text-xs text-muted-foreground">Vehicle</p>
                                </div>
                            </div>

                            {data.location ? (
                                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">{data.location.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Max Stay: {formatDuration(data.location.max_stay)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Parking Duration (minutes)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="duration"
                                            type="number"
                                            placeholder="e.g. 60"
                                            className="pl-9"
                                            value={manualDuration}
                                            onChange={(e) => setManualDuration(e.target.value)}
                                            required
                                            min={1}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Enter the maximum time you plan to stay.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="relative sm:w-24 sm:h-24 w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {data.photo && (
                                        <img
                                            src={URL.createObjectURL(data.photo)}
                                            alt="Car"
                                            className="object-cover w-full h-full"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Vehicle Photo</p>
                                    <p className="text-xs text-muted-foreground">Ready to upload</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={onBack}
                                disabled={loading}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={(isManual && !manualDuration) || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    "Start Parking"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
