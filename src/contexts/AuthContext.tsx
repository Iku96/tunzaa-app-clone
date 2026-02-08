import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types/database.types';

type ViewMode = 'buyer' | 'merchant' | 'admin';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isAdmin: boolean;
    isMerchant: boolean;
    isBuyer: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewModeState] = useState<ViewMode>('buyer');

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setViewModeState('buyer');
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
                // If user is admin/merchant, they could potentially start in that mode, 
                // but requirements say "Merchant mode allows toggling". 
                // We'll default to 'buyer' but they can switch if role permits.
            }
        } catch (e) {
            console.error('Unexpected error fetching profile:', e);
        } finally {
            setLoading(false);
        }
    };

    const setViewMode = (mode: ViewMode) => {
        if (!profile) return;

        // Validation: Can only switch to merchant if role is merchant or admin
        if (mode === 'merchant' && profile.role !== 'merchant' && profile.role !== 'admin') {
            console.warn('Unauthorized: Cannot switch to merchant view');
            return;
        }

        // Validation: Can only switch to admin if role is admin
        if (mode === 'admin' && profile.role !== 'admin') {
            console.warn('Unauthorized: Cannot switch to admin view');
            return;
        }

        setViewModeState(mode);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setViewModeState('buyer');
    };

    const value: AuthContextType = {
        session,
        user,
        profile,
        loading,
        viewMode,
        setViewMode,
        isAdmin: profile?.role === 'admin',
        isMerchant: profile?.role === 'merchant' || profile?.role === 'admin',
        isBuyer: true,
        refreshProfile: async () => {
            if (user) await fetchProfile(user.id);
        },
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context!;
}
