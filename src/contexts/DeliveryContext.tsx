/**
 * DeliveryContext — API-driven delivery state management.
 * 
 * Previously used MOCK_REQUESTS and MOCK_HISTORY. Now fetches all data
 * from the delivery-service backend via src/services/delivery.ts.
 * 
 * State management decision: React Context is used here (instead of Zustand)
 * because delivery state is scoped to the delivery role screens only,
 * and the provider wraps only the (delivery) route group.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useTunzaaAuth } from './TunzaaAuthContext';
import {
    deliveryApi,
    usePartnerByUser,
    useDeliveries,
    Delivery,
    Partner,
} from '../services/delivery';

// --- Types ---
export interface LocationDetails {
    area: string;
    specific: string;
}

export interface PickupPoint {
    id: string;
    shopName: string;
    productName: string;
    completed: boolean;
    location: LocationDetails;
}

export interface DeliveryRequest {
    id: string;
    customerName: string;
    customerImage: string;
    amount: string;
    origin: string;
    destination: string;
    pickupPoints: PickupPoint[];
    deliveryDetails: {
        location: string;
        customerContact: string;
    };
    status: 'available' | 'active' | 'completed';
    dateAdded: string;
}

// --- Helpers: Map API Delivery to UI DeliveryRequest ---
function mapDeliveryToRequest(delivery: Delivery): DeliveryRequest {
    const pickupLoc = delivery.pickup_location;
    const dropoffLoc = delivery.dropoff_location;

    return {
        id: delivery.delivery_id,
        customerName: delivery.order_number || 'Customer',
        customerImage: '', // Server doesn't provide avatar; UI should show initials fallback
        amount: '0', // Will be enriched when order details are included
        origin: pickupLoc?.address || `${pickupLoc?.lat || 0}, ${pickupLoc?.lng || 0}`,
        destination: dropoffLoc?.address || `${dropoffLoc?.lat || 0}, ${dropoffLoc?.lng || 0}`,
        status: mapStatus(delivery.status),
        dateAdded: delivery.created_at,
        pickupPoints: [{
            id: delivery.delivery_id,
            shopName: 'Pickup',
            productName: delivery.order_number || 'Order',
            completed: delivery.status === 'delivered',
            location: {
                area: pickupLoc?.address || 'Pickup location',
                specific: `${pickupLoc?.lat || ''}, ${pickupLoc?.lng || ''}`,
            },
        }],
        deliveryDetails: {
            location: dropoffLoc?.address || 'Delivery location',
            customerContact: '', // Not available from delivery object directly
        },
    };
}

function mapStatus(apiStatus: string): 'available' | 'active' | 'completed' {
    switch (apiStatus) {
        case 'pending':
        case 'assigned':
            return 'available';
        case 'picked_up':
        case 'in_transit':
        case 'accepted':
            return 'active';
        case 'delivered':
        case 'completed':
            return 'completed';
        default:
            return 'available';
    }
}

// --- Context Definition ---
interface DeliveryContextType {
    partner: Partner | null;
    partnerLoading: boolean;
    availableRequests: DeliveryRequest[];
    activeDelivery: DeliveryRequest | null;
    history: DeliveryRequest[];
    loading: boolean;
    error: string | null;
    acceptDelivery: (id: string) => Promise<void>;
    rejectDelivery: (id: string) => void;
    togglePickupCompleted: (pickupId: string) => void;
    completeDelivery: () => Promise<void>;
    refetch: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | null>(null);

export function DeliveryProvider({ children }: { children: ReactNode }) {
    const { user } = useTunzaaAuth();
    const userId = user?.user_id || user?.id || '';

    // Fetch the partner profile for the current user
    const {
        data: partner,
        isLoading: partnerLoading,
    } = usePartnerByUser(userId, !!userId);

    const partnerId = partner?.partner_id || '';

    // Fetch pending/available deliveries for this partner
    const {
        data: pendingData,
        isLoading: pendingLoading,
        refetch: refetchPending,
    } = useDeliveries(
        { partner_id: partnerId, status: 'pending', limit: 20 },
        !!partnerId
    );

    // Fetch active deliveries
    const {
        data: activeData,
        isLoading: activeLoading,
        refetch: refetchActive,
    } = useDeliveries(
        { partner_id: partnerId, status: 'in_transit', limit: 5 },
        !!partnerId
    );

    // Fetch accepted but not yet in_transit deliveries
    const {
        data: acceptedData,
        isLoading: acceptedLoading,
        refetch: refetchAccepted,
    } = useDeliveries(
        { partner_id: partnerId, status: 'accepted', limit: 5 },
        !!partnerId
    );

    // Fetch completed deliveries for history
    const {
        data: historyData,
        isLoading: historyLoading,
        refetch: refetchHistory,
    } = useDeliveries(
        { partner_id: partnerId, status: 'delivered', limit: 50 },
        !!partnerId
    );

    // Map API data to UI shape
    const availableRequests = (pendingData?.items || []).map(mapDeliveryToRequest);
    const inTransitItems = (activeData?.items || []).map(mapDeliveryToRequest);
    const acceptedItems = (acceptedData?.items || []).map(mapDeliveryToRequest);
    const historyItems = (historyData?.items || []).map(mapDeliveryToRequest);

    // Active deliveries are either in_transit or accepted
    const activeItems = [...inTransitItems, ...acceptedItems];

    // Track the currently active delivery
    const [localActiveDelivery, setLocalActiveDelivery] = useState<DeliveryRequest | null>(null);

    useEffect(() => {
        if (activeItems.length > 0) {
            // Find the most recently updated active item or just the first one
            setLocalActiveDelivery(activeItems[0]);
        } else {
            setLocalActiveDelivery(null);
        }
    }, [activeItems.length]); // Only reset if the list length changes significantly

    const loading = pendingLoading || activeLoading || acceptedLoading || historyLoading;

    // Accept a delivery → call API to update stage
    const acceptDelivery = useCallback(async (id: string) => {
        if (!partnerId) {
            console.error('❌ [DeliveryContext] Cannot accept delivery: partnerId is missing');
            return;
        }
        try {
            console.log(`📡 [DeliveryContext] Accepting delivery: ${id}`);
            await deliveryApi.addDeliveryStage(id, {
                partner_id: partnerId,
                stage: 'accepted',
            });
            
            // Refetch all relevant data
            await Promise.all([
                refetchPending(),
                refetchAccepted(),
                refetchActive()
            ]);
            
            console.log(`✅ [DeliveryContext] Delivery ${id} accepted successfully`);
        } catch (error) {
            console.error('❌ [DeliveryContext] Failed to accept delivery:', error);
            throw error;
        }
    }, [partnerId, refetchPending, refetchAccepted, refetchActive]);

    // Reject: just remove from local view (no API call needed — just skip)
    const rejectDelivery = useCallback((id: string) => {
        // In a real implementation, this would call an API to decline
        // For now we just hide it locally and refetch will restore server state
        refetchPending();
    }, [refetchPending]);

    // Toggle pickup checkbox (local-only state for UI)
    const togglePickupCompleted = useCallback((pickupId: string) => {
        setLocalActiveDelivery(prev => {
            if (!prev) return null;
            const updatedPoints = prev.pickupPoints.map(p =>
                p.id === pickupId ? { ...p, completed: !p.completed } : p
            );
            return { ...prev, pickupPoints: updatedPoints };
        });
    }, []);

    // Complete the delivery → call proof API
    const completeDelivery = useCallback(async () => {
        if (!localActiveDelivery || !partnerId) return;
        try {
            await deliveryApi.addDeliveryProof(localActiveDelivery.id, {
                partner_id: partnerId,
                proof: {
                    type: 'signature',
                    notes: 'Delivery completed',
                },
            });
            setLocalActiveDelivery(null);
            refetchActive();
            refetchHistory();
        } catch (error) {
            console.error('Failed to complete delivery:', error);
        }
    }, [localActiveDelivery, partnerId, refetchActive, refetchHistory]);

    const refetch = useCallback(() => {
        refetchPending();
        refetchAccepted();
        refetchActive();
        refetchHistory();
    }, [refetchPending, refetchAccepted, refetchActive, refetchHistory]);

    const value: DeliveryContextType = {
        partner: partner || null,
        partnerLoading,
        availableRequests,
        activeDelivery: localActiveDelivery,
        history: historyItems,
        loading,
        error: null,
        acceptDelivery,
        rejectDelivery,
        togglePickupCompleted,
        completeDelivery,
        refetch,
    };

    return (
        <DeliveryContext.Provider value={value}>
            {children}
        </DeliveryContext.Provider>
    );
}

// --- Hook ---
export function useDeliveryContext() {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDeliveryContext must be used within a DeliveryProvider');
    }
    return context;
}
