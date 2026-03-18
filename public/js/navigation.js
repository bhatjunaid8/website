/**
 * Navigation Component
 * Handles mobile menu toggle and navigation functionality
 */
class Navigation {
    constructor() {
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.mainNavigation = document.getElementById('main-navigation');
        this.init();
    }

    /**
     * Initialize navigation functionality
     */
    init() {
        if (this.mobileMenuToggle && this.mainNavigation) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Set active navigation link based on current page
        this.setActiveLink();
    }

    /**
     * Toggle mobile menu visibility
     */
    toggleMobileMenu() {
        const isExpanded = this.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        
        this.mainNavigation.classList.toggle('active');
        this.mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
    }

    /**
     * Set active navigation link based on current page
     */
    setActiveLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            const linkPath = new URL(link.href).pathname;
            if (currentPath === linkPath || 
                (currentPath === '/' && linkPath.includes('index.html')) ||
                (currentPath.includes('index.html') && linkPath.includes('index.html'))) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Navigation();
    });
} else {
    new Navigation();
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}
