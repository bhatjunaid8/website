/**
 * ProductCatalog Component
 * Manages loading, rendering, and displaying all products in the catalog
 */
class ProductCatalog {
    /**
     * Create a ProductCatalog instance
     * @param {HTMLElement} containerElement - Container element for the product grid
     */
    constructor(containerElement) {
        this.container = containerElement;
        this.products = [];
        this.filteredProducts = [];
        this.currencySymbol = '₹';
        this.isLoading = false;
    }

    /**
     * Load products from the JSON data file
     * @returns {Promise<void>}
     */
    async loadProducts() {
        this.isLoading = true;
        this.showLoading();

        try {
            const response = await fetch('data/products.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load products: ${response.status}`);
            }

            const data = await response.json();
            this.products = data.products || [];
            this.filteredProducts = [...this.products];
            this.currencySymbol = (data.currency && data.currency.symbol) || '₹';
            
            this.render();
            this.updateProductCount();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Unable to load product catalog. Please try again later.');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render all products in the catalog
     */
    render() {
        if (!this.container) {
            console.error('Container element not found');
            return;
        }

        // Clear existing content
        this.container.innerHTML = '';

        // Check if there are products to display
        if (this.filteredProducts.length === 0) {
            this.showNoResults();
            return;
        }

        // Hide no results message
        this.hideNoResults();

        // Render each product card
        this.filteredProducts.forEach(product => {
            const productCard = new ProductCard(product, this.currencySymbol);
            const cardElement = productCard.getElement();
            this.container.appendChild(cardElement);
        });

        // Implement lazy loading for images below the fold
        this.implementLazyLoading();
    }

    /**
     * Implement lazy loading for images below the fold
     */
    implementLazyLoading() {
        // Get all images with loading="lazy" attribute
        const lazyImages = this.container.querySelectorAll('img[loading="lazy"]');
        
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // Image will load automatically due to loading="lazy" attribute
                        // We just observe for additional handling if needed
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
        // If Intersection Observer is not supported, images will still lazy load
        // due to the native loading="lazy" attribute
    }

    /**
     * Apply filters to the product catalog
     * @param {Object} filters - Filter criteria
     * @param {string[]} filters.categories - Selected categories
     * @param {string[]} filters.priceRanges - Selected price ranges
     */
    applyFilters(filters) {
        this.filteredProducts = this.products.filter(product => {
            // Check category filter
            const categoryMatch = !filters.categories || 
                                filters.categories.length === 0 || 
                                filters.categories.includes(product.category);

            // Check price range filter
            let priceMatch = !filters.priceRanges || filters.priceRanges.length === 0;
            
            if (filters.priceRanges && filters.priceRanges.length > 0) {
                priceMatch = filters.priceRanges.some(range => {
                    switch (range) {
                        case 'under-50':
                            return product.price < 50;
                        case '50-100':
                            return product.price >= 50 && product.price <= 100;
                        case '100-200':
                            return product.price > 100 && product.price <= 200;
                        case 'over-200':
                            return product.price > 200;
                        default:
                            return false;
                    }
                });
            }

            return categoryMatch && priceMatch;
        });

        this.render();
        this.updateProductCount();
    }

    /**
     * Search products by name or description
     * @param {string} query - Search query
     */
    search(query) {
        if (!query || query.trim() === '') {
            this.filteredProducts = [...this.products];
        } else {
            const searchTerm = query.toLowerCase().trim();
            this.filteredProducts = this.products.filter(product => {
                const nameMatch = product.name.toLowerCase().includes(searchTerm);
                const descriptionMatch = product.briefDescription.toLowerCase().includes(searchTerm);
                return nameMatch || descriptionMatch;
            });
        }

        this.render();
        this.updateProductCount();
    }

    /**
     * Clear all filters and show all products
     */
    clearFilters() {
        this.filteredProducts = [...this.products];
        this.render();
        this.updateProductCount();
    }

    /**
     * Update the product count display
     */
    updateProductCount() {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            const count = this.filteredProducts.length;
            const total = this.products.length;
            
            if (count === total) {
                countElement.textContent = `Showing all ${total} products`;
            } else {
                countElement.textContent = `Showing ${count} of ${total} products`;
            }
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<div class="loading">Loading products...</div>';
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    /**
     * Show no results message
     */
    showNoResults() {
        const noResultsElement = document.getElementById('no-results');
        if (noResultsElement) {
            noResultsElement.style.display = 'block';
        }
    }

    /**
     * Hide no results message
     */
    hideNoResults() {
        const noResultsElement = document.getElementById('no-results');
        if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
    }

    /**
     * Get all products
     * @returns {Array} All products
     */
    getProducts() {
        return this.products;
    }

    /**
     * Get filtered products
     * @returns {Array} Filtered products
     */
    getFilteredProducts() {
        return this.filteredProducts;
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCatalog;
}
