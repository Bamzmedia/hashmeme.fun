'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { getHederaId } from '@/utils/hederaUtils';

export function useHederaAccount() {
    const { address, isConnected, status } = useAccount();
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        const resolveId = async () => {
            if (isConnected && address) {
                setIsResolving(true);
                const id = await getHederaId(address);
                setAccountId(id);
                setIsResolving(false);
            } else {
                setAccountId(null);
            }
        };
        
        resolveId();
    }, [address, isConnected]);

    return {
        address,
        accountId,
        isConnected,
        status,
        isResolving
    };
}
