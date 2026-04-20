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
    public async getTrendingTokens(limit: number = 20) {
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
     * Fetch HCS Topic Messages for Chat History
     */
    public async getTopicMessages(topicId: string, limit: number = 50) {
        if (!topicId) return [];
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`);
            if (!response.ok) throw new Error("Mirror node HCS request failed");
            const data = await response.json();
            
            return data.messages.map((m: any) => {
                // Decode HCS Message from Base64
                let decoded = '';
                try {
                    decoded = atob(m.message);
                } catch (e) {
                    decoded = m.message;
                }

                return {
                    id: m.sequence_number,
                    timestamp: m.consensus_timestamp,
                    sender: m.payer_account_id || '0.0.unknown',
                    text: decoded
                };
            }).reverse(); // Order from oldest to newest for chat
        } catch (error) {
            console.error("Error fetching HCS history:", error);
            return [];
        }
    }

    /**
     * Get recent transactions for HTS/Contract Activity
     */
    public async getRecentTransactions(limit: number = 20) {
        try {
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
