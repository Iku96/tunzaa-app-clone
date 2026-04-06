import { useEffect, useState, useCallback } from 'react';
import { useTunzaaAuth } from '../contexts/TunzaaAuthContext';
import { orderApi, Order } from '../services/orders';

export interface PulseOrder {
    id: string; // Changed from number to string to match legacy _id/order_id
    user: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    product: {
        title: string;
        image_url: string | null;
        quantity?: number;
    } | null;
    total_amount: number;
    current_amount: number;
    last_payment_date: string;
}

export function useMerchantPulse(params?: { fromDate?: string; toDate?: string }) {
    const { user } = useTunzaaAuth();
    const [orders, setOrders] = useState<PulseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPaymentAlert, setNewPaymentAlert] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get vendor profile ID from user profiles
    const vendorProfile = user?.profiles?.find(
        (profile) => profile.role === "vendor"
    );
    const vendorId = vendorProfile?.profile_id;

    const fetchOrders = useCallback(async () => {
        if (!vendorId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch orders from the API
            const response = await orderApi.getVendorOrders({
                vendor_id: vendorId,
                limit: 20,
                from_date: params?.fromDate,
                to_date: params?.toDate
            });

            // Map to PulseOrder shape expected by the UI
            const items = response?.items ?? [];
            const formatted: PulseOrder[] = items.map((item: Order) => {
                const primaryItem = item.items && item.items.length > 0 ? item.items[0] : null;

                return {
                    id: item.order_id,
                    user: {
                        full_name: item.shipping_address?.first_name
                            ? `${item.shipping_address.first_name} ${item.shipping_address.last_name || ''}`.trim()
                            : 'Customer',
                        avatar_url: null,
                    },
                    product: {
                        title: primaryItem ? primaryItem.name : 'Unknown Product',
                        image_url: null,
                        quantity: primaryItem ? primaryItem.quantity : 1,
                    },
                    total_amount: item.totals?.total || 0,
                    current_amount: item.payment_details?.amount || 0,
                    last_payment_date: item.created_at
                };
            });

            setOrders(formatted);

        } catch (e: any) {
            console.error('Failed to fetch merchant orders:', e.message || e);
            setError(e.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    useEffect(() => {
        fetchOrders();

        // Note: Real-time subscriptions for transactions are removed because 
        // they relied on direct Supabase connections which are bypassed by the API.
        // For real-time updates in a production API-driven app, you would use WebSockets 
        // or a polling mechanism. For now, we rely on the initial fetch.

    }, [fetchOrders]);

    return { orders, loading, error, newPaymentAlert, refetch: fetchOrders };
}
