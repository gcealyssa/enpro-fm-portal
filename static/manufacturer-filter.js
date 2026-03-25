/**
 * V1 Manufacturer Filter
 * Clean up manufacturer dropdown - remove numbers, non-filter companies
 */

// Manufacturers to exclude (not actual filter manufacturers)
const EXCLUDE_MANUFACTURERS = [
    // Numeric entries
    /^\d+$/,
    
    // Non-filter companies (examples - add more as needed)
    '4imprint',
    'Advance Auto Parts',
    'Addison Electric',
    'Aim Solutions',
    'Air Blower Services Inc',
    'Air Compressor Services',
    'Air Engineering LLC',
    'Air Equipment Sales Inc',
    'Air Power of Nebraska Inc',
    'Air Services Company',
    'Air System Products',
    'Air Systems and Pump Solutions LLC',
    'Airdusco Inc',
    'Airgas USA',
    
    // Add more non-filter companies here
];

// Clean manufacturer names (consolidate duplicates)
const MANUFACTURER_ALIASES = {
    'A-W Lake': 'A-W Lake Company',
    'A-W Lake Company': 'A-W Lake Company',
    'PPC': 'Parker',
    'Industrial Technologies & Services Americas (PPC)': 'Parker',
    'LeSac': 'Le Sac Corporation',
};

function normalizeManufacturer(name) {
    // Remove extra whitespace
    name = name.trim();
    
    // Apply aliases
    if (MANUFACTURER_ALIASES[name]) {
        return MANUFACTURER_ALIASES[name];
    }
    
    return name;
}

function shouldExcludeManufacturer(name) {
    if (!name) return true;
    
    // Check against exclude patterns
    return EXCLUDE_MANUFACTURERS.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(name);
        }
        return name.toLowerCase().includes(pattern.toLowerCase());
    });
}

function filterManufacturers() {
    const dropdowns = document.querySelectorAll('select, .dropdown, [data-field="manufacturer"]');
    
    dropdowns.forEach(dropdown => {
        const options = dropdown.querySelectorAll('option, .dropdown-item');
        const seen = new Set();
        
        options.forEach(option => {
            const text = option.textContent.trim();
            const normalized = normalizeManufacturer(text);
            
            // Hide if should be excluded
            if (shouldExcludeManufacturer(text)) {
                option.style.display = 'none';
                return;
            }
            
            // Hide duplicates
            if (seen.has(normalized.toLowerCase())) {
                option.style.display = 'none';
            } else {
                seen.add(normalized.toLowerCase());
                // Update text to normalized version
                if (normalized !== text) {
                    option.textContent = normalized;
                }
            }
        });
    });
}

// Run on load
document.addEventListener('DOMContentLoaded', filterManufacturers);

// Re-run when modals/dropdowns open
const observer = new MutationObserver(function(mutations) {
    let shouldFilter = false;
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            shouldFilter = true;
        }
    });
    if (shouldFilter) filterManufacturers();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
