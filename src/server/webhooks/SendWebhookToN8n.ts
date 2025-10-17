import crypto from 'crypto';

const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;


export async function sendWebhookToN8n( payload: Record<string, unknown> ) {
    const body = JSON.stringify( payload );

    if (!n8nWebhookUrl) {
        throw new Error('Missing N8N_WEBHOOK_URL');
    } else {
        const response = await fetch( n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body,
        } );

        if ( !response.ok ) {
            const errorText = await response.text();
            throw new Error( `n8n webhook failed: ${response.status} - ${errorText}` );
        }

        return response.json();
    }
}
