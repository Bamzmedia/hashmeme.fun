import { NextResponse } from 'next/server';

/**
 * IPFS BRIDGE PROXY
 * Fetches an external image on the server (bypassing CORS) and uploads it to Pinata.
 */
export async function POST(req: Request) {
    try {
        const { url, name } = await req.json();
        
        if (!url) {
            return NextResponse.json({ error: "Missing source URL" }, { status: 400 });
        }

        // 1. Fetch the image on the server
        const imageRes = await fetch(url);
        if (!imageRes.ok) throw new Error("Failed to fetch source image");
        const blob = await imageRes.blob();

        // 2. Prepare for Pinata
        const pinataJwt = process.env.PINATA_JWT;
        if (!pinataJwt) throw new Error("Missing Pinata Auth");

        const formData = new FormData();
        const file = new File([blob], name || "ai_generated.png", { type: "image/png" });
        formData.append('file', file);
        formData.append('pinataMetadata', JSON.stringify({ name: name || "hashmeme_ai_gen" }));
        formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

        // 3. Upload to Pinata
        const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${pinataJwt}`
            },
            body: formData,
        });

        if (!pinataRes.ok) {
            const err = await pinataRes.text();
            throw new Error(`Pinata Error: ${err}`);
        }

        const result = await pinataRes.json();
        return NextResponse.json({ cid: result.IpfsHash });

    } catch (error: any) {
        console.error("Bridge Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
