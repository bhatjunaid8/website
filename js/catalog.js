/**
 * Catalog Page Controller
 * Initializes and manages the product catalog page functionality
 */
(function() {
    'use strict';

    let productCatalog;
    let filterComponent;
    let searchComponent;

    /**
     * Initialize the catalog page
     */
    function init() {
        // Initialize product catalog
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productCatalog = new ProductCatalog(productGrid);
            productCatalog.loadProducts().then(() => {
                // Initialize filter and search components after products are loaded
                initializeComponents();
            });
        }
    }

    /**
     * Initialize filter and search components
     */
    function initializeComponents() {
        // Initialize filter component
        filterComponent = new FilterComponent((filters) => {
            if (productCatalog) {
                productCatalog.applyFilters(filters);
            }
        });
        filterComponent.initialize();

        // Initialize search component
        searchComponent = new SearchComponent(
            productCatalog.getProducts(),
            (results, query) => {
                // Update the catalog with search results
                if (productCatalog) {
                    productCatalog.search(query);
                }
            }
        );
        searchComponent.initialize();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
