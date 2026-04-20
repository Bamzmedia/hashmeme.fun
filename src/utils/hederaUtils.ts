/**
 * Resolves a Hedera Account ID (0.0.x) from an EVM Address (0x...) using the Mirror Node.
 */
export async function getHederaId(evmAddress: string): Promise<string | null> {
    if (!evmAddress) return null;
    
    try {
        const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
        const mirrorNodeUrl = `https://${network}.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`;
        
        const response = await fetch(mirrorNodeUrl);
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.account; // Hedera Account ID (0.0.x)
    } catch (error) {
        console.error("Error resolving Hedera ID:", error);
        return null;
    }
}
