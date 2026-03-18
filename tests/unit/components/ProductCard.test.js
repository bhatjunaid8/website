/**
 * Unit tests for ProductCard component
 */

const ProductCard = require('../../../public/js/productCard.js');

describe('ProductCard', () => {
    const mockProduct = {
        id: 'test-123',
        name: 'Test Backpack',
        briefDescription: 'A great backpack for testing',
        price: 99.99,
        primaryImage: 'test-image.jpg',
        category: 'backpack'
    };

    describe('constructor', () => {
        it('should create a ProductCard instance with product data', () => {
            const card = new ProductCard(mockProduct);
            expect(card.product).toEqual(mockProduct);
        });
    });

    describe('render', () => {
        it('should render product card HTML with all required fields', () => {
            const card = new ProductCard(mockProduct);
            const html = card.render();

            expect(html).toContain('Test Backpack');
            expect(html).toContain('$99.99');
            expect(html).toContain('A great backpack for testing');
            expect(html).toContain('test-123');
        });

        it('should include alt text for image', () => {
            const card = new ProductCard(mockProduct);
            const html = card.render();

            expect(html).toContain('alt="Test Backpack - backpack"');
        });

        it('should include lazy loading attribute for images', () => {
            const card = new ProductCard(mockProduct);
            const html = card.render();

            expect(html).toContain('loading="lazy"');
        });

        it('should format price to 2 decimal places', () => {
            const productWithWholePrice = { ...mockProduct, price: 100 };
            const card = new ProductCard(productWithWholePrice);
            const html = card.render();

            expect(html).toContain('$100.00');
        });

        it('should escape HTML in product name and description', () => {
            const productWithHtml = {
                ...mockProduct,
                name: '<script>alert("xss")</script>',
                briefDescription: '<img src=x onerror=alert(1)>'
            };
            const card = new ProductCard(productWithHtml);
            const html = card.render();

            expect(html).not.toContain('<script>');
            expect(html).not.toContain('onerror=');
            expect(html).toContain('&lt;script&gt;');
        });

        it('should use placeholder image when primaryImage is missing', () => {
            const productWithoutImage = { ...mockProduct, primaryImage: null };
            const card = new ProductCard(productWithoutImage);
            const html = card.render();

            expect(html).toContain('images/placeholder.jpg');
        });
    });

    describe('escapeHtml', () => {
        it('should escape HTML special characters', () => {
            const card = new ProductCard(mockProduct);
            
            expect(card.escapeHtml('<div>test</div>')).toBe('&lt;div&gt;test&lt;/div&gt;');
            expect(card.escapeHtml('test & test')).toBe('test &amp; test');
            expect(card.escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
        });

        it('should handle plain text without changes', () => {
            const card = new ProductCard(mockProduct);
            
            expect(card.escapeHtml('plain text')).toBe('plain text');
        });
    });

    describe('getElement', () => {
        let card;
        let element;

        beforeEach(() => {
            // Set up DOM
            document.body.innerHTML = '<div id="test-container"></div>';
            card = new ProductCard(mockProduct);
        });

        it('should return an HTMLElement', () => {
            element = card.getElement();
            expect(element).toBeInstanceOf(HTMLElement);
        });

        it('should have product-card class', () => {
            element = card.getElement();
            expect(element.classList.contains('product-card')).toBe(true);
        });

        it('should have data-product-id attribute', () => {
            element = card.getElement();
            expect(element.getAttribute('data-product-id')).toBe('test-123');
        });

        it('should be keyboard accessible with tabindex', () => {
            element = card.getElement();
            expect(element.getAttribute('tabindex')).toBe('0');
        });
    });

    describe('navigateToProduct', () => {
        it('should navigate to correct product detail page', () => {
            const card = new ProductCard(mockProduct);
            
            // Mock window.location
            delete window.location;
            window.location = { href: '' };

            card.navigateToProduct();

            expect(window.location.href).toBe('product/test-123.html');
        });
    });
});
