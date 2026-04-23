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

// 5. Build Metadata (Requirement: Fully Populated)
const metadata = {
    name: "GlowSwap Protocol",
    description: "Institutional-grade DeFi & Meme Launchpad on Hedera",
    url: "https://glowswap.vercel.app",
    icons: ["https://glowswap.vercel.app/logo.png", "https://glowswap.vercel.app/favicon.ico"]
};

// 6. Initialize AppKit
createAppKit({
    adapters: [wagmiAdapter],
    networks: [hedera, hederaTestnet],
    projectId,
    metadata,
    features: {
        analytics: true,
        email: false,
        socials: [],
    },
    themeMode: 'dark',
    featuredWalletIds: [
        'bf33f7f2057d4a37bffbc1ca37599026', // HashPack
        '22515b7c7b744d0a80e698380e227092'  // Blade
    ],
    // OPTIONAL NAMESPACES for Hedera native methods
    ...({
        optionalNamespaces: {
            hedera: {
                methods: [
                    'hedera_signAndExecuteTransaction',
                    'hedera_signTransaction',
                    'hedera_signMessage'
                ],
                chains: ['hedera:mainnet', 'hedera:testnet'],
                events: ['chainChanged', 'accountsChanged']
            }
        }
    } as any)
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
