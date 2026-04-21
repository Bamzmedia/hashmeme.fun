/**
 * Hedera Contract Reward Tracker
 * 
 * This service polls the Hedera Mirror Node for transactions to a specific contract,
 * extracts the payer and volume, and syncs the data to Supabase.
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// --- CONFIGURATION ---
const CONTRACT_ID = process.env.HEDERA_CONTRACT_ID || '0.0.12345';
const MIRROR_NODE_URL = process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for backend write access
const POLL_INTERVAL_MS = 15000; // 15 seconds
const STATE_FILE = path.join(__dirname, 'last_synced.json');

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Load the last processed timestamp from state file
 */
function loadState() {
    if (fs.existsSync(STATE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        } catch (e) {
            console.error("Error reading state file, starting fresh.");
        }
    }
    return { last_timestamp: "0.0" };
}

/**
 * Save the last processed timestamp
 */
function saveState(timestamp) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ last_timestamp: timestamp }, null, 2));
}

/**
 * Poll Mirror Node for new contract results
 */
async function trackTransactions() {
    console.log(`[${new Date().toISOString()}] Polling transactions for contract: ${CONTRACT_ID}...`);
    
    const state = loadState();
    let lastProcessed = state.last_timestamp;

    try {
        // Query contract results sorted by consensus_timestamp
        const url = `${MIRROR_NODE_URL}/api/v1/contracts/${CONTRACT_ID}/results?order=asc&timestamp=gt:${lastProcessed}`;
        const response = await axios.get(url);
        const results = response.data.results || [];

        if (results.length === 0) {
            console.log("No new transactions found.");
            return;
        }

        for (const tx of results) {
            if (tx.result !== "SUCCESS") continue;

            const timestamp = tx.consensus_timestamp;
            const payerId = tx.from; // In contract results, 'from' is the payer
            
            // To get detailed token transfers, we fetch the full transaction detail
            // Note: Token transfers are usually in the /api/v1/transactions/{timestamp} endpoint
            const txDetailUrl = `${MIRROR_NODE_URL}/api/v1/transactions/${timestamp}`;
            const detailRes = await axios.get(txDetailUrl);
            const txInfo = detailRes.data.transactions?.[0];

            let volumeSwapped = 0;
            
            // Parse HTS Token Transfers (Assuming we want to track all HTS volume)
            if (txInfo && txInfo.token_transfers) {
                // Filter transfers where the payer is involved or contract is involved
                // This logic extracts the positive amount transferred into the contract or out of the payer
                txInfo.token_transfers.forEach(tt => {
                    if (tt.amount > 0) {
                        volumeSwapped += tt.amount / Math.pow(10, tt.decimals || 0);
                    }
                });
            }

            // Fallback to HBAR if no tokens found
            if (volumeSwapped === 0 && txInfo && txInfo.transfers) {
                const payerTransfer = txInfo.transfers.find(t => t.account === payerId && t.amount < 0);
                if (payerTransfer) {
                    volumeSwapped = Math.abs(payerTransfer.amount) / 100000000; // tℏ to ℏ
                }
            }

            if (volumeSwapped > 0) {
                console.log(`[MATCH] Account: ${payerId} | Volume: ${volumeSwapped.toFixed(2)} | Timestamp: ${timestamp}`);
                
                // --- SUPABASE SYNC ---
                const points = Math.floor(volumeSwapped); // Simple 1:1 points logic
                const { error } = await supabase.rpc('add_reward_points', {
                    p_account_id: payerId,
                    p_amount: volumeSwapped,
                    p_points: points
                });

                if (error) {
                    console.error(`Supabase Error for ${payerId}:`, error.message);
                } else {
                    console.log(`[SYNCED] ${payerId} points updated successfully.`);
                }
            }

            lastProcessed = timestamp;
            saveState(lastProcessed);
        }

    } catch (error) {
        console.error("Tracker Loop Error:", error.response?.data || error.message);
    }
}

// Start the polling loop
console.log("--- Radiant Reward Tracker Service Initialized ---");
console.log(`Monitoring Contract: ${CONTRACT_ID}`);
setInterval(trackTransactions, POLL_INTERVAL_MS);
trackTransactions(); // Initial run
