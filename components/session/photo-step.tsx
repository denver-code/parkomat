"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"

interface PhotoStepProps {
    onNext: (photo: File) => void;
    initialPhoto: File | null;
}

export function PhotoStep({ onNext, initialPhoto }: PhotoStepProps) {
    const [preview, setPreview] = useState<string | null>(initialPhoto ? URL.createObjectURL(initialPhoto) : null)
    const [file, setFile] = useState<File | null>(initialPhoto)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
        }
    }

    const handleClear = () => {
        setFile(null)
        setPreview(null)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card>
                <CardHeader>
                    <CardTitle>Take a Photo</CardTitle>
                    <CardDescription>Capture your car in the parking spot.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={inputRef}
                        onChange={handleFileChange}
                    />

                    {preview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                            <Image
                                src={preview}
                                alt="Parking preview"
                                fill
                                className="object-cover"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full"
                                onClick={handleClear}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors gap-2"
                        >
                            <Camera className="h-12 w-12 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Tap to take photo</span>
                        </div>
                    )}

                    <Button
                        className="w-full"
                        size="lg"
                        disabled={!file}
                        onClick={() => file && onNext(file)}
                    >
                        Continue
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
