/**
 * MirrorNodeService Singleton
 * Handles all communication with the Hedera Mirror Node.
 */
export class MirrorNodeService {
    private static instance: MirrorNodeService;
    private baseUrl: string;

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
     * Get the latest tokens created on the network
     */
    public async getTrendingTokens(limit: number = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/tokens?limit=${limit}&order=desc`);
            if (!response.ok) throw new Error("Mirror node request failed");
            const data = await response.json();
            return data.tokens;
        } catch (error) {
            console.error("Error fetching trending tokens:", error);
            return [];
        }
    }

    /**
     * Get tokens created by a specific account ID
     */
    public async getAccountTokens(accountId: string) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/tokens?account.id=${accountId}`);
            if (!response.ok) throw new Error("Mirror node request failed");
            const data = await response.json();
            return data.tokens;
        } catch (error) {
            console.error(`Error fetching tokens for account ${accountId}:`, error);
            return [];
        }
    }

    /**
     * Get recent transactions for HTS/Contract Activity
     */
    public async getRecentTransactions(limit: number = 20) {
        try {
            // Fetching recent token-related transactions
            const response = await fetch(`${this.baseUrl}/api/v1/transactions?limit=${limit}&order=desc&transactiontype=TOKENCREATION`);
            if (!response.ok) throw new Error("Mirror node request failed");
            const data = await response.json();
            return data.transactions;
        } catch (error) {
            console.error("Error fetching recent transactions:", error);
            return [];
        }
    }
}
