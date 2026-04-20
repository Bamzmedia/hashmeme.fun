/**
 * MirrorNodeService Singleton
 * Handles all communication with the Hedera Mirror Node.
 */
export class MirrorNodeService {
    private static instance: MirrorNodeService;
    private baseUrl: string;
    private whbarId: string = '0.0.15058'; // Testnet WHBAR

    private constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
    }

    public static getInstance(): MirrorNodeService {
        if (!MirrorNodeService.instance) {
            MirrorNodeService.instance = new MirrorNodeService();
        }
        return MirrorNodeService.instance;
    }

    /**
     * Get the latest HBAR exchange rate from the network
     */
    public async getHbarPrice() {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/network/exchangerate`);
            const data = await response.json();
            const rate = data.current_rate;
            // USD per HBAR = (Cent Equivalent / Hbar Equivalent) / 100
            return (rate.cent_equivalent / rate.hbar_equivalent) / 100;
        } catch (e) {
            console.error("Failed to fetch HBAR rate", e);
            return 0.1; // Fallback
        }
    }

    /**
     * Automatic Pool Discovery
     * Looks for the top holder of the token that is a contract AND holds WHBAR
     */
    public async discoverPoolId(tokenId: string): Promise<string | null> {
        try {
            // 1. Get top 10 holders
            const response = await fetch(`${this.baseUrl}/api/v1/tokens/${tokenId}/balances?limit=10&order=desc`);
            const data = await response.json();
            
            // 2. Scan holders to find a Liquidity Pool
            for (const balance of data.balances) {
                const accountId = balance.account;
                
                // 3. Check if this account holds WHBAR
                const accResponse = await fetch(`${this.baseUrl}/api/v1/accounts/${accountId}/tokens?token.id=${this.whbarId}`);
                const accData = await accResponse.json();
                
                if (accData.tokens && accData.tokens.length > 0) {
                    console.log(`Found Liquidity Pool for ${tokenId}: ${accountId}`);
                    return accountId;
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Fetch Reserves for a found pool
     */
    public async getReserves(poolId: string, tokenId: string) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/accounts/${poolId}/tokens`);
            const data = await response.json();
            
            const tokenBalance = data.tokens.find((t: any) => t.token_id === tokenId)?.balance || "0";
            const hbarBalance = data.tokens.find((t: any) => t.token_id === this.whbarId)?.balance || "0";
            
            return {
                token: BigInt(tokenBalance),
                hbar: BigInt(hbarBalance)
            };
        } catch (e) {
            return { token: 0n, hbar: 0n };
        }
    }

    /* --- Existing Methods --- */

    public async getTrendingTokens(limit: number = 20) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/tokens?limit=${limit}&order=desc`);
            if (!response.ok) throw new Error("Mirror node request failed");
            const data = await response.json();
            return data.tokens;
        } catch (error) {
            return [];
        }
    }

    public async getAccountTokens(accountId: string) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/tokens?account.id=${accountId}`);
            const data = await response.json();
            return data.tokens;
        } catch (error) {
            return [];
        }
    }

    public async getLiveActivity(limit: number = 15) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/transactions?limit=${limit}&order=desc&transactiontype=TOKENTRANSFER`);
            const data = await response.json();
            return data.transactions.map((tx: any) => ({
                id: tx.transaction_id,
                type: 'TRANSFER',
                sender: tx.node.split(':')[0] || '0.0.unknown',
                token: tx.name.split(' ')[1] || 'HTS',
                timestamp: tx.consensus_timestamp
            }));
        } catch (error) {
            return [];
        }
    }
}
