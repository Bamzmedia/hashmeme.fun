import { useState, useEffect } from 'react';
import { MirrorNodeService } from '@/services/MirrorNodeService';

export interface TrendingToken {
    token_id: string;
    name: string;
    symbol: string;
    total_supply: string;
    image: string;
    priceSparkline: number[];
}

export function useTrendingTokens() {
    const [tokens, setTokens] = useState<TrendingToken[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const mirrorService = MirrorNodeService.getInstance();
                const rawTokens = await mirrorService.getTrendingTokens(10);
                
                if (!rawTokens || rawTokens.length === 0) {
                    setTokens([]);
                    return;
                }
                
                const mappedTokens = rawTokens.map((t: any, index: number) => {
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
                setTokens([]); // Empty as requested
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
        const interval = setInterval(fetchTokens, 30000);
        return () => clearInterval(interval);

    }, []);

    return { tokens, loading };
}
