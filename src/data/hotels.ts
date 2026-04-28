/**
 * Hotels Data Layer
 *
 * Curated hotel data for the Services section.
 * When a hotels API is built on the backend, only this file needs to change —
 * swap the static arrays for API calls and the rest of the app stays the same.
 */

export interface Hotel {
    id: string;
    name: string;
    location: string;
    city: string;
    price: number;
    priceLabel: string;
    pricePeriod: 'nightly' | 'monthly';
    rating: number;
    reviews: number;
    description: string;
    images: string[];
    amenities: string[];
    maxGuests: number;
    availableFrom?: string;
    availableTo?: string;
}

export const HOTELS: Hotel[] = [
    {
        id: '1',
        name: 'Serena Hotel',
        location: 'Kinondoni B',
        city: 'Dar es Salaam',
        price: 180000,
        priceLabel: '180,000',
        pricePeriod: 'monthly',
        rating: 5.0,
        reviews: 3278,
        description:
            'Serena Hotel Dar es Salaam is a luxurious 5-star hotel situated in the heart of the city, offering world-class hospitality with stunning ocean views, fine dining, and premium amenities for discerning travelers.',
        images: [
            'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=800&fit=crop',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop',
        ],
        amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Gym', 'Bar'],
        maxGuests: 4,
    },
    {
        id: '2',
        name: 'Hyatt Regency',
        location: 'Posta',
        city: 'Dar es Salaam',
        price: 250000,
        priceLabel: '250,000',
        pricePeriod: 'monthly',
        rating: 4.8,
        reviews: 2104,
        description:
            'Hyatt Regency Dar es Salaam, The Kilimanjaro, is an iconic waterfront hotel offering panoramic views of the Indian Ocean, modern rooms, and exceptional service in a prime city-center location.',
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&fit=crop',
            'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=800&fit=crop',
        ],
        amenities: ['Pool', 'Restaurant', 'WiFi', 'Conference', 'Gym'],
        maxGuests: 3,
    },
    {
        id: '3',
        name: 'Ramada Resort',
        location: 'Mbezi Beach',
        city: 'Dar es Salaam',
        price: 200000,
        priceLabel: '200,000',
        pricePeriod: 'monthly',
        rating: 4.5,
        reviews: 1456,
        description:
            'Ramada Resort Dar es Salaam is a beachfront paradise in Mbezi Beach, perfect for both leisure and business travelers seeking tranquility along with modern comforts and facilities.',
        images: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop',
            'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=800&fit=crop',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&fit=crop',
        ],
        amenities: ['Beach', 'Pool', 'Restaurant', 'WiFi', 'Parking'],
        maxGuests: 4,
    },
    {
        id: '4',
        name: 'Johari Rotana',
        location: 'City Centre',
        city: 'Dar es Salaam',
        price: 300000,
        priceLabel: '300,000',
        pricePeriod: 'monthly',
        rating: 4.9,
        reviews: 890,
        description:
            'Johari Rotana is a modern upscale hotel in the heart of Dar es Salaam, offering elegant rooms, a rooftop pool, and easy access to the city\'s business and cultural hubs.',
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&fit=crop',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop',
        ],
        amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Rooftop Bar'],
        maxGuests: 2,
    },
    {
        id: '5',
        name: 'Slipway Hotel',
        location: 'Masaki',
        city: 'Dar es Salaam',
        price: 150000,
        priceLabel: '150,000',
        pricePeriod: 'monthly',
        rating: 4.3,
        reviews: 632,
        description:
            'Slipway Hotel is a charming waterfront hotel in the upscale Masaki peninsula, featuring comfortable rooms with marina views, a variety of restaurants, and a vibrant weekend market.',
        images: [
            'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=800&fit=crop',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&fit=crop',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop',
        ],
        amenities: ['Restaurant', 'WiFi', 'Marina', 'Shopping'],
        maxGuests: 3,
    },
    {
        id: '6',
        name: 'Mövenpick Royal Palm',
        location: 'Ohio Street',
        city: 'Dar es Salaam',
        price: 280000,
        priceLabel: '280,000',
        pricePeriod: 'monthly',
        rating: 4.7,
        reviews: 1820,
        description:
            'Mövenpick Hotel & Residences Dar es Salaam offers elegant accommodations in the city centre with stunning views of the harbour, exceptional dining, and premium business facilities.',
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&fit=crop',
            'https://images.unsplash.com/photo-1571896349842-6e5a51335022?w=800&fit=crop',
        ],
        amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Gym', 'Conference'],
        maxGuests: 4,
    },
];

/** Available cities for location selection */
export const HOTEL_CITIES = [
    'Dar es Salaam',
    'Arusha',
    'Zanzibar',
    'Dodoma',
    'Mwanza',
    'Mbeya',
    'Morogoro',
];

/** Get all hotels, optionally filtered */
export function getAllHotels(): Hotel[] {
    return HOTELS;
}

/** Get a single hotel by ID */
export function getHotelById(id: string): Hotel | undefined {
    return HOTELS.find((h) => h.id === id);
}

/** Search/filter hotels by criteria */
export function searchHotels(params: {
    city?: string;
    guests?: number;
    maxPrice?: number;
}): Hotel[] {
    let results = [...HOTELS];

    if (params.city) {
        results = results.filter(
            (h) => h.city.toLowerCase() === params.city!.toLowerCase()
        );
    }
    if (params.guests) {
        results = results.filter((h) => h.maxGuests >= params.guests!);
    }
    if (params.maxPrice) {
        results = results.filter((h) => h.price <= params.maxPrice!);
    }

    return results;
}
