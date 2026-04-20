import { useState, useEffect, useCallback } from 'react';
import { MirrorNodeService } from '@/services/MirrorNodeService';

export interface TrendingToken {
    token_id: string;
    name: string;
    symbol: string;
    total_supply: string;
    image: string;
    priceSparkline: number[];
}

export type TokenFilter = 'all' | 'hot';

export function useTrendingTokens(initialFilter: TokenFilter = 'all') {
    const [tokens, setTokens] = useState<TrendingToken[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<TokenFilter>(initialFilter);

    const fetchTokens = useCallback(async () => {
        setLoading(true);
        try {
            const mirrorService = MirrorNodeService.getInstance();
            
            // 1. Determine local limit for the fetch
            // For 'hot', we fetch more to perform a better sort by supply/volume
            const fetchLimit = filter === 'hot' ? 100 : 20;
            const rawTokens = await mirrorService.getTrendingTokens(fetchLimit);
            
            if (!rawTokens || rawTokens.length === 0) {
                setTokens([]);
                return;
            }
            
            // 2. Perform Filtering Logic
            let processedTokens = [...rawTokens];
            
            if (filter === 'hot') {
                // Sort by total_supply descending for 'Hot' memes
                processedTokens.sort((a: any, b: any) => {
                    const supplyA = BigInt(a.total_supply || 0);
                    const supplyB = BigInt(b.total_supply || 0);
                    return supplyA > supplyB ? -1 : (supplyA < supplyB ? 1 : 0);
                });
                // Take top 20 after sorting
                processedTokens = processedTokens.slice(0, 20);
            }

            // 3. Map to UI Model
            const mappedTokens = processedTokens.map((t: any, index: number) => {
                const customAssets = ['/memes/doge.png', '/memes/pepe.png', '/memes/cat.png', '/memes/rocket.png'];
                let imageLink = customAssets[index % customAssets.length];

                if (t.memo && t.memo.startsWith('ipfs://')) {
                    const cid = t.memo.replace('ipfs://', '');
                    imageLink = `https://ipfs.io/ipfs/${cid}`;
                }

                return {
                    token_id: t.token_id,
                    name: t.name || 'Unknown',
                    symbol: t.symbol || 'UNK',
                    total_supply: t.total_supply,
                    image: imageLink,
                    priceSparkline: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
                };
            });

            setTokens(mappedTokens);
        } catch (err) {
            console.error("Mirror node fetch failed in hook:", err);
            setTokens([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchTokens();
        // Polling interval
        const interval = setInterval(fetchTokens, 30000);
        return () => clearInterval(interval);
    }, [fetchTokens]);

    return { tokens, loading, filter, setFilter, refresh: fetchTokens };
}
