import { useEffect, useState, useCallback } from 'react';
import { productsApi, Product } from '../services/products';
import { categoriesApi, Category } from '../services/categories';

/**
 * Maps an API Product to the shape used by the buyer home UI.
 * This allows us to swap static data for live data without refactoring every component.
 */
export function mapApiProductToUI(product: Product) {
    // Get the primary image URL
    let imageUrl: string | null = null;
    const validImages = (product.images || []).filter(img => img != null);
    if (validImages.length > 0) {
        const firstImage = validImages[0];
        if (typeof firstImage === 'string') {
            imageUrl = firstImage;
        } else {
            imageUrl = firstImage.url;
        }
    }

    return {
        id: product.product_id || product._id,
        name: product.name,
        price: product.base_price_raw || product.base_price || 0,
        originalPrice: (product.sale_price_raw || product.sale_price) ? (product.base_price_raw || product.base_price) : undefined,
        image: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
        rating: 0,
        reviews: 0,
        vendor: {
            id: product.store_id || product.store?.store_id || '1',
            name: product.store?.store_name || 'Vendor',
            location: '',
            verified: true,
        },
        specs: product.tags || [],
        description: product.description || '',
        category: product.category_ids?.[0] || '',
    };
}

/**
 * Maps an API Category to the shape used by the buyer home UI.
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
    'fashion': 'shirt-outline',
    'electronics': 'desktop-outline',
    'bags': 'briefcase-outline',
    'home': 'home-outline',
    'books': 'book-outline',
    'shoes': 'footsteps-outline',
    'games': 'game-controller-outline',
    'sport': 'football-outline',
    'cosmetic': 'color-palette-outline',
    'car': 'car-sport-outline',
    'furniture': 'bed-outline',
    'food': 'fast-food-outline',
    'health': 'medkit-outline',
    'beauty': 'color-palette-outline',
    'kids': 'happy-outline',
    'toys': 'game-controller-outline',
    'office': 'briefcase-outline',
    'garden': 'leaf-outline',
    'phones': 'phone-portrait-outline',
    'computers': 'laptop-outline',
    'shisha': 'flame-outline',
};

function getCategoryIcon(name: string): string {
    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
        if (lowerName.includes(key)) return icon;
    }
    return 'grid-outline'; // default fallback icon
}

function mapApiCategoryToUI(category: Category) {
    return {
        id: category.category_id,
        name: category.name,
        icon: getCategoryIcon(category.name),
        slug: category.slug,
        image_url: category.image_url,
    };
}

export interface UseMarketplaceResult {
    products: ReturnType<typeof mapApiProductToUI>[];
    categories: ReturnType<typeof mapApiCategoryToUI>[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useMarketplace(): UseMarketplaceResult {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch both in parallel
            const [productsRes, categoriesRes] = await Promise.all([
                productsApi.getProducts({ limit: 20, is_active: true }).catch((e) => {
                    console.warn('⚠️ [useMarketplace] Products API failed, using static fallback:', e.message);
                    return null;
                }),
                categoriesApi.getCategories().catch((e) => {
                    console.warn('⚠️ [useMarketplace] Categories API failed, using static fallback:', e.message);
                    return null;
                }),
            ]);

            // Products
            if (productsRes && productsRes.items && productsRes.items.length > 0) {
                console.log(`✅ [useMarketplace] Loaded ${productsRes.items.length} products from API`);
                const approvedProducts = productsRes.items.filter((p: any) => p.verification_status === 'approved');
                setProducts(approvedProducts.map(mapApiProductToUI));
            } else {
                console.log('ℹ️ [useMarketplace] No products from API');
                setProducts([]);
            }

            // Categories
            if (categoriesRes && categoriesRes.items && categoriesRes.items.length > 0) {
                console.log(`✅ [useMarketplace] Loaded ${categoriesRes.items.length} categories from API`);
                const mapped = categoriesRes.items
                    .filter(c => c.is_active)
                    .map(mapApiCategoryToUI);
                setCategories(mapped.length > 0 ? mapped : []);
            } else {
                console.log('ℹ️ [useMarketplace] No categories from API');
                setCategories([]);
            }

        } catch (e: any) {
            console.error('❌ [useMarketplace] Failed to fetch marketplace data:', e.message);
            setError(e.message || 'Failed to load marketplace data');
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { products, categories, loading, error, refetch: fetchData };
}
