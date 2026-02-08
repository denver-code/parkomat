"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { api } from "@/lib/api"
import Image from "next/image"

export default function AddCarPage() {
    const router = useRouter()
    const [licensePlate, setLicensePlate] = useState("")
    const [photo, setPhoto] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhoto(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!licensePlate || !photo) {
            setError("Please provide both license plate and a photo.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("license_plate", licensePlate.toUpperCase())
            formData.append("photo", photo) // 'photo' matches backend field name

            await api.post("/api/private/car", formData)
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Failed to add car:", err)
            setError(err.message || "Failed to add car. Please try again.")
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
                    <CardTitle>Add New Car</CardTitle>
                    <CardDescription>
                        Register a new vehicle in your garage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="plate">License Plate</Label>
                            <Input
                                id="plate"
                                placeholder="e.g. AB12 CDE"
                                value={licensePlate}
                                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Photo of Car</Label>

                            <div
                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                        <Image
                                            src={previewUrl}
                                            alt="Car preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Camera className="h-8 w-8" />
                                        <span className="text-xs">Tap to take photo</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Make sure the license plate is visible.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Car
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
