import { NextResponse } from 'next/server';
import { 
    Client, 
    TopicMessageSubmitTransaction, 
    TopicId,
    PrivateKey
} from '@hashgraph/sdk';

/**
 * HCS PUBLISH RELAY
 * Secures the topic submission by handling keys on the server side.
 */
export async function POST(req: Request) {
    try {
        const { type, data } = await req.json();
        
        // ENV Requirements
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = process.env.OPERATOR_KEY;
        const topicId = "0.0.5241085";

        if (!operatorId || !operatorKey) {
            return NextResponse.json({ error: "HCS Relay configuration missing" }, { status: 500 });
        }

        // Initialize Hedera Client
        const client = Client.forTestnet().setOperator(operatorId, operatorKey);

        const message = JSON.stringify({
            type,
            data,
            timestamp: Date.now()
        });

        // Submit to HCS
        const transaction = new TopicMessageSubmitTransaction()
            .setTopicId(TopicId.fromString(topicId))
            .setMessage(message);

        const response = await transaction.execute(client);
        await response.getReceipt(client);

        return NextResponse.json({ success: true, transactionId: response.transactionId.toString() });

    } catch (error: any) {
        console.error("HCS Relay Failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
