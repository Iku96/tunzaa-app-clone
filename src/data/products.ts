export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: any; // Using any for require() or uri string
    rating: number;
    reviews: number;
    vendor: {
        name: string;
        location: string;
        verified: boolean;
    };
    specs?: string[];
    description?: string;
    category: string;
}

export const PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Smart watch serie 5',
        price: 45000,
        originalPrice: 60000,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        rating: 4.5,
        reviews: 215,
        vendor: {
            name: 'VODACOM SHOP',
            location: 'Mlimani City',
            verified: true,
        },
        specs: ['Water resistant', 'Accelerometer', 'Display 44mm', 'GPS'],
        category: 'Electronics',
    },
    {
        id: '2',
        name: 'Smart watch serie 5',
        price: 35000,
        originalPrice: 50000,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        rating: 4.2,
        reviews: 120,
        vendor: {
            name: 'GSM SHOP',
            location: 'Msasani',
            verified: true,
        },
        specs: ['Water resistant', 'Accelerometer', 'Display 40mm'],
        category: 'Electronics',
    },
    {
        id: '3',
        name: 'Long Sofa',
        price: 750000,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Grey/Blueish
        rating: 4.8,
        reviews: 136,
        vendor: {
            name: 'VODACOM SHOP',
            location: 'Dar, Kinondoni',
            verified: true,
        },
        category: 'Furniture',
    },
    {
        id: '4',
        name: 'Long Sofa', // Second one
        price: 650000,
        image: 'https://images.unsplash.com/photo-1549187774-b4e9bdf36a54?w=500&auto=format&fit=crop&q=60', // Beige/Grey
        rating: 4.8,
        reviews: 136,
        vendor: {
            name: 'HOME DECOR',
            location: 'Posta',
            verified: true,
        },
        category: 'Furniture',
    },
    {
        id: '9', // New ID
        name: 'Cut Chair',
        price: 400000,
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Red
        rating: 4.8,
        reviews: 136,
        vendor: {
            name: 'FURNITURE CENTRE',
            location: 'Posta',
            verified: true,
        },
        category: 'Furniture',
    },
    {
        id: '10', // New ID
        name: 'Cut chair', // Lowercase c in screenshot
        price: 350000,
        image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=500&auto=format&fit=crop&q=60', // Grey chair
        rating: 4.8,
        reviews: 136,
        vendor: {
            name: 'MODERN LIVING',
            location: 'Masaki',
            verified: true,
        },
        category: 'Furniture',
    },
];

export const CATEGORIES = [
    { id: '1', name: 'Fashion', icon: 'shirt-outline' },
    { id: '2', name: 'Electronics', icon: 'desktop-outline' },
    { id: '3', name: 'Bags', icon: 'briefcase-outline' },
    { id: '4', name: 'Home', icon: 'home-outline' },
    { id: '5', name: 'Books', icon: 'book-outline' },
    { id: '6', name: 'Shoes', icon: 'footsteps-outline' },
    { id: '7', name: 'Games', icon: 'game-controller-outline' },
    { id: '8', name: 'Sport', icon: 'football-outline' },
    { id: '9', name: 'Cosmetic', icon: 'color-palette-outline' },
    { id: '10', name: 'Car', icon: 'car-sport-outline' },
];
