# Afrizon (Tunzaa Marketplace Client)

A professional React Native mobile application built with Expo, serving as the client interface for the Tunzaa Marketplace ecosystem. It enables customers to browse products, manage carts, and interact with various vendors within a multi-tenant marketplace.

---

## 🚀 Tech Stack

- **Framework**: [Expo](https://expo.dev) (Managed Workflow) / React Native
- **Routing**: `expo-router` (File-based routing)
- **Styling**: `NativeWind` (Tailwind CSS for React Native)
- **State Management**: `zustand` (with persistence)
- **Data Fetching**: `@tanstack/react-query`
- **Backend/Auth**: Firebase (`@react-native-firebase`), Google/Apple Auth
- **Maps**: `react-native-maps`, `react-native-google-places-autocomplete`
- **UI Components**: Custom components based on `@rn-primitives` (Radix-inspired)
- **Package Manager**: `pnpm`

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- [pnpm](https://pnpm.io/installation)
- Expo Go (for physical device testing) or Android/iOS Emulator

### Installation
```bash
# Install dependencies
pnpm install
```

### Development
```bash
# Start development server
pnpm dev

# Run on Android
pnpm android

# Run on iOS
pnpm ios
```

---

## 📂 Project Structure

- `app/`: Application routes and screens (Expo Router).
- `components/`: Reusable UI components (Atomic design).
- `features/`: Feature-specific logic, components, and hooks.
- `services/`: API calls and external service integrations (Auth, Cart, Firebase).
- `stores/`: Global state management using Zustand.
- `lib/`: Utility libraries and configurations (Tailwind, Axios).
- `assets/`: Images, fonts, and static assets.
- `hooks/`: Shared custom React hooks.
- `utils/`: Helper functions and constants.

---

## 🚨 Strict TDD Protocol (MANDATORY)

This project strictly follows a **Test-Driven Development** (TDD) workflow. No source code changes are allowed without a corresponding failing test.

1. **RED**: Write a failing test case that reproduces the bug or defines the new feature.
2. **GREEN**: Write the minimal amount of code required to make the test pass.
3. **REFACTOR**: Clean up the code ensuring tests still pass.

---

## 👥 Dual-Agent Architecture

We use a two-persona system to ensure code quality and business logic integrity:

### 🕵️‍♀️ QA & Domain Expert
- Defines the test plan and writes "Red" tests.
- Critiques solutions against Security, Performance, and UX constraints.

### 🧑‍💻 Senior Programmer
- Implements the "Green" solution.
- Optimizes for architecture and maintainability.
- Performs "Blue" refactoring.

---

## 📖 Domain Glossary

### Hierarchy (B2B2B2C)
- **Super**: The Platform Owner (Root level).
- **Tenant (Admin)**: The subscriber who owns a specific marketplace instance.
- **Vendor**: A merchant operating within a Tenant's marketplace.
- **Client (B2C)**: *This Application*. The interface for end-consumers.

### Commerce Terms
- **Shop**: The public profile/storefront of a Vendor.
- **Optimistic Cart**: Local cart state that updates immediately for responsiveness.
- **Temp Cart**: Transient cart state used specifically for "Buy Now" flows.

---

## 🔧 Environment Variables

Create a `.env` file in the root directory and add the necessary configuration (see `.env.example` if available).

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```
