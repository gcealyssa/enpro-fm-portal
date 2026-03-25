/**
 * V1 Product Type Filter
 * Only show actual filter types
 */

// Valid filter product types (exclude accessories, housings, etc.)
const VALID_FILTER_TYPES = [
    'Air Filter',
    'Bag Filter', 
    'Capsule Filter',
    'Cartridges',
    'Depth Filter Sheet',
    'Depth Sheet',
    'Diaphragm Pump Filter',
    'Elements',
    'Filter',
    'Filter Element',
    'Filter Cartridge',
    'Filters (General)',
    'Membranes',
    'Screens / Separators',
    'Sheets / Depth Filters',
    'Strainer',
    'Coalescer'
];

// Hide non-filter product types from dropdowns
function filterProductTypes() {
    // Find all product type dropdowns
    const dropdowns = document.querySelectorAll('select, .dropdown, [data-field="product-type"]');
    
    dropdowns.forEach(dropdown => {
        const options = dropdown.querySelectorAll('option, .dropdown-item');
        options.forEach(option => {
            const text = option.textContent.trim();
            
            // Hide if not a valid filter type (and not the default "Any" option)
            if (text && !text.includes('Any') && !VALID_FILTER_TYPES.some(valid => 
                text.toLowerCase().includes(valid.toLowerCase()) || 
                valid.toLowerCase().includes(text.toLowerCase())
            )) {
                option.style.display = 'none';
            }
        });
    });
}

// Also filter out from search/display
function isFilterProductType(productType) {
    if (!productType) return false;
    return VALID_FILTER_TYPES.some(valid => 
        productType.toLowerCase().includes(valid.toLowerCase()) ||
        valid.toLowerCase().includes(productType.toLowerCase())
    );
}

// Run on load
document.addEventListener('DOMContentLoaded', filterProductTypes);

// Re-run when modals open (for Meeting Pregame)
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            filterProductTypes();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
