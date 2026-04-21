import { NextResponse } from 'next/server';

/**
 * AI Meme Generation API
 * Currently implements a high-fidelity prompt wrapper.
 * For production, connect to OpenAI DALL-E or Stability AI.
 */
export async function POST(req: Request) {
    try {
        const { prompt, model = 'gemini' } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`Generating AI Asset with ${model}: ${prompt}`);

        if (model === 'flux') {
            const apiKey = process.env.SILICONFLOW_API_KEY;
            
            if (apiKey) {
                const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "black-forest-labs/FLUX.1-schnell",
                        prompt: prompt,
                        image_size: "1024x1024",
                        batch_size: 1
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url;
                    if (imageUrl) {
                        return NextResponse.json({ 
                            imageUrl,
                            message: "Asset successfully synthesized by Flux.1 (Schnell) engine."
                        });
                    }
                }
            }

            // High-Reliability Fallback: Pollinations Flux
            console.log("Using Pollinations Flux fallback...");
            const seed = Math.floor(Math.random() * 1000000);
            const fallbackUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
            
            return NextResponse.json({ 
                imageUrl: fallbackUrl,
                message: "Asset synthesized via Flux (Radiant Mesh Fallback)."
            });

        } else {
            // Default to Gemini
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
            }

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: prompt }],
                    parameters: { sampleCount: 1 }
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "Gemini Handshake Failed");
            }

            const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
            if (!base64Image) throw new Error("Gemini returned no image data");

            return NextResponse.json({ 
                imageUrl: `data:image/png;base64,${base64Image}`,
                message: "Asset successfully synthesized by Gemini Imagen 3 engine."
            });
        }

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate asset." }, { status: 500 });
    }
}
