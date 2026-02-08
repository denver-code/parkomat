import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon in Leaflet with Next.js/React
const fixLeafletIcon = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface MapPickerClientProps {
    initialLat?: number
    initialLng?: number
    onLocationSelect: (lat: number, lng: number) => void
    height?: string
}

function LocationMarker({
    position,
    setPosition,
    onLocationSelect
}: {
    position: [number, number] | null,
    setPosition: (pos: [number, number]) => void,
    onLocationSelect: (lat: number, lng: number) => void
}) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setPosition([lat, lng])
            onLocationSelect(lat, lng)
            map.flyTo(e.latlng, map.getZoom())
        },
        locationfound(e) {
            const { lat, lng } = e.latlng
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return position === null ? null : (
        <Marker position={position}></Marker>
    )
}

export default function MapPickerClient({ initialLat, initialLng, onLocationSelect, height = "300px" }: MapPickerClientProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    )
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

    useEffect(() => {
        fixLeafletIcon()

        // Try to get current location if no initial position
        if (!initialLat || !initialLng) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    setUserLocation([latitude, longitude])
                    if (!position) {
                        setPosition([latitude, longitude])
                        onLocationSelect(latitude, longitude)
                    }
                },
                (err) => {
                    console.error("Error getting location", err)
                    // Default to a known location (e.g. London) if geolocation fails/denied
                    if (!position) {
                        const defaultPos: [number, number] = [51.505, -0.09]
                        setPosition(defaultPos)
                        onLocationSelect(defaultPos[0], defaultPos[1])
                    }
                }
            )
        }
    }, [])

    const center: [number, number] = position || userLocation || [51.505, -0.09]

    function MapController() {
        const map = useMap()
        useEffect(() => {
            if (position) {
                map.flyTo(position, map.getZoom())
            } else if (userLocation) {
                map.flyTo(userLocation, map.getZoom())
            }
        }, [userLocation, position, map])
        return null
    }

    return (
        <div className="overflow-hidden rounded-md border relative z-0" style={{ height }}>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
            >
                <MapController />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>
            <div className="absolute bottom-2 right-2 bg-background/80 p-1 text-xs rounded z-[1000] pointer-events-none backdrop-blur-sm">
                Tap map to select
            </div>
        </div>
    )
}
