import { useState, useEffect } from 'react';
import { shopsApi, Store } from '../services/shops';
import { productsApi } from '../services/products';

export function useShop(storeId: string | undefined | null) {
    const [shop, setShop] = useState<Store | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!storeId) {
            setLoading(false);
            return;
        }

        const fetchShopData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch shop details
                const storeData = await shopsApi.getStoreById(storeId);
                setShop(storeData);

                // Fetch store products concurrently if possible, or right after
                try {
                    const productsResponse = await productsApi.getProducts({ store_id: storeId });
                    setProducts(productsResponse.items || []);
                } catch (prodErr) {
                    console.error('`[useShop]` Error fetching store products', prodErr);
                    setProducts([]); // Fallback to empty products list
                }

            } catch (err: any) {
                console.error('`[useShop]` Error fetching shop details', err);
                setError(err.message || 'Failed to load shop details');
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [storeId]);

    return { shop, products, loading, error };
}
