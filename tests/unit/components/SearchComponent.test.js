/**
 * Unit tests for SearchComponent
 */

const SearchComponent = require('../../../public/js/searchComponent.js');

describe('SearchComponent', () => {
    let searchComponent;
    let mockCallback;
    let mockProducts;

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <input type="search" id="search-input" />
            <button id="search-button">Search</button>
        `;

        mockProducts = [
            {
                id: '1',
                name: 'Classic Leather Backpack',
                briefDescription: 'A durable leather backpack for everyday use',
                price: 89.99,
                category: 'backpack'
            },
            {
                id: '2',
                name: 'Designer Handbag',
                briefDescription: 'Elegant handbag perfect for formal occasions',
                price: 149.99,
                category: 'handbag'
            },
            {
                id: '3',
                name: 'Canvas Tote Bag',
                briefDescription: 'Spacious canvas tote for shopping and travel',
                price: 29.99,
                category: 'tote'
            }
        ];

        mockCallback = jest.fn();
        searchComponent = new SearchComponent(mockProducts, mockCallback);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Constructor', () => {
        test('should initialize with products array', () => {
            expect(searchComponent.products).toEqual(mockProducts);
        });

        test('should store callback function', () => {
            expect(searchComponent.onSearch).toBe(mockCallback);
        });

        test('should initialize with null DOM elements', () => {
            expect(searchComponent.searchInput).toBeNull();
            expect(searchComponent.searchButton).toBeNull();
        });
    });

    describe('initialize()', () => {
        test('should find and store search input element', () => {
            searchComponent.initialize();
            expect(searchComponent.searchInput).toBeTruthy();
            expect(searchComponent.searchInput.id).toBe('search-input');
        });

        test('should find and store search button element', () => {
            searchComponent.initialize();
            expect(searchComponent.searchButton).toBeTruthy();
            expect(searchComponent.searchButton.id).toBe('search-button');
        });

        test('should handle missing search elements gracefully', () => {
            document.body.innerHTML = '';
            
            // Mock console.error to prevent test output pollution
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            
            searchComponent.initialize();
            
            expect(consoleErrorSpy).toHaveBeenCalledWith('Search input or button not found');
            consoleErrorSpy.mockRestore();
        });
    });

    describe('search()', () => {
        test('should return all products when query is empty', () => {
            const results = searchComponent.search('');
            expect(results).toEqual(mockProducts);
        });

        test('should return all products when query is whitespace', () => {
            const results = searchComponent.search('   ');
            expect(results).toEqual(mockProducts);
        });

        test('should find products by name (case-insensitive)', () => {
            const results = searchComponent.search('backpack');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Classic Leather Backpack');
        });

        test('should find products by name with different case', () => {
            const results = searchComponent.search('BACKPACK');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Classic Leather Backpack');
        });

        test('should find products by description', () => {
            const results = searchComponent.search('elegant');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Designer Handbag');
        });

        test('should find products by partial name match', () => {
            const results = searchComponent.search('bag');
            expect(results.length).toBeGreaterThan(0);
        });

        test('should return empty array when no matches found', () => {
            const results = searchComponent.search('nonexistent');
            expect(results).toEqual([]);
        });

        test('should find multiple products matching query', () => {
            const results = searchComponent.search('bag');
            // Should match "Handbag", "Tote Bag"
            expect(results.length).toBeGreaterThanOrEqual(2);
        });

        test('should trim whitespace from query', () => {
            const results1 = searchComponent.search('  backpack  ');
            const results2 = searchComponent.search('backpack');
            expect(results1).toEqual(results2);
        });

        test('should match in both name and description', () => {
            const results = searchComponent.search('leather');
            expect(results).toHaveLength(1);
            expect(results[0].id).toBe('1');
        });
    });

    describe('performSearch()', () => {
        beforeEach(() => {
            searchComponent.initialize();
        });

        test('should call search method with query', () => {
            const searchSpy = jest.spyOn(searchComponent, 'search');
            searchComponent.performSearch('backpack');
            expect(searchSpy).toHaveBeenCalledWith('backpack');
        });

        test('should trigger callback with results and query', () => {
            searchComponent.performSearch('backpack');
            expect(mockCallback).toHaveBeenCalled();
            
            const callArgs = mockCallback.mock.calls[0];
            expect(callArgs[0]).toHaveLength(1); // results
            expect(callArgs[1]).toBe('backpack'); // query
        });

        test('should complete search within reasonable time', () => {
            const startTime = performance.now();
            searchComponent.performSearch('backpack');
            const endTime = performance.now();
            
            const searchTime = endTime - startTime;
            // Should be much faster than 200ms requirement
            expect(searchTime).toBeLessThan(200);
        });
    });

    describe('highlightTerms()', () => {
        test('should return original text when query is empty', () => {
            const text = 'Classic Leather Backpack';
            const result = searchComponent.highlightTerms(text, '');
            expect(result).toBe(text);
        });

        test('should return original text when query is whitespace', () => {
            const text = 'Classic Leather Backpack';
            const result = searchComponent.highlightTerms(text, '   ');
            expect(result).toBe(text);
        });

        test('should wrap matching term in mark element', () => {
            const text = 'Classic Leather Backpack';
            const result = searchComponent.highlightTerms(text, 'Leather');
            expect(result).toContain('<mark class="search-highlight">Leather</mark>');
        });

        test('should highlight case-insensitively', () => {
            const text = 'Classic Leather Backpack';
            const result = searchComponent.highlightTerms(text, 'leather');
            expect(result).toContain('<mark class="search-highlight">Leather</mark>');
        });

        test('should highlight multiple occurrences', () => {
            const text = 'Bag for bag lovers';
            const result = searchComponent.highlightTerms(text, 'bag');
            const matches = result.match(/<mark class="search-highlight">/g);
            expect(matches).toHaveLength(2);
        });

        test('should escape special regex characters', () => {
            const text = 'Price: $50 (sale)';
            const result = searchComponent.highlightTerms(text, '$50');
            expect(result).toContain('<mark class="search-highlight">$50</mark>');
        });

        test('should handle parentheses in search term', () => {
            const text = 'Price: $50 (sale)';
            const result = searchComponent.highlightTerms(text, '(sale)');
            expect(result).toContain('<mark class="search-highlight">(sale)</mark>');
        });

        test('should preserve original case in highlighted text', () => {
            const text = 'Classic LEATHER Backpack';
            const result = searchComponent.highlightTerms(text, 'leather');
            expect(result).toContain('<mark class="search-highlight">LEATHER</mark>');
        });
    });

    describe('updateProducts()', () => {
        test('should update products array', () => {
            const newProducts = [
                { id: '4', name: 'New Bag', briefDescription: 'A new bag', price: 50 }
            ];
            
            searchComponent.updateProducts(newProducts);
            expect(searchComponent.products).toEqual(newProducts);
        });

        test('should affect subsequent searches', () => {
            const newProducts = [
                { id: '4', name: 'Unique Bag', briefDescription: 'Very unique', price: 50 }
            ];
            
            searchComponent.updateProducts(newProducts);
            const results = searchComponent.search('unique');
            
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Unique Bag');
        });
    });

    describe('clearSearch()', () => {
        beforeEach(() => {
            searchComponent.initialize();
        });

        test('should clear search input value', () => {
            searchComponent.searchInput.value = 'backpack';
            searchComponent.clearSearch();
            expect(searchComponent.searchInput.value).toBe('');
        });

        test('should perform empty search', () => {
            const performSearchSpy = jest.spyOn(searchComponent, 'performSearch');
            searchComponent.clearSearch();
            expect(performSearchSpy).toHaveBeenCalledWith('');
        });
    });

    describe('getSearchQuery()', () => {
        beforeEach(() => {
            searchComponent.initialize();
        });

        test('should return current search input value', () => {
            searchComponent.searchInput.value = 'backpack';
            expect(searchComponent.getSearchQuery()).toBe('backpack');
        });

        test('should return empty string when input is empty', () => {
            searchComponent.searchInput.value = '';
            expect(searchComponent.getSearchQuery()).toBe('');
        });
    });

    describe('setSearchQuery()', () => {
        beforeEach(() => {
            searchComponent.initialize();
        });

        test('should set search input value', () => {
            searchComponent.setSearchQuery('backpack');
            expect(searchComponent.searchInput.value).toBe('backpack');
        });

        test('should perform search with new query', () => {
            const performSearchSpy = jest.spyOn(searchComponent, 'performSearch');
            searchComponent.setSearchQuery('backpack');
            expect(performSearchSpy).toHaveBeenCalledWith('backpack');
        });
    });

    describe('Event Handlers', () => {
        beforeEach(() => {
            searchComponent.initialize();
        });

        test('should trigger search on button click', () => {
            searchComponent.searchInput.value = 'backpack';
            searchComponent.searchButton.click();
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should trigger search on Enter key', () => {
            searchComponent.searchInput.value = 'backpack';
            
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
            searchComponent.searchInput.dispatchEvent(enterEvent);
            
            expect(mockCallback).toHaveBeenCalled();
        });

        test('should debounce input events', (done) => {
            searchComponent.searchInput.value = 'b';
            searchComponent.searchInput.dispatchEvent(new Event('input'));
            
            searchComponent.searchInput.value = 'ba';
            searchComponent.searchInput.dispatchEvent(new Event('input'));
            
            searchComponent.searchInput.value = 'bag';
            searchComponent.searchInput.dispatchEvent(new Event('input'));
            
            // Should only call once after debounce delay
            setTimeout(() => {
                expect(mockCallback).toHaveBeenCalledTimes(1);
                done();
            }, 350);
        });
    });

    describe('Edge Cases', () => {
        test('should handle null callback gracefully', () => {
            const componentWithoutCallback = new SearchComponent(mockProducts, null);
            componentWithoutCallback.initialize();
            
            expect(() => {
                componentWithoutCallback.performSearch('test');
            }).not.toThrow();
        });

        test('should handle empty products array', () => {
            const emptyComponent = new SearchComponent([], mockCallback);
            const results = emptyComponent.search('anything');
            expect(results).toEqual([]);
        });

        test('should handle products without briefDescription', () => {
            const productsWithoutDesc = [
                { id: '1', name: 'Test Bag', price: 50 }
            ];
            
            const component = new SearchComponent(productsWithoutDesc, mockCallback);
            
            expect(() => {
                component.search('test');
            }).toThrow();
        });
    });
});
