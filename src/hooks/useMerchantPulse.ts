import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface PulseOrder {
    id: number;
    user: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    product: {
        title: string;
        image_url: string | null;
    } | null;
    total_amount: number;
    current_amount: number;
    last_payment_date: string;
}

export function useMerchantPulse() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<PulseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPaymentAlert, setNewPaymentAlert] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        fetchOrders();

        // Subscribe to NEW payments (INSERT on transactions)
        // We filter by valid transactions to avoid noise
        const subscription = supabase
            .channel('pulse-transactions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `status=eq.success`
                },
                async (payload) => {
                    // Logic: Check if this payment belongs to one of the merchant's goals
                    // This is complex to do purely client-side without a custom filter or redundant reads.
                    // For now, we refresh the whole list to show updated progress.
                    // In a production app, we'd use a more specific channel or Edge Function.
                    console.log('New payment detected!', payload);

                    // Optimistic update or refetch
                    await fetchOrders();

                    setNewPaymentAlert('New payment received!');
                    setTimeout(() => setNewPaymentAlert(null), 3000);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // 1. Get my products
            const { data: myProducts, error: prodError } = await supabase
                .from('products')
                .select('id')
                .eq('merchant_id', user!.id)
                .returns<{ id: number }[]>();

            if (prodError) throw prodError;

            const productIds = myProducts?.map(p => p.id) || [];

            if (productIds.length === 0) {
                setOrders([]);
                return;
            }

            // 2. Get goals for these products
            // Note: Supabase JS joins are powerful.
            const { data, error } = await supabase
                .from('goals')
                .select(`
                    id,
                    target_amount,
                    current_amount,
                    created_at,
                    profiles:user_id (full_name, avatar_url),
                    products:product_id (title, image_url)
                `)
                .in('product_id', productIds)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map to PulseOrder shape
            const formatted: PulseOrder[] = data.map((item: any) => ({
                id: item.id,
                user: item.profiles,
                product: item.products,
                total_amount: item.target_amount,
                current_amount: item.current_amount,
                last_payment_date: item.created_at // fallback, ideally latest transaction date
            }));

            setOrders(formatted);

        } catch (e) {
            console.error('Error fetching pulse orders:', e);
        } finally {
            setLoading(false);
        }
    };

    return { orders, loading, newPaymentAlert };
}
