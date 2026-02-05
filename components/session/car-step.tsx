"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "./types"
import { CarFront, Loader2, Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"

interface CarStepProps {
    onSelect: (car: Car) => void;
    selectedCar: Car | null;
}

export function CarStep({ onSelect, selectedCar }: CarStepProps) {
    const [cars, setCars] = useState<Car[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const data = await api.get<{ cars: any[], base_url: string }>('/api/private/car')
                const fetchedCars = data.cars.map((c: any) => ({
                    ...c,
                    photo_url: data.base_url + c.photo_filename
                }))

                setCars(fetchedCars)
            } catch (err) {
                console.error(err)
                setError("Failed to load your cars")
            } finally {
                setLoading(false)
            }
        }

        fetchCars()
    }, [])

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card>
                <CardHeader>
                    <CardTitle>Select Vehicle</CardTitle>
                    <CardDescription>Choose the car you are parking.</CardDescription>
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
                            <p>Loading your garage...</p>
                        </div>
                    ) : (
                        <>
                            {cars.length > 0 ? (
                                <ScrollArea className="h-[300px] pr-4">
                                    <div className="grid grid-cols-1 gap-2">
                                        {cars.map((car) => (
                                            <Button
                                                key={car.id}
                                                variant={selectedCar?.id === car.id ? "default" : "outline"}
                                                className="h-auto p-4 justify-start text-left flex items-center gap-3"
                                                onClick={() => onSelect(car)}
                                            >
                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {car.photo_url ? (
                                                        <img src={car.photo_url} alt={car.license_plate} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <CarFront className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-base">{car.license_plate}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-3">
                                    <CarFront className="h-10 w-10 opacity-20" />
                                    <p>You don't have any cars registered.</p>
                                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                                        <Plus className="h-3 w-3 mr-1" /> Add a Car in Dashboard
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
