import { NextResponse } from 'next/server';

/**
 * AI Meme Generation API
 * Currently implements a high-fidelity prompt wrapper.
 * For production, connect to OpenAI DALL-E or Stability AI.
 */
export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
        }

        console.log(`Generating AI Asset with Gemini (Imagen 3): ${prompt}`);

        // Imagen 3 REST call for Google AI Studio
        // Endpoint: v1beta/models/imagen-3.0-generate-001:predict
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    // aspect_ratio: "1:1" // Optional
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(data.error?.message || "Gemini Handshake Failed");
        }

        // Gemini returns images in base64 format within the predictions array
        const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

        if (!base64Image) {
            throw new Error("Gemini returned no image data");
        }

        const imageUrl = `data:image/png;base64,${base64Image}`;

        return NextResponse.json({ 
            imageUrl,
            message: "Asset successfully synthesized by Gemini Imagen 3 engine."
        });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate asset." }, { status: 500 });
    }
}
