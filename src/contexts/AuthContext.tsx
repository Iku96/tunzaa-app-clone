import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types/database.types';

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
    signUp: (email: string, password: string, role: UserRole, phoneNumber: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewModeState] = useState<ViewMode>('buyer');

    // Fetch profile for current user
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
            }
        } catch (e) {
            console.error('Unexpected error fetching profile:', e);
        } finally {
            setLoading(false);
        }
    };

    // Initialize auth session
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
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

    const signUp = async (email: string, password: string, role: UserRole, phoneNumber: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Update profile with role and phone number
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        role,
                        phone_number: phoneNumber,
                    })
                    .eq('id', data.user.id);

                if (profileError) throw profileError;
                await fetchProfile(data.user.id);
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign up');
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setViewModeState('buyer');
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) throw new Error('No user logged in');

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            await fetchProfile(user.id);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
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
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
