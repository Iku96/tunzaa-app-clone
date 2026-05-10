import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { 
    LayoutGrid, 
    Box, 
    TrendingUp,
    Users, 
    Wallet, 
    Settings, 
    LogOut, 
    X,
    ChevronRight,
    Search,
    Bell,
    CheckCircle,
    Briefcase,
    MoreHorizontal,
    User,
    ChevronDown
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTunzaaAuth } from '../../contexts/TunzaaAuthContext';
import { setLastPortal, getAccessToken } from '../../utils/storage';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getVendorLogoUrl } from '../../utils/images';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../../services/config';

const { width, height } = Dimensions.get('window');

interface SidebarMenuProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function SidebarMenu({ isVisible, onClose }: SidebarMenuProps) {
    const { t } = useTranslation();
    const { user } = useTunzaaAuth();
    const localRouter = useRouter(); // renamed to avoid conflict
    const pathname = usePathname();
    const slideAnim = useRef(new Animated.Value(-width)).current; 
    const [isLoansExpanded, setIsLoansExpanded] = useState(false);

    useEffect(() => {
        if (
            pathname === '/(vendor)/loan-services' || 
            pathname === '/(vendor)/loans/requests' ||
            pathname === '/(vendor)/loans/repayments' ||
            pathname === '/(loan)/requests' ||
            pathname === '/(loan)/collections'
        ) {
            setIsLoansExpanded(true);
        }
    }, [pathname]);

    const [localExtras, setLocalExtras] = useState<any>({});

    useEffect(() => {
        const loadLocalExtras = async () => {
            try {
                const userId = user?.user_id || user?.id;
                if (!userId) return;
                const BUSINESS_EXTRAS_KEY = '@tunzaa_business_extras';
                const storedExtras = await AsyncStorage.getItem(`${BUSINESS_EXTRAS_KEY}_${userId}`);
                if (storedExtras) {
                    setLocalExtras(JSON.parse(storedExtras));
                }
            } catch (e) {
                console.log('Error loading localExtras in SidebarMenu:', e);
            }
        };
        loadLocalExtras();
    }, [user]);

    // Find active profile (vendor or loan provider based on current portal)
    const activeRole = user?.activeProfileRole || '';
    const isLoanPortal = activeRole.toLowerCase() === 'loan' || activeRole.toLowerCase() === 'loan_provider';

    const [providerDetails, setProviderDetails] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchProvider = async () => {
            if (!isLoanPortal) return;
            try {
                const userId = user?.user_id || user?.id;
                if (!userId) return;
                const token = await getAccessToken();
                const response = await fetch(`${API_CONFIG.BASE_URL}/loans/providers/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok && isMounted) {
                    const providers = await response.json();
                    const myProvider = providers.find((p: any) => p.user_id === userId);
                    if (myProvider) {
                        setProviderDetails(myProvider);
                    }
                }
            } catch (e) {
                console.warn('SidebarMenu failed to fetch provider details:', e);
            }
        };
        fetchProvider();
        return () => { isMounted = false; };
    }, [user, isLoanPortal]);
    
    const activeProfile = user?.profiles?.find((p: any) => {
        if (isLoanPortal) {
            return ['loan', 'loan_provider'].includes(p.role?.toLowerCase());
        }
        return ['vendor', 'merchant', 'business'].includes(p.role?.toLowerCase());
    });
    
    // Check metadata for branding if not directly on profile
    const metadata = typeof activeProfile?.metadata === 'string' ? JSON.parse(activeProfile.metadata) : (activeProfile?.metadata || {});
    const branding = typeof activeProfile?.branding === 'string' ? JSON.parse(activeProfile.branding) : (activeProfile?.branding || {});
    const logoUrl = localExtras.logo_url || providerDetails?.logo_url || metadata?.logo_url || getVendorLogoUrl({
        metadata,
        branding,
        vendorDetails: user?.vendorDetails,
        localExtras,
    });
    
    let displayName = localExtras.business_name || 
                        providerDetails?.business_name || 
                        providerDetails?.name ||
                        metadata?.business_name || 
                        metadata?.store_name || 
                        metadata?.company_name || 
                        user?.vendorDetails?.business_name || 
                        user?.vendorDetails?.name ||
                        activeProfile?.display_name || 
                        activeProfile?.displayName || 
                        metadata?.display_name || 
                        activeProfile?.business_name || 
                        user?.display_name || 
                        user?.name || 
                        user?.first_name ||
                        (isLoanPortal ? 'Loan Provider' : 'Merchant');

    if (displayName && /fast\s*cash/i.test(displayName)) {
        displayName = "Loan Provider";
    }
    
    // Calculate initials
    const initials = displayName
        .split(' ')
        .filter((n: string) => n.length > 0)
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Format joined date
    const joinedDate = activeProfile?.created_at 
        ? new Date(activeProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'March 2026';

    useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible, slideAnim]);

    const switchPortal = async (portal: 'buyer' | 'delivery' | 'merchant') => {
        onClose();
        await setLastPortal(portal);
        localRouter.replace(`/${portal}` as any);
    };



    const navigateTo = (route: string) => {
        onClose();
        if (pathname === route) return;
        localRouter.push(route as any);
    };

    const isActive = (route: string) => pathname === route;

    if (!isVisible && (slideAnim as any)._value === -width) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlayContainer}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.menuPanel,
                        { transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.userInfoRow}
                            onPress={() => {
                                onClose();
                                if (isLoanPortal) {
                                    localRouter.push('/(loan)/business-profile');
                                } else {
                                    localRouter.push('/(vendor)/business-profile');
                                }
                            }}
                        >
                            <Avatar alt={displayName} style={styles.avatarContainer}>
                                <AvatarImage source={{ uri: getAvatarUrl(logoUrl, displayName) }} />
                                <AvatarFallback style={styles.avatarFallback}>
                                    <Text style={styles.avatarInitials}>{initials}</Text>
                                </AvatarFallback>
                            </Avatar>
                            <View style={styles.userDetails}>
                                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                                <View style={styles.joinedRow}>
                                    <Briefcase size={12} color="#6B7280" style={{ marginRight: 6 }} />
                                    <Text style={styles.joinedText}>{t('common.joined')} {joinedDate}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.navContainer}>
                        <TouchableOpacity 
                            style={[styles.navItem, isActive(isLoanPortal ? '/(loan)' : '/(vendor)') && styles.activeNavItem]}
                            onPress={() => navigateTo(isLoanPortal ? '/(loan)' : '/(vendor)')}
                        >
                            <LayoutGrid size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                            <Text style={[styles.navText, isActive(isLoanPortal ? '/(loan)' : '/(vendor)') && styles.activeNavText]}>{t('vendor.navigation.dashboard')}</Text>
                        </TouchableOpacity>

                        {!isLoanPortal && (
                            <>
                                <TouchableOpacity 
                                    style={[styles.navItem, isActive('/(vendor)/inventory') && styles.activeNavItem]}
                                    onPress={() => navigateTo('/(vendor)/inventory')}
                                >
                                    <Box size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                                    <Text style={[styles.navText, isActive('/(vendor)/inventory') && styles.activeNavText]}>{t('vendor.navigation.inventory')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.navItem, isActive('/(vendor)/live-orders') && styles.activeNavItem]}
                                    onPress={() => navigateTo('/(vendor)/live-orders')}
                                >
                                    <Box size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                                    <Text style={[styles.navText, isActive('/(vendor)/live-orders') && styles.activeNavText]}>{t('vendor.navigation.orders_sales')}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {isLoanPortal && (
                            <TouchableOpacity 
                                style={[styles.navItem, isActive('/(loan)/analytics') && styles.activeNavItem]}
                                onPress={() => navigateTo('/(loan)/analytics')}
                            >
                                <TrendingUp size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                                <Text style={[styles.navText, isActive('/(loan)/analytics') && styles.activeNavText]}>Analytics</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                            style={[styles.navItem, isActive(isLoanPortal ? '/(loan)/business-profile' : '/(vendor)/business-profile') && styles.activeNavItem]}
                            onPress={() => navigateTo(isLoanPortal ? '/(loan)/business-profile' : '/(vendor)/business-profile')}
                        >
                            <User size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                            <Text style={[styles.navText, isActive(isLoanPortal ? '/(loan)/business-profile' : '/(vendor)/business-profile') && styles.activeNavText]}>{t('vendor.navigation.customer_profile')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.navItemRow, (isActive('/(vendor)/loan-services') || isActive('/(loan)/requests') || isActive('/(loan)/collections') || isLoansExpanded) && styles.activeNavItem]}
                            onPress={() => setIsLoansExpanded(!isLoansExpanded)}
                        >
                            <View style={styles.navItemLeft}>
                                <Wallet size={22} color="#111827" strokeWidth={1.5} style={styles.navIcon} />
                                <Text style={[styles.navText, (isActive('/(vendor)/loan-services') || isActive('/(loan)/requests') || isActive('/(loan)/collections') || isLoansExpanded) && styles.activeNavText]}>{t('vendor.loans.title')}</Text>
                            </View>
                            <ChevronDown size={20} color="#111827" style={{ transform: [{ rotate: isLoansExpanded ? '180deg' : '0deg' }] }} />
                        </TouchableOpacity>
                        
                        {isLoansExpanded && (
                            <View style={styles.submenuContainer}>
                                <TouchableOpacity 
                                    style={[
                                        styles.submenuItem, 
                                        isActive(isLoanPortal ? '/(loan)/requests' : '/(vendor)/loan-services') && styles.activeSubmenuItem
                                    ]}
                                    onPress={() => navigateTo(isLoanPortal ? '/(loan)/requests' : '/(vendor)/loan-services')}
                                >
                                    <Text style={[
                                        styles.submenuText, 
                                        isActive(isLoanPortal ? '/(loan)/requests' : '/(vendor)/loan-services') && styles.activeSubmenuText
                                    ]}>{t('vendor.loans.loans_request')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.submenuItem, 
                                        isActive(isLoanPortal ? '/(loan)/collections' : '/(vendor)/loan-repayments') && styles.activeSubmenuItem
                                    ]}
                                    onPress={() => navigateTo(isLoanPortal ? '/(loan)/collections' : '/(vendor)/loan-repayments')}
                                >
                                    <Text style={[
                                        styles.submenuText, 
                                        isActive(isLoanPortal ? '/(loan)/collections' : '/(vendor)/loan-repayments') && styles.activeSubmenuText
                                    ]}>{t('vendor.loans.repayments_track')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}


                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuPanel: {
        width: width * 0.8,
        maxWidth: 320,
        height: '100%',
        backgroundColor: '#FFFFFF',
        paddingTop: 60,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#3A5BA9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
        marginHorizontal: 16,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 16,
        marginBottom: 8,
    },
    userDetails: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    joinedRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    joinedText: {
        fontSize: 12,
        color: '#111827',
    },
    moreButton: {
        padding: 4,
    },
    navContainer: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    activeNavItem: {
        backgroundColor: '#EEF2FF',
    },
    navItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    navItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navIcon: {
        marginRight: 12,
    },
    navText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    activeNavText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    },
    submenuContainer: {
        paddingLeft: 44,
        marginBottom: 8,
    },
    submenuItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    activeSubmenuItem: {
        backgroundColor: '#EEF2FF',
    },
    submenuText: {
        fontSize: 14,
        color: '#4B5563',
    },
    activeSubmenuText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    }
});
