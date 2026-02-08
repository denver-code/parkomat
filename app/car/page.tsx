"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Car as CarIcon, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Car } from "@/components/session/steps/car-selection-step" // Reuse type or define new one

interface CarListResponse {
    cars: Car[]
    base_url: string
}

export default function CarsListPage() {
    const router = useRouter()
    const [cars, setCars] = useState<Car[]>([])
    const [baseUrl, setBaseUrl] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const res = await api.get<CarListResponse>("/api/private/car")
                setCars(res.cars)
                setBaseUrl(res.base_url)
            } catch (err) {
                console.error("Failed to fetch cars", err)
            } finally {
                setLoading(false)
            }
        }
        fetchCars()
    }, [])

    return (
        <div className="container max-w-md mx-auto p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Link href="/car/new">
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Car
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                <h1 className="text-2xl font-bold">My Cars</h1>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : cars.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        <CarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No cars added yet.</p>
                        <Link href="/car/new" className="mt-4 inline-block">
                            <Button variant="outline">Add your first car</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {cars.map((car) => (
                            <Card key={car.id} className="overflow-hidden">
                                <CardContent className="p-0 flex items-center">
                                    <div className="h-24 w-24 relative bg-muted flex-shrink-0">
                                        <img
                                            src={`${baseUrl}${car.photo_filename}`}
                                            alt={car.license_plate}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails
                                                (e.target as HTMLImageElement).src = "https://placehold.co/100?text=Car"
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="font-bold text-lg">{car.license_plate}</p>
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
