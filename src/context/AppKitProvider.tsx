'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hedera, hederaTestnet } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// 1. Get projectId from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c1e7a61d8a8b2fc63d3de1e892c90c54';

// 2. Set up queryClient
const queryClient = new QueryClient();

// 3. Set up networks
const networks = [hedera, hederaTestnet];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    ssr: true
});

// Metadata for the dApp
const metadata = {
    name: "GlowSwap Protocol",
    description: "The Radiant Hub for Hedera Memes & Staking",
    url: "https://glowswap.vercel.app",
    icons: ["https://glowswap.vercel.app/logo.png"]
};

// 5. Create AppKit with Hedera Focus
createAppKit({
    adapters: [wagmiAdapter],
    networks: [hedera, hederaTestnet],
    projectId,
    metadata,
    features: {
        analytics: true,
        email: true,
        socials: ['google', 'x', 'apple', 'discord'],
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#3b82f6', // Blue-500
        '--w3m-border-radius-master': '20px',
    },
    // Feature Hedera wallets: HashPack and Blade
    featuredWalletIds: [
        'bf33f7f2057d4a37bffbc1ca37599026', // HashPack
        '22515b7c7b744d0a80e698380e227092'  // Blade
    ],
    // Ensure Hedera-specific JSON-RPC methods are enabled
    includeWalletConnectAdvisories: true,
    customNamespaces: {
        hedera: {
            methods: [
                'hedera_signAndExecuteTransaction',
                'hedera_signAndReturnTransaction',
                'hedera_signMessage'
            ],
            chains: ['hedera:mainnet', 'hedera:testnet'],
            events: ['chainChanged', 'accountsChanged']
        }
    }
});

export const AppKitProvider = ({ children }: { children: ReactNode }) => {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
