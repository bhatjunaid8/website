/**
 * ProductCard Component
 * Renders a product summary card with name, image, price, and brief description
 */
class ProductCard {
    /**
     * Create a ProductCard instance
     * @param {Object} product - Product data object
     * @param {string} product.id - Product ID
     * @param {string} product.name - Product name
     * @param {string} product.briefDescription - Brief product description
     * @param {number} product.price - Product price
     * @param {string} product.primaryImage - Primary product image filename
     * @param {string} product.category - Product category
     */
    constructor(product, currencySymbol) {
        this.product = product;
        this.currencySymbol = currencySymbol || '₹';
    }

    /**
     * Render the product card HTML
     * @returns {string} HTML string for the product card
     */
    /**
         * Render the product card HTML
         * @returns {string} HTML string for the product card
         */
        /**
             * Render the product card HTML
             * @returns {string} HTML string for the product card
             */
            render() {
                const { id, name, briefDescription, price, primaryImage, category } = this.product;

                // Format price to 2 decimal places with currency symbol
                const formattedPrice = `${this.currencySymbol}${price.toFixed(2)}`;

                // Construct image path
                const imagePath = primaryImage 
                    ? `images/products/${id}/${primaryImage}` 
                    : 'images/placeholder.jpg';

                // Create alt text for image
                const altText = `${name} - ${category}`;

                return `
                    <article class="product-card" data-product-id="${id}" role="listitem">
                        <img 
                            src="${imagePath}" 
                            alt="${altText}" 
                            class="product-card-image"
                            loading="lazy"
                            onerror="this.src='images/placeholder.jpg'; this.alt='Image unavailable';"
                        >
                        <div class="product-card-content">
                            <h3 class="product-card-name">${this.escapeHtml(name)}</h3>
                            <p class="product-card-price">${formattedPrice}</p>
                            <p class="product-card-description">${this.escapeHtml(briefDescription)}</p>
                        </div>
                    </article>
                `;
            }

    /**
     * Get the product card as a DOM element
     * @returns {HTMLElement} Product card element
     */
    getElement() {
        const template = document.createElement('div');
        template.innerHTML = this.render().trim();
        const element = template.firstChild;
        
        // Add click handler for navigation to product detail page
        element.addEventListener('click', () => {
            this.navigateToProduct();
        });
        
        // Add keyboard support
        element.setAttribute('tabindex', '0');
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateToProduct();
            }
        });
        
        return element;
    }

    /**
     * Navigate to the product detail page
     */
    navigateToProduct() {
        window.location.href = `product/index.html?id=${this.product.id}`;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCard;
}
