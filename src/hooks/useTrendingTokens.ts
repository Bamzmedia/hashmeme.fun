import { useState, useEffect, useCallback } from 'react';
import { MirrorNodeService } from '@/services/MirrorNodeService';
import { SaucerSwapService } from '@/services/SaucerSwapService';

export interface TrendingToken {
    token_id: string;
    name: string;
    symbol: string;
    total_supply: string;
    image: string;
    priceUsd: number;
    priceChange24h: number;
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
            const saucerService = SaucerSwapService.getInstance();
            
            // 1. Parallel fetch of tokens and DEX metrics
            const fetchLimit = filter === 'hot' ? 100 : 20;
            const [rawTokens, dexMetrics] = await Promise.all([
                mirrorService.getTrendingTokens(fetchLimit),
                saucerService.getTokenMetrics()
            ]);
            
            if (!rawTokens || rawTokens.length === 0) {
                setTokens([]);
                return;
            }
            
            // 2. Sorting Logic
            let processedTokens = [...rawTokens];
            if (filter === 'hot') {
                processedTokens.sort((a: any, b: any) => {
                    const supplyA = BigInt(a.total_supply || 0);
                    const supplyB = BigInt(b.total_supply || 0);
                    return supplyA > supplyB ? -1 : (supplyA < supplyB ? 1 : 0);
                });
                processedTokens = processedTokens.slice(0, 20);
            }

            // 3. Merging mirror data with DEX pricing
            const mappedTokens = processedTokens.map((t: any, index: number) => {
                const customAssets = ['/memes/doge.png', '/memes/pepe.png', '/memes/cat.png', '/memes/rocket.png'];
                let imageLink = customAssets[index % customAssets.length];

                if (t.memo && t.memo.startsWith('ipfs://')) {
                    const cid = t.memo.replace('ipfs://', '');
                    imageLink = `https://ipfs.io/ipfs/${cid}`;
                }

                // Match with DEX data
                const dexData = dexMetrics.find((m: any) => m.id === t.token_id);
                const priceUsd = dexData ? Number(dexData.priceUsd) : 0.0000001;
                const priceChange = dexData ? Number(dexData.priceChange24h) : 0;

                return {
                    token_id: t.token_id,
                    name: t.name || 'Unknown',
                    symbol: t.symbol || 'UNK',
                    total_supply: t.total_supply,
                    image: imageLink,
                    priceUsd,
                    priceChange24h: priceChange,
                    priceSparkline: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
                };
            });

            setTokens(mappedTokens);
        } catch (err) {
            console.error("Data merge failed in hook:", err);
            setTokens([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchTokens();
        const interval = setInterval(fetchTokens, 60000); // 1 minute price refresh
        return () => clearInterval(interval);
    }, [fetchTokens]);

    return { tokens, loading, filter, setFilter, refresh: fetchTokens };
}
