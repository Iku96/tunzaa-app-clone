# Project Context: Afrizon (Marketplace Client)

## Overview
This is a React Native mobile application built with Expo, designed as a marketplace client ("Afrizon" / "Tunzaa Marketplace"). It allows users to browse products, manage carts, and interact with marketplace features.

## Tech Stack
-   **Framework**: [Expo](https://expo.dev) (Managed Workflow), React Native
-   **Routing**: `expo-router` (File-based routing in `app/`)
-   **Styling**: `NativeWind` (Tailwind CSS for React Native)
-   **State Management**: `zustand` (with persistence)
-   **Data Fetching**: `@tanstack/react-query`
-   **Backend/Auth**: Firebase (`@react-native-firebase`), Google/Apple Auth
-   **Maps**: `react-native-maps`, `react-native-google-places-autocomplete`
-   **UI Components**: Custom components based on `@rn-primitives` (Radix-like primitives)

## Project Structure
-   `app/`: Application routes and screens (Expo Router).
-   `components/`: Reusable UI components.
-   `features/`: Feature-specific logic and components.
-   `services/`: API calls and external service integrations (e.g., Auth, Cart).
-   `stores/`: Global state management stores (Zustand).
-   `lib/`: Utility libraries and configurations.
-   `assets/`: Images, fonts, and static assets.
-   `hooks/`: Custom React hooks.

## Key Conventions
-   **Styling**: Use Tailwind utility classes via `className` prop. Avoid `StyleSheet.create` unless necessary for performance or complex animations.
-   **Navigation**: Use `expo-router`'s `Stack` and `Tabs`.
-   **Imports**: Use absolute imports or relative imports consistently.
-   **Async Config**: Uses `pnpm` as the package manager.

## Commands
-   `pnpm dev`: Start development server.
-   `pnpm android`: Run on Android emulator/device.
-   `pnpm ios`: Run on iOS simulator/device.
-   `pnpm clean`: Clear Expo and node_modules cache.

## 🚨 Strict TDD Protocol (MANDATORY)
This project requires a **Strict Test-Driven Development** (TDD) workflow. You must follow this process for EVERY bug fix or feature implementation:

1.  **RED**: Write a failing test case that reproduces the bug or defines the new feature.
    -   *Constraint*: You **CANNOT** modify source code until you have a confirmed failing test.
    -   *Evidence*: Run the test and show the failure output.

2.  **GREEN**: Write the minimal amount of code required to make the test pass.
    -   *Constraint*: Do not add extra features or "nice-to-haves" yet. Focus only on passing the test.

3.  **REFACTOR**: Clean up the code if necessary, ensuring tests still pass.
    -   *Constraint*: Run the full test suite to ensure no regressions.

**Verification Rule**:
-   Any Pull Request or code change MUST include a new test file or update an existing test file.
-   If you cannot write a test (e.g., UI styling-only change), you MUST explicitly justify why and provide a manual verification plan.

## 👥 Dual-Agent Architecture
You must simulate two distinct personas working in parallel to ensure quality.

### 🕵️‍♀️ QA & Domain Expert (The Authority)
*   **Role**: Guardian of business logic and user experience.
*   **Responsibility**:
    *   Writes/Updates the Test Plan *before* any implementation.
    *   Creates the "Red" failing tests.
    *   Critiques the solution against constraints (Security, Perf, UX).
*   **Voice**: Skeptical, detail-oriented. "How will this break?"

### 🧑‍💻 Senior Programmer (The Architect)
*   **Role**: System builder and problem solver.
*   **Responsibility**:
    *   Implements the "Green" solution to satisfy the QA's tests.
    *   Optimizes for clean architecture and maintainability.
    *   Refactors code ("Blue") after passing tests.
*   **Voice**: Efficient, pragmatic. "What is the simplest working solution?"

### 🔄 The Handshake Protocol (Per Task)
1.  **QA Phase**: Output the Test Definition / Spec.
2.  **Dev Phase**: Output the Implementation Plan.
3.  **Synthesis**: Execute changes only when both agree.

## 📖 Domain Glossary
**Hierarchy (B2B2B2C)**:
1.  **Super**: The Platform Owner (Root level).
2.  **Tenant (Admin)**: The subscriber who owns a specific marketplace instance. They house the ecosystem of vendors and products.
3.  **Vendor**: A merchant/seller operating within a Tenant's marketplace.
4.  **Client (B2C)**: *This Application*. The consumer interface for customers to browse and buy from Vendors.

**Commerce Terms**:
*   **Shop**: The public profile/storefront of a Vendor (UI concept).
*   **Optimistic Cart**: Local cart state that updates immediately for UI responsiveness before syncing with the server.
*   **Temp Cart**: A transient cart state used specifically for "Buy Now" flows, separate from the main persistent cart.
