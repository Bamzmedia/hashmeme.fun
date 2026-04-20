import { useState, useEffect } from 'react';

export interface TrendingToken {
    token_id: string;
    name: string;
    symbol: string;
    total_supply: string;
    image: string;
    priceSparkline: number[]; // Added for the premium UI trend line
}

export function useTrendingTokens() {
    const [tokens, setTokens] = useState<TrendingToken[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                // Fetch the 10 most recent tokens created on Hedera Testnet
                const response = await fetch('https://testnet.mirrornode.hedera.com/api/v1/tokens?limit=10&order=desc');
                
                if (!response.ok) {
                    throw new Error("Mirror node rate limit or failure");
                }
                
                const data = await response.json();
                
                const mappedTokens = data.tokens.map((t: any, index: number) => {
                    // Extract IPFS hash from memo if standard was followed, otherwise use fallback from our custom assets
                    const customAssets = ['/memes/doge.png', '/memes/pepe.png', '/memes/cat.png', '/memes/rocket.png'];
                    let imageLink = customAssets[index % customAssets.length];

                    if (t.memo && t.memo.startsWith('ipfs://')) {
                        const cid = t.memo.replace('ipfs://', '');
                        imageLink = `https://ipfs.io/ipfs/${cid}`;
                    }

                    // Generate a random sparkline for the premium vibe
                    const sparkline = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));

                    return {
                        token_id: t.token_id,
                        name: t.name || 'Unknown',
                        symbol: t.symbol || 'UNK',
                        total_supply: t.total_supply,
                        image: imageLink,
                        priceSparkline: sparkline
                    };
                });

                setTokens(mappedTokens);
            } catch (err) {
                console.warn("Mirror node failed, using fallback mock data Data", err);
                // Fallback Mock Data so UI doesn't break during demos/rate-limits
                setTokens([
                    { token_id: "0.0.123456", name: "Space Doge", symbol: "DOGE", total_supply: "1000000000", image: "/memes/doge.png", priceSparkline: [10, 40, 30, 70, 50, 90, 80, 100, 90, 110] },
                    { token_id: "0.0.765432", name: "Cyber Pepe", symbol: "PEPE", total_supply: "420690000", image: "/memes/pepe.png", priceSparkline: [20, 10, 40, 20, 60, 50, 80, 70, 90, 85] },
                    { token_id: "0.0.323232", name: "Neon Cat", symbol: "CAT", total_supply: "5000000000", image: "/memes/cat.png", priceSparkline: [50, 40, 60, 50, 70, 60, 80, 75, 95, 100] },
                    { token_id: "0.0.999999", name: "Moon Rocket", symbol: "MOON", total_supply: "100000", image: "/memes/rocket.png", priceSparkline: [10, 20, 40, 60, 80, 100, 120, 150, 180, 250] },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
        
        // Optional: refresh every 30s
        const interval = setInterval(fetchTokens, 30000);
        return () => clearInterval(interval);

    }, []);

    return { tokens, loading };
}
