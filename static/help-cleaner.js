/**
 * V1 Help Cleaner - Remove demo commands, add quote to bottom
 */

function cleanHelpResponse() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // Check if this is a help response
                        if (node.textContent.includes('EnPro Filtration Mastermind') && 
                            node.textContent.includes('Commands')) {
                            
                            // Remove demo-related commands completely
                            const items = node.querySelectorAll('li, .command-item, div');
                            items.forEach(function(item) {
                                const text = item.textContent.toLowerCase();
                                if (text.includes('demo') || 
                                    text.includes('mic drop') ||
                                    text.includes('walkthrough') ||
                                    text.includes('training')) {
                                    item.remove(); // Completely remove, not just hide
                                }
                            });
                            
                            // Renumber the list
                            const remainingItems = node.querySelectorAll('li, .command-item');
                            remainingItems.forEach(function(item, index) {
                                const numberMatch = item.textContent.match(/^\d+\./);
                                if (numberMatch) {
                                    item.textContent = item.textContent.replace(/^\d+\./, (index + 1) + '.');
                                }
                            });
                            
                            // Add quote command at bottom if not present
                            if (!node.textContent.includes('quote')) {
                                const quoteItem = document.createElement('div');
                                quoteItem.innerHTML = '<strong>quote</strong> — Get a quote for selected products';
                                quoteItem.style.padding = '8px 0';
                                node.appendChild(quoteItem);
                            }
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

document.addEventListener('DOMContentLoaded', cleanHelpResponse);
