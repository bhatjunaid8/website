/**
 * FilterComponent
 * Manages product filtering UI and state
 */
class FilterComponent {
    /**
     * Create a FilterComponent instance
     * @param {Function} onFilterChange - Callback function when filters change
     */
    constructor(onFilterChange) {
        this.onFilterChange = onFilterChange;
        this.activeFilters = {
            categories: [],
            priceRanges: []
        };
        this.categoryCheckboxes = [];
        this.priceCheckboxes = [];
    }

    /**
     * Initialize the filter component
     * Sets up event listeners for filter checkboxes
     */
    initialize() {
        // Get category checkboxes
        this.categoryCheckboxes = Array.from(
            document.querySelectorAll('input[name="category"]')
        );

        // Get price range checkboxes
        this.priceCheckboxes = Array.from(
            document.querySelectorAll('input[name="price"]')
        );

        // Add change event listeners to category checkboxes
        this.categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleFilterChange());
        });

        // Add change event listeners to price checkboxes
        this.priceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleFilterChange());
        });

        // Set up clear filters button
        const clearButton = document.getElementById('clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.reset());
        }
    }

    /**
     * Handle filter change events
     * Updates active filters and triggers callback
     */
    handleFilterChange() {
        // Get selected categories
        this.activeFilters.categories = this.categoryCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Get selected price ranges
        this.activeFilters.priceRanges = this.priceCheckboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        // Trigger callback with updated filters
        if (this.onFilterChange) {
            this.onFilterChange(this.activeFilters);
        }
    }

    /**
     * Get the current active filters
     * @returns {Object} Active filter state
     */
    getActiveFilters() {
        return {
            categories: [...this.activeFilters.categories],
            priceRanges: [...this.activeFilters.priceRanges]
        };
    }

    /**
     * Reset all filters to default state
     * Unchecks all checkboxes and clears active filters
     */
    reset() {
        // Uncheck all category checkboxes
        this.categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Uncheck all price checkboxes
        this.priceCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear active filters
        this.activeFilters = {
            categories: [],
            priceRanges: []
        };

        // Trigger callback with cleared filters
        if (this.onFilterChange) {
            this.onFilterChange(this.activeFilters);
        }
    }

    /**
     * Set filters programmatically
     * @param {Object} filters - Filter state to apply
     * @param {string[]} filters.categories - Categories to select
     * @param {string[]} filters.priceRanges - Price ranges to select
     */
    setFilters(filters) {
        // Reset first
        this.categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.priceCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Apply category filters
        if (filters.categories) {
            this.categoryCheckboxes.forEach(checkbox => {
                if (filters.categories.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
        }

        // Apply price range filters
        if (filters.priceRanges) {
            this.priceCheckboxes.forEach(checkbox => {
                if (filters.priceRanges.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
        }

        // Update active filters and trigger callback
        this.handleFilterChange();
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterComponent;
}
