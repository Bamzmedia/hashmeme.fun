import { MirrorNodeService } from './MirrorNodeService';

/**
 * LedgerPriceService
 * Calculates real-time prices by querying on-chain reserves.
 */
export class LedgerPriceService {
    private static instance: LedgerPriceService;
    private mirror = MirrorNodeService.getInstance();
    private priceCache: Map<string, { price: number, timestamp: number }> = new Map();
    private poolCache: Map<string, string> = new Map();

    private constructor() {}

    public static getInstance(): LedgerPriceService {
        if (!LedgerPriceService.instance) {
            LedgerPriceService.instance = new LedgerPriceService();
        }
        return LedgerPriceService.instance;
    }

    /**
     * Get the USD price for a token by discovering its pool and reserves.
     */
    public async getTokenPrice(tokenId: string): Promise<number> {
        const now = Date.now();
        const cached = this.priceCache.get(tokenId);
        
        // Cache for 60 seconds
        if (cached && now - cached.timestamp < 60000) {
            return cached.price;
        }

        try {
            // 1. Get Network HBAR Rate
            const hbarRate = await this.mirror.getHbarPrice();

            // 2. Discover/Resolve Pool ID
            let poolId = this.poolCache.get(tokenId);
            if (!poolId) {
                poolId = await this.mirror.discoverPoolId(tokenId) || undefined;
                if (poolId) this.poolCache.set(tokenId, poolId);
            }

            // 3. If no pool, use Launch Price placeholder
            if (!poolId) {
                return 0.0000001; // Launch Price
            }

            // 4. Fetch Reserves
            const reserves = await this.mirror.getReserves(poolId, tokenId);
            
            if (reserves.token === 0n || reserves.hbar === 0n) {
                return 0.0000001; // Launch Price
            }

            // 5. Calculate Price: (HBAR / Token) * USD_Rate
            // We use BigInt for precision, keeping it simple for the UI
            const priceInHbar = Number(reserves.hbar) / Number(reserves.token);
            const priceInUsd = priceInHbar * hbarRate;

            this.priceCache.set(tokenId, { price: priceInUsd, timestamp: now });
            return priceInUsd;
        } catch (e) {
            console.error(`Price calculation failed for ${tokenId}`, e);
            return 0.0000001;
        }
    }

    /**
     * Bulk fetch prices for a list of tokens
     */
    public async getBulkPrices(tokenIds: string[]) {
        const results = await Promise.all(tokenIds.map(async id => {
            const price = await this.getTokenPrice(id);
            return { id, price };
        }));
        return results;
    }
}
