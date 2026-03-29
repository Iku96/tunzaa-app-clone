import { useEffect, useState, useCallback } from 'react';
import { productsApi, Product } from '../services/products';
import { categoriesApi, Category } from '../services/categories';
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES } from '../data/products';

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

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export interface UseMarketplaceResult {
    products: ReturnType<typeof mapApiProductToUI>[];
    categories: ReturnType<typeof mapApiCategoryToUI>[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

export function useMarketplace(params?: any): UseMarketplaceResult {
    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getCategories().catch((e) => {
            console.warn('⚠️ [useMarketplace] Categories API failed:', e.message);
            return null;
        }),
        staleTime: 5 * 60 * 1000,
    });

    const productsQuery = useInfiniteQuery({
        queryKey: ['products', params],
        queryFn: async ({ pageParam = 0 }) => {
            try {
                return await productsApi.getProducts({ ...params, skip: pageParam as number, limit: 10, is_active: true });
            } catch (error: any) {
                console.warn('⚠️ [useMarketplace] Products API failed:', error.message);
                return { items: [], total: 0, skip: pageParam as number, limit: 10 };
            }
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            return nextSkip < lastPage.total ? nextSkip : undefined;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Handle Categories Fallback natively
    const categoriesRes = categoriesQuery.data;
    let categories = STATIC_CATEGORIES.map(c => ({ ...c, slug: '', image_url: '' }));
    if (categoriesRes && categoriesRes.items && categoriesRes.items.length > 0) {
        const mapped = categoriesRes.items.filter(c => c.is_active).map(mapApiCategoryToUI);
        if (mapped.length > 0) categories = mapped;
    }

    // Handle Infinite Products Flattening + Fallback
    const pages = productsQuery.data?.pages || [];
    let products: ReturnType<typeof mapApiProductToUI>[] = [];

    const hasAnyLiveItems = pages.some(page => page.items && page.items.length > 0);

    if (hasAnyLiveItems) {
        products = pages.flatMap(page => (page.items || []).map(mapApiProductToUI));
    } else if (!productsQuery.isLoading) {
        products = STATIC_PRODUCTS.map(p => ({
            ...p,
            image: typeof p.image === 'string' ? p.image : '',
        }));
    }

    return {
        products,
        categories,
        loading: categoriesQuery.isLoading || productsQuery.isLoading,
        error: productsQuery.error ? (productsQuery.error as Error).message : null,
        refetch: () => {
            categoriesQuery.refetch();
            productsQuery.refetch();
        },
        fetchNextPage: productsQuery.fetchNextPage,
        hasNextPage: !!productsQuery.hasNextPage,
        isFetchingNextPage: productsQuery.isFetchingNextPage,
    };
}
