# AIQX Labs Web3 Token Platform - Design Guidelines

## Design Approach: Web3-Optimized Design System

**Selected Approach**: Hybrid system drawing from established Web3 platforms (Uniswap, Etherscan, Remix) with Material Design foundations for data-dense interfaces.

**Key Principles**: 
- Trust and transparency through clear visual hierarchy
- Information density without overwhelming users
- Blockchain-themed aesthetics with professional credibility
- Real-time feedback for critical blockchain operations

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (Default):
- Background Base: 220 20% 8%
- Background Elevated: 220 18% 12%
- Background Interactive: 220 16% 16%
- Primary Brand (AIQX Blue): 210 100% 55%
- Primary Hover: 210 100% 60%
- Success (Transaction): 142 76% 45%
- Warning (Gas Fees): 38 92% 50%
- Error (Failed): 0 84% 60%
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Border Subtle: 220 15% 20%

**Light Mode**:
- Background: 0 0% 100%
- Elevated: 220 20% 97%
- Primary: 210 100% 50%
- Text: 220 20% 10%

**Accent Colors**:
- Blockchain Green (Ethereum): 120 100% 35%
- Chain Orange (BSC): 30 100% 50%
- Chain Purple (Polygon): 270 70% 55%

### B. Typography

**Font Stack**:
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts)
- Monospace (Contract addresses, hashes): 'JetBrains Mono', 'Fira Code', monospace

**Hierarchy**:
- Hero Headline: 3.5rem (56px), 700 weight, -0.02em tracking
- Section Titles: 2rem (32px), 600 weight
- Card Headers: 1.25rem (20px), 600 weight
- Body Text: 1rem (16px), 400 weight
- Small/Meta: 0.875rem (14px), 400 weight
- Contract Data: 0.875rem (14px), 500 weight, monospace

### C. Layout System

**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12, 16
- Component padding: p-6, p-8
- Section spacing: py-16, py-20
- Card gaps: gap-4, gap-6
- Form fields: space-y-6

**Grid Structure**:
- Container: max-w-7xl with px-6
- Dashboard: 12-column grid with gap-6
- Token cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

### D. Component Library

**Navigation**:
- Fixed top header with glassmorphism effect (backdrop-blur-xl bg-background/80)
- Wallet connection button prominently in top-right
- Network selector dropdown with chain icons
- Mobile: Bottom navigation for key actions

**Data Display**:
- Token cards with elevated backgrounds, border-l-4 colored by blockchain
- Transaction status pills with animated loading states
- Contract address with copy-to-clipboard interaction
- Gas fee estimator with real-time updates in warning color

**Forms**:
- Large, clearly labeled input fields with dark backgrounds
- Token parameter inputs grouped logically (Identity, Supply, Features)
- Blockchain network selector with visual chain logos
- Token type cards (Standard, Mintable, Burnable, Taxable) with feature checkboxes

**Feedback Components**:
- Toast notifications for transactions (top-right, auto-dismiss)
- Deployment progress stepper with current status highlighted
- Loading states with blockchain-themed spinner animations
- Success/error modals with appropriate color coding

**Dashboard Elements**:
- Deployed tokens table with sortable columns
- Quick action buttons for each token (View, Manage, Verify)
- Transaction history timeline with status indicators
- Network stats cards showing gas prices and block numbers

### E. Web3-Specific Patterns

**Wallet Connection**:
- Prominent "Connect Wallet" button with gradient background
- Wallet modal showing available providers (MetaMask, WalletConnect, Coinbase)
- Connected state shows truncated address with identicon
- Network mismatch warnings with switch network prompt

**Blockchain Visual Language**:
- Hexagonal shapes for blockchain-related elements
- Subtle grid patterns in backgrounds suggesting network nodes
- Animated gradient borders for active deployment states
- Chain-specific color coding consistently applied

**Trust Indicators**:
- Security badge icons for audited contract templates
- Transaction confirmation counts prominently displayed
- Gas price indicators with color-coded urgency
- Contract verification status clearly shown

## Images

**Hero Section**: 
Full-width abstract visualization of interconnected blockchain nodes with gradient overlay (210 100% 55% to 270 70% 55%). Image should convey technology, connectivity, and trustworthiness. Place AIQX Labs branding and "Create Tokens Across Multiple Blockchains" headline centered over the image with blurred button backgrounds for CTAs.

**Feature Icons**: 
Use Material Icons or Heroicons for UI elements (wallet, check marks, chains, etc.)

**Chain Logos**: 
Include official blockchain logos (Ethereum, BSC, Polygon, Arbitrum, Base) for network selectors and token cards

**Empty States**: 
Abstract blockchain illustrations for "No tokens deployed yet" states

## Interaction Patterns

- Micro-interactions on wallet connect (scale + glow effect)
- Deployment progress with animated blockchain confirmations
- Real-time gas price updates with smooth number transitions
- Hover states reveal additional token details in cards
- Form validation with inline, immediate feedback
- Success celebrations for completed deployments (subtle confetti or checkmark animation)

This design creates a professional, trustworthy Web3 platform that balances technical complexity with user-friendly interfaces, ensuring both crypto-native users and newcomers can confidently create and manage tokens.