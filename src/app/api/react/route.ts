import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/tokens.json');

/**
 * SOCIAL REACTION API
 * Handles live community engagement (Likes/Fire)
 */
export async function POST(req: Request) {
    try {
        const { id, reactionType } = await req.json();

        if (!id || !fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
        }

        const fileData = fs.readFileSync(DATA_PATH, 'utf8');
        const registry = JSON.parse(fileData);

        const tokenIndex = registry.tokens.findIndex((t: any) => t.id === id);
        if (tokenIndex === -1) {
            return NextResponse.json({ error: "Token Not Found" }, { status: 404 });
        }

        // Initialize reactions if they don't exist
        if (!registry.tokens[tokenIndex].reactions) {
            registry.tokens[tokenIndex].reactions = { fire: 0, rocket: 0 };
        }

        // Increment reaction index
        if (reactionType === 'fire') {
            registry.tokens[tokenIndex].reactions.fire = (registry.tokens[tokenIndex].reactions.fire || 0) + 1;
        } else if (reactionType === 'rocket') {
            registry.tokens[tokenIndex].reactions.rocket = (registry.tokens[tokenIndex].reactions.rocket || 0) + 1;
        }

        // Persist
        fs.writeFileSync(DATA_PATH, JSON.stringify(registry, null, 2));

        return NextResponse.json({ 
            success: true, 
            reactions: registry.tokens[tokenIndex].reactions 
        });

    } catch (error: any) {
        console.error("Reaction Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
