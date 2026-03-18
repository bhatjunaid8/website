/**
 * Unit tests for ProductCatalog component
 */

const ProductCatalog = require('../../../public/js/productCatalog.js');

// Mock ProductCard since it's used by ProductCatalog
global.ProductCard = class ProductCard {
    constructor(product) {
        this.product = product;
    }
    
    getElement() {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.setAttribute('data-product-id', this.product.id);
        div.innerHTML = `<h3>${this.product.name}</h3>`;
        return div;
    }
};

describe('ProductCatalog', () => {
    let container;
    let catalog;

    const mockProducts = [
        {
            id: '1',
            name: 'Backpack 1',
            briefDescription: 'A great backpack',
            price: 49.99,
            primaryImage: 'backpack1.jpg',
            category: 'backpack'
        },
        {
            id: '2',
            name: 'Handbag 1',
            briefDescription: 'A stylish handbag',
            price: 89.99,
            primaryImage: 'handbag1.jpg',
            category: 'handbag'
        },
        {
            id: '3',
            name: 'Tote Bag 1',
            briefDescription: 'A spacious tote',
            price: 150.00,
            primaryImage: 'tote1.jpg',
            category: 'tote'
        }
    ];

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div id="product-grid"></div>
            <div id="no-results" style="display: none;"></div>
            <div id="product-count"></div>
        `;
        container = document.getElementById('product-grid');
        catalog = new ProductCatalog(container);
        catalog.products = [...mockProducts];
        catalog.filteredProducts = [...mockProducts];
    });

    describe('constructor', () => {
        it('should create a ProductCatalog instance', () => {
            expect(catalog.container).toBe(container);
            expect(catalog.products).toEqual([]);
            expect(catalog.filteredProducts).toEqual([]);
            expect(catalog.isLoading).toBe(false);
        });
    });

    describe('render', () => {
        it('should render all products in the container', () => {
            catalog.render();
            
            const productCards = container.querySelectorAll('.product-card');
            expect(productCards.length).toBe(3);
        });

        it('should show no results message when no products match', () => {
            catalog.filteredProducts = [];
            catalog.render();
            
            const noResults = document.getElementById('no-results');
            expect(noResults.style.display).toBe('block');
        });

        it('should hide no results message when products are displayed', () => {
            catalog.render();
            
            const noResults = document.getElementById('no-results');
            expect(noResults.style.display).toBe('none');
        });
    });

    describe('applyFilters', () => {
        it('should filter products by category', () => {
            const filters = {
                categories: ['backpack'],
                priceRanges: []
            };
            
            catalog.applyFilters(filters);
            
            expect(catalog.filteredProducts.length).toBe(1);
            expect(catalog.filteredProducts[0].category).toBe('backpack');
        });

        it('should filter products by price range', () => {
            const filters = {
                categories: [],
                priceRanges: ['under-50']
            };
            
            catalog.applyFilters(filters);
            
            expect(catalog.filteredProducts.length).toBe(1);
            expect(catalog.filteredProducts[0].price).toBeLessThan(50);
        });

        it('should filter products by multiple price ranges', () => {
            const filters = {
                categories: [],
                priceRanges: ['under-50', '50-100']
            };
            
            catalog.applyFilters(filters);
            
            expect(catalog.filteredProducts.length).toBe(2);
        });

        it('should apply both category and price filters (AND logic)', () => {
            const filters = {
                categories: ['handbag'],
                priceRanges: ['50-100']
            };
            
            catalog.applyFilters(filters);
            
            expect(catalog.filteredProducts.length).toBe(1);
            expect(catalog.filteredProducts[0].category).toBe('handbag');
            expect(catalog.filteredProducts[0].price).toBeGreaterThanOrEqual(50);
            expect(catalog.filteredProducts[0].price).toBeLessThanOrEqual(100);
        });

        it('should show all products when no filters are applied', () => {
            const filters = {
                categories: [],
                priceRanges: []
            };
            
            catalog.applyFilters(filters);
            
            expect(catalog.filteredProducts.length).toBe(3);
        });
    });

    describe('search', () => {
        it('should filter products by name', () => {
            catalog.search('Backpack');
            
            expect(catalog.filteredProducts.length).toBe(1);
            expect(catalog.filteredProducts[0].name).toContain('Backpack');
        });

        it('should filter products by description', () => {
            catalog.search('stylish');
            
            expect(catalog.filteredProducts.length).toBe(1);
            expect(catalog.filteredProducts[0].briefDescription).toContain('stylish');
        });

        it('should be case-insensitive', () => {
            catalog.search('HANDBAG');
            
            expect(catalog.filteredProducts.length).toBe(1);
            expect(catalog.filteredProducts[0].name.toLowerCase()).toContain('handbag');
        });

        it('should show all products when search query is empty', () => {
            catalog.search('');
            
            expect(catalog.filteredProducts.length).toBe(3);
        });

        it('should return no results for non-matching query', () => {
            catalog.search('nonexistent');
            
            expect(catalog.filteredProducts.length).toBe(0);
        });
    });

    describe('clearFilters', () => {
        it('should restore all products', () => {
            // First apply a filter
            catalog.applyFilters({ categories: ['backpack'], priceRanges: [] });
            expect(catalog.filteredProducts.length).toBe(1);
            
            // Then clear filters
            catalog.clearFilters();
            
            expect(catalog.filteredProducts.length).toBe(3);
        });
    });

    describe('updateProductCount', () => {
        it('should display correct count when all products are shown', () => {
            catalog.updateProductCount();
            
            const countElement = document.getElementById('product-count');
            expect(countElement.textContent).toBe('Showing all 3 products');
        });

        it('should display correct count when products are filtered', () => {
            catalog.filteredProducts = [mockProducts[0]];
            catalog.updateProductCount();
            
            const countElement = document.getElementById('product-count');
            expect(countElement.textContent).toBe('Showing 1 of 3 products');
        });
    });

    describe('getProducts', () => {
        it('should return all products', () => {
            expect(catalog.getProducts()).toEqual(mockProducts);
        });
    });

    describe('getFilteredProducts', () => {
        it('should return filtered products', () => {
            catalog.filteredProducts = [mockProducts[0]];
            expect(catalog.getFilteredProducts()).toEqual([mockProducts[0]]);
        });
    });
});
