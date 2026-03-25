const OpenAI = require('openai');

// Azure OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { 'api-version': '2024-02-15-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY }
});

const ASSISTANT_ID = process.env.ASSISTANT_ID || 'asst_SyysrLVuOjyUfzXFuO30PwDf';

module.exports = async function (context, req) {
    context.log('Chat function processed a request.');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
        return;
    }

    const { message, lane, thread_id } = req.body || {};

    if (!message) {
        context.res = {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: { error: 'Message is required' }
        };
        return;
    }

    try {
        // Get or create thread
        let thread;
        if (thread_id) {
            try {
                thread = await openai.beta.threads.retrieve(thread_id);
            } catch (e) {
                thread = await openai.beta.threads.create();
            }
        } else {
            thread = await openai.beta.threads.create();
        }

        // Add message with lane context
        const lanePrefix = lane ? `[Lane: ${lane}] ` : '';
        await openai.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: lanePrefix + message
        });

        // Run assistant
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: ASSISTANT_ID
        });

        // Poll for completion (max 60 seconds)
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        let attempts = 0;
        const maxAttempts = 60;

        while (runStatus.status !== 'completed' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            attempts++;

            if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
                throw new Error(`Assistant run ${runStatus.status}`);
            }
        }

        if (attempts >= maxAttempts) {
            throw new Error('Request timed out');
        }

        // Get response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];
        
        if (!lastMessage || lastMessage.role !== 'assistant') {
            throw new Error('No assistant response');
        }

        const responseText = lastMessage.content[0].text.value;

        // Clean response (remove KB references)
        const cleanedResponse = cleanResponse(responseText);

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                response: cleanedResponse,
                thread_id: thread.id,
                lane: lane
            }
        };

    } catch (error) {
        context.log.error('Error:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                error: 'Failed to process request: ' + error.message,
                details: error.message
            }
        };
    }
};

function cleanResponse(text) {
    return text
        .replace(/\(KB\s+[\d.]+\)/gi, '')
        .replace(/\[KB\s+[\d.]+\]/gi, '')
        .replace(/per\s+KB\s+[\d.]+/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}
