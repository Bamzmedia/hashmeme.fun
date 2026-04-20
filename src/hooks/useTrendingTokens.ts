import { useState, useEffect } from 'react';

export interface TrendingToken {
    token_id: string;
    name: string;
    symbol: string;
    total_supply: string;
    image: string;
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
                
                const mappedTokens = data.tokens.map((t: any) => {
                    // Extract IPFS hash from memo if standard was followed, otherwise use fallback gradient
                    let imageLink = 'https://grainy-gradients.vercel.app/noise.svg';
                    if (t.memo && t.memo.startsWith('ipfs://')) {
                        const cid = t.memo.replace('ipfs://', '');
                        imageLink = `https://ipfs.io/ipfs/${cid}`;
                    }

                    return {
                        token_id: t.token_id,
                        name: t.name || 'Unknown',
                        symbol: t.symbol || 'UNK',
                        total_supply: t.total_supply,
                        image: imageLink
                    };
                });

                setTokens(mappedTokens);
            } catch (err) {
                console.warn("Mirror node failed, using fallback mock data Data", err);
                // Fallback Mock Data so UI doesn't break during demos/rate-limits
                setTokens([
                    { token_id: "0.0.123456", name: "DogeMeme", symbol: "DOGE", total_supply: "1000000000", image: "https://cryptologos.cc/logos/dogecoin-doge-logo.png" },
                    { token_id: "0.0.765432", name: "PepeToken", symbol: "PEPE", total_supply: "420690000", image: "https://cryptologos.cc/logos/pepe-pepe-logo.png" },
                    { token_id: "0.0.323232", name: "ShibaHedera", symbol: "SHIB", total_supply: "5000000000", image: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png" },
                    { token_id: "0.0.999999", name: "HBARBarian", symbol: "HBARB", total_supply: "100000", image: "https://cryptologos.cc/logos/hedera-hbar-logo.png" },
                    { token_id: "0.0.888888", name: "Wojak", symbol: "WOJ", total_supply: "10000", image: "https://grainy-gradients.vercel.app/noise.svg" },
                    { token_id: "0.0.777777", name: "Floki", symbol: "FLOKI", total_supply: "25000000", image: "https://cryptologos.cc/logos/floki-inu-floki-logo.png" }
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
