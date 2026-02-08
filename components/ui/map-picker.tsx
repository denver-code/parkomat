"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const MapPickerClient = dynamic(
    () => import("./map-picker-client"),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center bg-muted rounded-md h-full min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }
)

interface MapPickerProps {
    initialLat?: number
    initialLng?: number
    onLocationSelect: (lat: number, lng: number) => void
    height?: string
}

export function MapPicker(props: MapPickerProps) {
    return <MapPickerClient {...props} />
}
