/**
 * SaucerSwapService Singleton
 * Handles price and volume data from the SaucerSwap DEX API.
 */
export class SaucerSwapService {
    private static instance: SaucerSwapService;
    private baseUrl: string = 'https://testnet-api.saucerswap.finance';

    private constructor() {}

    public static getInstance(): SaucerSwapService {
        if (!SaucerSwapService.instance) {
            SaucerSwapService.instance = new SaucerSwapService();
        }
        return SaucerSwapService.instance;
    }

    /**
     * Get real-time price metrics for all tokens on the DEX
     */
    public async getTokenMetrics() {
        try {
            const response = await fetch(`${this.baseUrl}/tokens`);
            if (!response.ok) throw new Error("SaucerSwap metrics fetch failed");
            return await response.json();
        } catch (error) {
            console.error("Error fetching SaucerSwap metrics:", error);
            return [];
        }
    }

    /**
     * Helper to get price for a specific token ID
     */
    public async getTokenPrice(tokenId: string) {
        const metrics = await this.getTokenMetrics();
        const token = metrics.find((t: any) => t.id === tokenId);
        
        if (token) {
            return {
                priceUsd: token.priceUsd,
                priceChange24h: token.priceChange24h,
                volume24h: token.volume24hUsd
            };
        }
        
        // Fallback for new tokens
        return {
            priceUsd: 0.0000001, // Mock launch price for brand new tokens
            priceChange24h: 0,
            volume24h: 0
        };
    }
}
