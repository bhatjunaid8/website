/**
 * Unit tests for FilterComponent
 */

const FilterComponent = require('../../../public/js/filterComponent.js');

describe('FilterComponent', () => {
    let filterComponent;
    let mockCallback;
    let mockContainer;

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div id="filter-sidebar">
                <input type="checkbox" name="category" value="backpack" class="filter-checkbox">
                <input type="checkbox" name="category" value="handbag" class="filter-checkbox">
                <input type="checkbox" name="category" value="tote" class="filter-checkbox">
                <input type="checkbox" name="category" value="travel" class="filter-checkbox">
                
                <input type="checkbox" name="price" value="under-50" class="filter-checkbox">
                <input type="checkbox" name="price" value="50-100" class="filter-checkbox">
                <input type="checkbox" name="price" value="100-200" class="filter-checkbox">
                <input type="checkbox" name="price" value="over-200" class="filter-checkbox">
                
                <button id="clear-filters">Clear Filters</button>
            </div>
        `;

        mockCallback = jest.fn();
        filterComponent = new FilterComponent(mockCallback);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Constructor', () => {
        test('should initialize with empty filters', () => {
            expect(filterComponent.activeFilters).toEqual({
                categories: [],
                priceRanges: []
            });
        });

        test('should store callback function', () => {
            expect(filterComponent.onFilterChange).toBe(mockCallback);
        });
    });

    describe('initialize()', () => {
        test('should find and store category checkboxes', () => {
            filterComponent.initialize();
            expect(filterComponent.categoryCheckboxes).toHaveLength(4);
        });

        test('should find and store price checkboxes', () => {
            filterComponent.initialize();
            expect(filterComponent.priceCheckboxes).toHaveLength(4);
        });

        test('should set up event listeners on checkboxes', () => {
            filterComponent.initialize();
            
            const categoryCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            categoryCheckbox.checked = true;
            categoryCheckbox.dispatchEvent(new Event('change'));
            
            expect(mockCallback).toHaveBeenCalled();
        });
    });

    describe('handleFilterChange()', () => {
        beforeEach(() => {
            filterComponent.initialize();
        });

        test('should update active filters when category is selected', () => {
            const backpackCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            backpackCheckbox.checked = true;
            
            filterComponent.handleFilterChange();
            
            expect(filterComponent.activeFilters.categories).toContain('backpack');
        });

        test('should update active filters when price range is selected', () => {
            const priceCheckbox = document.querySelector('input[name="price"][value="under-50"]');
            priceCheckbox.checked = true;
            
            filterComponent.handleFilterChange();
            
            expect(filterComponent.activeFilters.priceRanges).toContain('under-50');
        });

        test('should handle multiple category selections', () => {
            const backpackCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            const handbagCheckbox = document.querySelector('input[name="category"][value="handbag"]');
            
            backpackCheckbox.checked = true;
            handbagCheckbox.checked = true;
            
            filterComponent.handleFilterChange();
            
            expect(filterComponent.activeFilters.categories).toEqual(['backpack', 'handbag']);
        });

        test('should handle multiple price range selections', () => {
            const price1 = document.querySelector('input[name="price"][value="under-50"]');
            const price2 = document.querySelector('input[name="price"][value="50-100"]');
            
            price1.checked = true;
            price2.checked = true;
            
            filterComponent.handleFilterChange();
            
            expect(filterComponent.activeFilters.priceRanges).toEqual(['under-50', '50-100']);
        });

        test('should trigger callback with updated filters', () => {
            const backpackCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            backpackCheckbox.checked = true;
            
            filterComponent.handleFilterChange();
            
            expect(mockCallback).toHaveBeenCalledWith({
                categories: ['backpack'],
                priceRanges: []
            });
        });
    });

    describe('getActiveFilters()', () => {
        beforeEach(() => {
            filterComponent.initialize();
        });

        test('should return copy of active filters', () => {
            filterComponent.activeFilters = {
                categories: ['backpack'],
                priceRanges: ['under-50']
            };
            
            const filters = filterComponent.getActiveFilters();
            
            expect(filters).toEqual({
                categories: ['backpack'],
                priceRanges: ['under-50']
            });
            
            // Verify it's a copy, not the original
            filters.categories.push('handbag');
            expect(filterComponent.activeFilters.categories).toEqual(['backpack']);
        });

        test('should return empty arrays when no filters active', () => {
            const filters = filterComponent.getActiveFilters();
            
            expect(filters).toEqual({
                categories: [],
                priceRanges: []
            });
        });
    });

    describe('reset()', () => {
        beforeEach(() => {
            filterComponent.initialize();
        });

        test('should uncheck all category checkboxes', () => {
            const backpackCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            const handbagCheckbox = document.querySelector('input[name="category"][value="handbag"]');
            
            backpackCheckbox.checked = true;
            handbagCheckbox.checked = true;
            
            filterComponent.reset();
            
            expect(backpackCheckbox.checked).toBe(false);
            expect(handbagCheckbox.checked).toBe(false);
        });

        test('should uncheck all price checkboxes', () => {
            const price1 = document.querySelector('input[name="price"][value="under-50"]');
            const price2 = document.querySelector('input[name="price"][value="50-100"]');
            
            price1.checked = true;
            price2.checked = true;
            
            filterComponent.reset();
            
            expect(price1.checked).toBe(false);
            expect(price2.checked).toBe(false);
        });

        test('should clear active filters', () => {
            filterComponent.activeFilters = {
                categories: ['backpack', 'handbag'],
                priceRanges: ['under-50']
            };
            
            filterComponent.reset();
            
            expect(filterComponent.activeFilters).toEqual({
                categories: [],
                priceRanges: []
            });
        });

        test('should trigger callback with empty filters', () => {
            filterComponent.reset();
            
            expect(mockCallback).toHaveBeenCalledWith({
                categories: [],
                priceRanges: []
            });
        });
    });

    describe('setFilters()', () => {
        beforeEach(() => {
            filterComponent.initialize();
        });

        test('should check specified category checkboxes', () => {
            filterComponent.setFilters({
                categories: ['backpack', 'handbag'],
                priceRanges: []
            });
            
            const backpackCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            const handbagCheckbox = document.querySelector('input[name="category"][value="handbag"]');
            
            expect(backpackCheckbox.checked).toBe(true);
            expect(handbagCheckbox.checked).toBe(true);
        });

        test('should check specified price range checkboxes', () => {
            filterComponent.setFilters({
                categories: [],
                priceRanges: ['under-50', '50-100']
            });
            
            const price1 = document.querySelector('input[name="price"][value="under-50"]');
            const price2 = document.querySelector('input[name="price"][value="50-100"]');
            
            expect(price1.checked).toBe(true);
            expect(price2.checked).toBe(true);
        });

        test('should uncheck previously selected checkboxes', () => {
            const backpackCheckbox = document.querySelector('input[name="category"][value="backpack"]');
            backpackCheckbox.checked = true;
            
            filterComponent.setFilters({
                categories: ['handbag'],
                priceRanges: []
            });
            
            expect(backpackCheckbox.checked).toBe(false);
        });

        test('should trigger callback with new filters', () => {
            filterComponent.setFilters({
                categories: ['backpack'],
                priceRanges: ['under-50']
            });
            
            expect(mockCallback).toHaveBeenCalledWith({
                categories: ['backpack'],
                priceRanges: ['under-50']
            });
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing clear button gracefully', () => {
            document.getElementById('clear-filters').remove();
            
            expect(() => {
                filterComponent.initialize();
            }).not.toThrow();
        });

        test('should handle callback being null', () => {
            const componentWithoutCallback = new FilterComponent(null);
            componentWithoutCallback.initialize();
            
            expect(() => {
                componentWithoutCallback.handleFilterChange();
            }).not.toThrow();
        });
    });
});
