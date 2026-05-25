import { create } from "zustand";

/**
 * Ephemeral store for passing a map-picked location back from the
 * map picker screen to the address form.  The map screen writes to
 * this store, then calls router.back().  The address screen reads
 * from it on focus/mount and clears it.
 */
export interface MapPickerResult {
    address: string;
    lat: string;
    lng: string;
    city: string;
    type: string; // 'apartment' | 'house' | 'office' | 'hotel'
}

interface MapPickerState {
    result: MapPickerResult | null;
    setResult: (result: MapPickerResult) => void;
    clearResult: () => void;
}

export const useMapPickerStore = create<MapPickerState>((set) => ({
    result: null,
    setResult: (result) => set({ result }),
    clearResult: () => set({ result: null }),
}));
