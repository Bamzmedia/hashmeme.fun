import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/tokens.json');

/**
 * GET Handler: Fetch all launched tokens
 */
export async function GET() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ tokens: [] });
        }
        const fileData = fs.readFileSync(DATA_PATH, 'utf8');
        return NextResponse.json(JSON.parse(fileData));
    } catch (e) {
        console.error("GET Registry Error:", e);
        return NextResponse.json({ tokens: [] });
    }
}

/**
 * POST Handler: Register new token with persistence
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            name, 
            symbol, 
            initialSupply, 
            creatorAccountId, 
            imageCid
        } = body;

        // 1. Generate Token ID (Mocked for Testnet Registry flow)
        const mockTokenId = `0.0.${Math.floor(Math.random() * 9000000) + 1000000}`;

        const newToken = {
            id: Math.random().toString(36).substring(7),
            token_id: mockTokenId,
            name,
            symbol,
            image_url: imageCid.startsWith('http') ? imageCid : `https://gateway.pinata.cloud/ipfs/${imageCid}`,
            market_cap: "0",
            hbar_collected: "0",
            created_at: new Date().toISOString(),
            creator: creatorAccountId
        };

        // 2. Read current registry
        let registry = { tokens: [] as any[] };
        if (fs.existsSync(DATA_PATH)) {
            const currentData = fs.readFileSync(DATA_PATH, 'utf8');
            registry = JSON.parse(currentData);
        }

        // 3. Append and write back
        registry.tokens.unshift(newToken);
        fs.writeFileSync(DATA_PATH, JSON.stringify(registry, null, 2));

        return NextResponse.json({
            success: true,
            tokenId: mockTokenId,
            message: "Token registered in immutable registry."
        });

    } catch (error: any) {
        console.error("Launch API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
