# Afrizon Marketplace - Technical Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Core Systems](#core-systems)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Authentication & Security](#authentication--security)
9. [UI/UX Architecture](#uiux-architecture)
10. [Development Workflow](#development-workflow)
11. [Deployment & Build](#deployment--build)
12. [Testing Strategy](#testing-strategy)
13. [Performance Considerations](#performance-considerations)
14. [Key Dependencies](#key-dependencies)
15. [Environment Configuration](#environment-configuration)
16. [Troubleshooting Guide](#troubleshooting-guide)

---

## Project Overview

**Afrizon Marketplace** is a React Native mobile application built with Expo, serving as a B2B2B2C marketplace client. The platform enables consumers to browse products from multiple vendors within tenant-specific marketplaces, manage shopping carts, process payments, and handle deliveries.

### Business Model
The application follows a hierarchical marketplace structure:
- **Super**: Platform Owner (Root level)
- **Tenant**: Marketplace instance owners
- **Vendor**: Merchants operating within tenant marketplaces
- **Client**: End consumers (this application)

---

## Technology Stack

### Core Framework
- **React Native 0.79.6** with **Expo SDK 53** (Managed Workflow)
- **TypeScript** for type safety
- **Node.js** runtime environment

### Navigation & Routing
- **expo-router 5.1.11** - File-based routing system
- **React Navigation** for in-app navigation

### Styling & UI
- **NativeWind 4.1.23** - Tailwind CSS for React Native
- **TailwindCSS 3.3.5** with custom design system
- **@rn-primitives** - Radix-like UI component primitives
- **Lucide React Native** - Icon system

### State Management
- **Zustand 5.0.3** - Lightweight state management
- **zustand-persist** - State persistence
- **@tanstack/react-query 5.76.0** - Server state management

### Authentication & Backend
- **Firebase** (@react-native-firebase) - Authentication & Messaging
- **Google Sign-In** & **Apple Authentication** - Social auth
- **Axios** - HTTP client for API calls

### Maps & Location
- **react-native-maps 1.20.1** - Map display
- **expo-maps** - Enhanced map features
- **react-native-google-places-autocomplete** - Location search

### Development Tools
- **ESLint** & **TypeScript** - Code quality
- **Jest** - Testing framework
- **Bun** - Package manager

---

## Architecture Overview

### Application Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Screens (app/)    │  Components (components/)              │
│  - Routes          │  - Reusable UI Components              │
│  - Layouts         │  - Feature Components                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Services (services/) │  Stores (stores/)                   │
│  - API Integration    │  - State Management                 │
│  - External Services  │  - Persistence                      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth        │  REST APIs                          │
│  Local Storage        │  External Services                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns
- **Feature-based organization** with clear separation of concerns
- **Dependency injection** through React Context
- **Observer pattern** for state management (Zustand)
- **Repository pattern** for API services
- **Component composition** for UI building

---

## Project Structure

```
whitelabel-client/
├── app/                          # Expo Router screens & routes
│   ├── (auth)/                   # Authentication screens
│   ├── (buyer)/                  # Buyer-specific screens
│   ├── (delivery)/               # Delivery management
│   ├── (onboarding)/             # User onboarding
│   ├── (payment)/                # Payment processing
│   ├── (public)/                 # Public-facing screens
│   ├── (vendor)/                 # Vendor management
│   ├── (winga)/                  # Winga-specific features
│   └── _layout.tsx              # Root layout provider
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI primitives
│   ├── forms/                    # Form components
│   ├── modals/                   # Modal components
│   ├── layout/                   # Layout components
│   └── [feature]/               # Feature-specific components
├── services/                     # API & external services
│   ├── types/                    # TypeScript type definitions
│   ├── auth.ts                   # Authentication service
│   ├── cart.ts                   # Cart management
│   ├── orders.ts                 # Order processing
│   ├── payments.ts               # Payment integration
│   └── [service].ts             # Other service files
├── stores/                       # Zustand state stores
│   ├── auth.ts                   # Authentication state
│   ├── cart.ts                   # Cart state management
│   ├── orders.ts                 # Order state
│   └── [store].ts               # Other stores
├── lib/                          # Utility libraries
│   ├── constants.ts              # App constants
│   ├── react-query.ts            # Query client config
│   └── [utility].ts             # Other utilities
├── hooks/                        # Custom React hooks
├── features/                     # Feature-specific modules
├── context/                      # React Context providers
├── providers/                    # App-level providers
├── assets/                       # Static assets
├── locales/                      # Internationalization
└── config/                       # Configuration files
```

---

## Core Systems

### 1. Navigation System
**File**: `app/_layout.tsx`

The navigation uses Expo Router with file-based routing:
- **Route Groups**: Parenthesized folders for logical grouping
- **Dynamic Routes**: Support for parameterized routes
- **Deep Linking**: Configured for `afrizon://` scheme
- **Tab Navigation**: Bottom tabs for main sections
- **Stack Navigation**: Hierarchical navigation within sections

### 2. Authentication System
**Files**: `services/auth.ts`, `stores/auth.ts`

Multi-provider authentication:
- **Firebase Auth**: Primary authentication backend
- **Google Sign-In**: Social authentication
- **Apple Authentication**: iOS social auth
- **JWT Token Management**: Secure token storage and refresh
- **Role-based Access**: Buyer, Vendor, Admin roles

### 3. Cart Management
**Files**: `services/cart.ts`, `stores/cart.ts`

Advanced cart system:
- **Optimistic Updates**: Immediate UI response
- **Persistence**: Local storage with server sync
- **Multi-vendor Support**: Cart items from different vendors
- **Temp Cart**: "Buy Now" flow with separate cart state
- **Real-time Sync**: Server synchronization

### 4. Payment Processing
**Files**: `services/payments.ts`, `app/(payment)/*`

Integrated payment system:
- **Multiple Payment Methods**: Mobile money, cards, bank transfers
- **Installment Support**: "Winga" installment plans
- **Security**: PCI-compliant payment processing
- **Webhook Handling**: Payment status updates

---

## State Management

### Zustand Store Architecture
The application uses Zustand for state management with the following pattern:

```typescript
interface StoreState {
  // State properties
  data: any[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateData: (data: any[]) => void;
  clearError: () => void;
}

// Store with persistence
const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // implementation
    }),
    {
      name: 'store-name',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Key Stores
1. **auth.ts**: User authentication state
2. **cart.ts**: Shopping cart management
3. **orders.ts**: Order history and tracking
4. **shops.ts**: Vendor shop information
5. **preferences.ts**: User preferences and settings

### React Query Integration
Server state managed through React Query:
- **Caching**: Automatic data caching
- **Background Updates**: Real-time data synchronization
- **Error Handling**: Centralized error management
- **Pagination**: Infinite scroll and pagination support

---

## API Integration

### Service Layer Architecture
**Base Configuration**: `services/client.ts`

All API services follow a consistent pattern:
```typescript
export const apiService = {
  // Query hooks
  useGetData: (params, options) => {
    return useQuery({
      queryKey: ['endpoint', params],
      queryFn: () => apiClient.get('/endpoint', { params }),
      ...options
    });
  },
  
  // Mutation hooks
  useCreateData: () => {
    return useMutation({
      mutationFn: (data) => apiClient.post('/endpoint', data),
      onSuccess: () => {
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['endpoint'] });
      }
    });
  }
};
```

### API Services
1. **auth.ts**: Authentication endpoints
2. **products.ts**: Product catalog management
3. **orders.ts**: Order processing and tracking
4. **payments.ts**: Payment processing
5. **delivery.ts**: Delivery management
6. **vendors.ts**: Vendor management
7. **ratings.ts**: Review and rating system
8. **recommendations.ts**: Product recommendations

### Error Handling
**File**: `services/error-handler.ts`

Centralized error handling with:
- **HTTP Error Interception**: Automatic error response handling
- **User-friendly Messages**: Localized error messages
- **Retry Logic**: Automatic retry for failed requests
- **Logging**: Error tracking and reporting

---

## Authentication & Security

### Security Architecture
1. **Firebase Authentication**: Primary auth provider
2. **Token Management**: JWT tokens with refresh mechanism
3. **Secure Storage**: Expo SecureStore for sensitive data
4. **Role-based Access Control**: Permission-based feature access
5. **API Security**: Request signing and validation

### Authentication Flow
```
User Login → Firebase Auth → JWT Token → Secure Storage → API Requests
     ↓              ↓              ↓              ↓
Social Auth → Token Refresh → Background Sync → Error Handling
```

### Permission System
**File**: `lib/permissions.ts`

Role-based permissions:
- **Buyer**: Browse, purchase, review
- **Vendor**: Manage products, orders, shop
- **Admin**: Full marketplace management
- **Super**: Platform-level access

---

## UI/UX Architecture

### Design System
**File**: `tailwind.config.js`

Comprehensive design system with:
- **Color Palette**: Semantic color tokens
- **Typography**: Lato font family with responsive sizing
- **Spacing**: Consistent spacing scale
- **Component Variants**: Multiple component states
- **Dark Mode**: Automatic theme switching

### Component Architecture
**Base Components**: `components/ui/`

Component hierarchy:
```
Primitives (@rn-primitives)
    ↓
Base Components (Button, Input, Card)
    ↓
Feature Components (ProductCard, OrderItem)
    ↓
Screen Components (HomeScreen, CartScreen)
```

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Adaptive Layout**: Screen size adaptation
- **Platform-specific**: iOS/Android optimizations
- **Accessibility**: WCAG compliance

---

## Development Workflow

### TDD Protocol (Mandatory)
The project enforces strict Test-Driven Development:

1. **RED Phase**: Write failing test
2. **GREEN Phase**: Implement minimal code to pass
3. **REFACTOR Phase**: Clean up while maintaining tests

### Development Commands
```bash
# Development
pnpm dev              # Start development server
pnpm android          # Run on Android
pnpm ios              # Run on iOS
pnpm web              # Run on web

# Testing
pnpm test             # Run tests
pnpm lint             # Type checking

# Build
pnpm build            # Build for production
pnpm clean            # Clean cache
```

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

---

## Deployment & Build

### Build Configuration
**File**: `app.json`, `eas.json`

Expo Application Services (EAS) configuration:
- **Development**: Development builds
- **Preview**: Testing builds
- **Production**: App store builds

### Platform-specific Builds
**iOS**:
- Bundle ID: `africa.afrizon.gsm`
- Apple Team ID: `LLHL722QJ2`
- Associated Domains: `applinks:afrizon.africa`

**Android**:
- Package: `africa.afrizon.gsm`
- Target SDK: 35
- Permissions: Location, notifications, storage

### Environment Variables
**Files**: `.env`, `.env.example`

Environment configuration:
```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.afrizon.africa
EXPO_PUBLIC_ENVIRONMENT=production

# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id

# Google Services
GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## Testing Strategy

### Test Structure
```
stores/
└── __tests__/
    └── cart.test.ts    # Store tests
```

### Testing Tools
- **Jest**: Testing framework
- **React Native Testing Library**: Component testing
- **MSW**: API mocking
- **Detox**: E2E testing (optional)

### Test Coverage
- **Unit Tests**: Store logic, utilities
- **Integration Tests**: Component integration
- **E2E Tests**: Critical user flows
- **API Tests**: Service layer testing

---

## Performance Considerations

### Optimization Strategies
1. **Bundle Size**: Code splitting and lazy loading
2. **Image Optimization**: Expo Image with caching
3. **List Virtualization**: FlatList optimization
4. **State Management**: Efficient state updates
5. **Network Optimization**: Request deduplication

### Memory Management
- **Component Unmounting**: Proper cleanup
- **Image Caching**: Expo Image cache management
- **State Cleanup**: Store subscription management

### Performance Monitoring
- **React DevTools**: Component performance
- **Flipper**: Advanced debugging
- **Firebase Performance**: App performance monitoring

---

## Key Dependencies

### Core Dependencies
```json
{
  "expo": "~53.0.26",
  "react-native": "0.79.6",
  "react": "19.0.0",
  "typescript": "^5.8.3"
}
```

### Essential Libraries
- **@tanstack/react-query**: Server state
- **zustand**: Client state
- **nativewind**: Styling
- **expo-router**: Navigation
- **@react-native-firebase**: Backend services

### Development Dependencies
- **jest**: Testing
- **@testing-library/react-native**: Component testing
- **eslint**: Code quality
- **typescript**: Type checking

---

## Environment Configuration

### Development Setup
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd whitelabel-client
   ```

2. **Install Dependencies**
   ```bash
   bun install  # or pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development**
   ```bash
   bun run dev
   ```

### Required Services
- **Firebase Project**: Authentication and messaging
- **Google Maps API**: Location services
- **API Backend**: REST API endpoints
- **Push Notification Service**: Firebase Cloud Messaging

---

## Troubleshooting Guide

### Common Issues

#### 1. Metro Bundle Issues
```bash
# Clear cache
pnpm clean
rm -rf node_modules
bun install
```

#### 2. Firebase Configuration
- Verify `google-services.json` (Android)
- Verify `GoogleService-Info.plist` (iOS)
- Check Firebase project settings

#### 3. Navigation Issues
- Verify route file naming conventions
- Check `_layout.tsx` configuration
- Ensure proper route groups

#### 4. State Management Issues
- Check Zustand store subscriptions
- Verify persistence configuration
- Debug React Query cache

### Debug Tools
- **React Native Debugger**: State inspection
- **Flipper**: Advanced debugging
- **Expo Dev Tools**: Development utilities
- **Firebase Console**: Backend debugging

---

## Handover Checklist

### For New Development Team

#### Setup Requirements
- [ ] Node.js 18+ installed
- [ ] Bun or pnpm package manager
- [ ] Expo CLI installed
- [ ] Android Studio / Xcode for mobile development
- [ ] Firebase project access
- [ ] Google Maps API key

#### Access Requirements
- [ ] Git repository access
- [ ] Firebase console access
- [ ] API documentation
- [ ] Environment variables
- [ ] Deployment credentials

#### Knowledge Transfer
- [ ] Architecture walkthrough
- [ ] Codebase orientation
- [ ] Development environment setup
- [ ] Testing procedures
- [ ] Deployment process

#### Documentation Review
- [ ] API documentation
- [ ] Component library
- [ ] State management patterns
- [ ] Authentication flow
- [ ] Build and deployment guides

---

## Conclusion

This documentation provides a comprehensive overview of the Afrizon Marketplace application architecture. The codebase follows modern React Native development practices with a focus on maintainability, scalability, and performance.

For specific implementation details, refer to the inline code comments and the individual service documentation files within the `services/` directory.

**Last Updated**: February 2026
**Version**: 1.0.1
