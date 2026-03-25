/**
 * V1 Response Cleaner
 * Strip KB references, simplify pre-game output
 */

function cleanResponse(text) {
    // Remove KB references like (KB 8.2), [KB 5.1], etc.
    text = text.replace(/\s*\(?KB\s*\d+\.?\d*\)?/gi, '');
    text = text.replace(/\s*\[?KB\s*\d+\.?\d*\]?/gi, '');
    
    // Remove "per KB" references
    text = text.replace(/\s*per\s+KB\s*\d+\.?\d*/gi, '');
    
    // Clean up double spaces
    text = text.replace(/\s{2,}/g, ' ');
    
    // Clean up orphaned punctuation
    text = text.replace(/\s+\./g, '.');
    text = text.replace(/\s+,/g, ',');
    text = text.replace(/\s+\)/g, ')');
    text = text.replace(/\(\s+/g, '(');
    
    return text.trim();
}

// Intercept API responses and clean them
function interceptResponses() {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
            // Clone the response so we can modify it
            const clonedResponse = response.clone();
            
            // Check if it's a chat API response
            if (args[0] && args[0].toString().includes('/api/chat')) {
                return clonedResponse.json().then(data => {
                    if (data.response) {
                        data.response = cleanResponse(data.response);
                    }
                    if (data.message) {
                        data.message = cleanResponse(data.message);
                    }
                    
                    // Create new response with cleaned data
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                });
            }
            
            return response;
        });
    };
}

// Also clean any existing messages on the page
function cleanExistingMessages() {
    const messages = document.querySelectorAll('.message, .chat-message, .response');
    messages.forEach(msg => {
        if (msg.textContent.includes('KB')) {
            msg.innerHTML = cleanResponse(msg.innerHTML);
        }
    });
}

// Run
interceptResponses();
document.addEventListener('DOMContentLoaded', cleanExistingMessages);
