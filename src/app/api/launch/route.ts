import { NextResponse } from 'next/server';
import { 
    Client, 
    TokenCreateTransaction, 
    TokenType, 
    TokenSupplyType,
    TokenAssociateTransaction,
    TransferTransaction,
    PrivateKey,
    AccountId
} from '@hashgraph/sdk';

export async function POST(request: Request) {
  try {
    const { name, symbol, decimals, initialSupply, imageCid, creatorAccountId } = await request.json();

    const operatorId = process.env.HEDERA_OPERATOR_ID;
    const operatorKey = process.env.HEDERA_OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
        throw new Error("Missing Hedera Operator credentials in .env");
    }

    const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    const treasuryKey = PrivateKey.fromString(operatorKey);

    // 1. Create the Fungible Token via HTS
    const createTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(Number(decimals))
        .setInitialSupply(Number(initialSupply))
        .setTreasuryAccountId(operatorId) // Backend acts as Treasury
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(treasuryKey)
        .setAdminKey(treasuryKey)
        .setTokenMemo(`ipfs://${imageCid}`)
        .freezeWith(client);

    const signTx = await createTx.sign(treasuryKey);
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
        throw new Error("Token creation failed, no Token ID returned.");
    }

    // Note: The Treasury (operatorId) is automatically associated with the newly created token.
    // If we wanted to associate the USER's account here (assuming they provided their keys to a custodial backend),
    // it would look like this:
    /*
    const userAssociateTx = new TokenAssociateTransaction()
        .setAccountId(creatorAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client);
    
    // In a real non-custodial dApp, we wouldn't have the user's private key on the backend.
    // The frontend would use HashConnect to execute the TokenAssociateTransaction.
    const userKey = PrivateKey.fromString(process.env.USER_MOCK_PRIVATE_KEY || "");
    const signedAssoc = await userAssociateTx.sign(userKey);
    await signedAssoc.execute(client);
    */

    return NextResponse.json({ 
        success: true, 
        tokenId: tokenId.toString(),
        message: "Token successfully launched!"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Launch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
