import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const pinataMetadata = JSON.stringify({
      name: file.name || "hashmeme_upload"
    });

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });

    const data = new FormData();
    data.append('file', file);
    data.append('pinataMetadata', pinataMetadata);
    data.append('pinataOptions', pinataOptions);

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
        throw new Error("Missing PINATA_JWT environment variable");
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`
      },
      body: data,
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Pinata upload failed: ${errText}`);
    }

    const result = await response.json();
    return NextResponse.json({ cid: result.IpfsHash }, { status: 200 });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
