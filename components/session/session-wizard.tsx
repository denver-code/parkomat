"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PhotoStep } from "./photo-step"
import { CarStep } from "./car-step"
import { LocationStep } from "./location-step"
import { DetailsStep } from "./details-step"
import { SessionData, ParkingLocation, Car } from "./types"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { api } from "@/lib/api"

export function SessionWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [data, setData] = useState<SessionData>({
        photo: null,
        car: null,
        location: null,
        manual_max_stay_mins: null,
        userCoords: null
    })

    // 1: Photo -> 2: Car -> 3: Location -> 4: Details
    const totalSteps = 4
    const progress = (step / totalSteps) * 100

    const handlePhotoNext = (photo: File) => {
        setData(prev => ({ ...prev, photo }))
        setStep(2)
    }

    const handleCarSelect = (car: Car) => {
        setData(prev => ({ ...prev, car }))
        setStep(3)
    }

    const handleLocationSelect = (location: ParkingLocation | null) => {
        setData(prev => ({ ...prev, location, manual_max_stay_mins: null }))
        setStep(4)
    }

    const handleManualEntry = (coords: { lat: number; lng: number } | null) => {
        setData(prev => ({ ...prev, location: null, userCoords: coords }))
        setStep(4)
    }

    const handleBack = () => {
        setStep(prev => Math.max(1, prev - 1))
        setError(null)
    }

    const handleSubmit = async (finalData: SessionData) => {
        if (!finalData.car) {
            setError("Car is required")
            return
        }

        if (!finalData.photo) {
            setError("Photo is required")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()

            formData.append("car_id", finalData.car.id)
            formData.append("photo", finalData.photo)

            // If we have a specific parking location selected
            if (finalData.location && finalData.location.id) {
                formData.append("parking_location_id", finalData.location.id)
                formData.append("lat", finalData.location.lat.toString())
                formData.append("lng", finalData.location.lng.toString())
            }
            // Fallback: If manual entry, we MUST have user coordinates (current location)
            else if (finalData.manual_max_stay_mins) {
                if (!finalData.userCoords) {
                    throw new Error("Location coordinates are required even for manual entry. Please ensure location services are enabled.")
                }
                formData.append("manual_max_stay_mins", finalData.manual_max_stay_mins.toString())
                formData.append("lat", finalData.userCoords.lat.toString())
                formData.append("lng", finalData.userCoords.lng.toString())
            }

            await api.post("/api/private/session", formData)

            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto w-full space-y-6">
            <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                    Step {step} of {totalSteps}
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {step === 1 && (
                <PhotoStep
                    onNext={handlePhotoNext}
                    initialPhoto={data.photo}
                />
            )}

            {step === 2 && (
                <CarStep
                    onSelect={handleCarSelect}
                    selectedCar={data.car}
                />
            )}

            {step === 3 && (
                <LocationStep
                    onSelect={handleLocationSelect}
                    onManual={handleManualEntry}
                />
            )}

            {step === 4 && (
                <DetailsStep
                    data={data}
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                    loading={loading}
                />
            )}
        </div>
    )
}
