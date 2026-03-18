/**
 * SearchComponent
 * Handles product search functionality
 */
class SearchComponent {
    /**
     * Create a SearchComponent instance
     * @param {Array} products - Array of all products
     * @param {Function} onSearch - Callback function when search is performed
     */
    constructor(products, onSearch) {
        this.products = products;
        this.onSearch = onSearch;
        this.searchInput = null;
        this.searchButton = null;
        this.searchTimeout = null;
    }

    /**
     * Initialize the search component
     * Sets up event listeners for search input and button
     */
    initialize() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');

        if (!this.searchInput || !this.searchButton) {
            console.error('Search input or button not found');
            return;
        }

        // Handle search button click
        this.searchButton.addEventListener('click', () => {
            this.performSearch(this.searchInput.value);
        });

        // Handle Enter key in search input
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(this.searchInput.value);
            }
        });

        // Removed real-time search to prevent constant re-rendering
        // Search only happens on Enter key or button click
    }

    /**
     * Perform product search
     * @param {string} query - Search query
     */
    performSearch(query) {
        const startTime = performance.now();
        
        const results = this.search(query);
        
        const endTime = performance.now();
        const searchTime = endTime - startTime;
        
        // Log warning if search takes longer than 200ms (requirement 9.3)
        if (searchTime > 200) {
            console.warn(`Search took ${searchTime.toFixed(2)}ms, exceeding 200ms requirement`);
        }

        // Trigger callback with search results
        if (this.onSearch) {
            this.onSearch(results, query);
        }
    }

    /**
     * Search products by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered products matching the search query
     */
    search(query) {
        // If query is empty, return all products
        if (!query || query.trim() === '') {
            return [...this.products];
        }

        const searchTerm = query.toLowerCase().trim();

        // Filter products by name or description (case-insensitive)
        return this.products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const descriptionMatch = product.briefDescription.toLowerCase().includes(searchTerm);
            return nameMatch || descriptionMatch;
        });
    }

    /**
     * Highlight search terms in text
     * @param {string} text - Text to highlight terms in
     * @param {string} query - Search query to highlight
     * @returns {string} HTML string with highlighted terms
     */
    highlightTerms(text, query) {
        // If no query, return original text
        if (!query || query.trim() === '') {
            return text;
        }

        const searchTerm = query.trim();
        
        // Escape special regex characters in the search term
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create case-insensitive regex to find all occurrences
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        
        // Replace matches with highlighted version
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    /**
     * Update the products array
     * @param {Array} products - New array of products
     */
    updateProducts(products) {
        this.products = products;
    }

    /**
     * Clear the search input
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.performSearch('');
        }
    }

    /**
     * Get the current search query
     * @returns {string} Current search query
     */
    getSearchQuery() {
        return this.searchInput ? this.searchInput.value : '';
    }

    /**
     * Set the search query programmatically
     * @param {string} query - Search query to set
     */
    setSearchQuery(query) {
        if (this.searchInput) {
            this.searchInput.value = query;
            this.performSearch(query);
        }
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchComponent;
}
