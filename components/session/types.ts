export interface ParkingLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    max_stay?: number;
    owner_id: string;
    is_owner: boolean;
    is_public: boolean;
    distance?: number;
    no_return_time?: number;
}

export interface Car {
    id: string;
    license_plate: string;
    photo_filename: string;
    photo_url?: string; // Constructed from base_url + photo_filename
}

export interface SessionData {
    photo: File | null;
    car: Car | null;
    location: ParkingLocation | null;
    manual_max_stay_mins: number | null;
    userCoords?: { lat: number; lng: number } | null;
}
