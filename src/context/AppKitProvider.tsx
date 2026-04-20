'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hedera, hederaTestnet } from '@reown/appkit/networks';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';

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

// 5. Create AppKit
createAppKit({
    adapters: [wagmiAdapter],
    networks: [hedera, hederaTestnet],
    projectId,
    features: {
        analytics: true,
        email: false,
        socials: false,
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#6366f1', // Indigo-500
        '--w3m-border-radius-master': '1px',
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
