/**
 * ProductPage Component
 * Handles loading and displaying product detail information
 */

class ProductPage {
  constructor(product, currencySymbol) {
    this.product = product;
    this.currencySymbol = currencySymbol || '₹';
  }

  /**
   * Render product details to the page
   */
  renderDetails() {
    // Set product name
    const nameElement = document.getElementById('product-name');
    if (nameElement) {
      nameElement.textContent = this.product.name;
    }

    // Set product price
    const priceElement = document.getElementById('product-price');
    if (priceElement) {
      priceElement.textContent = `${this.currencySymbol}${this.product.price.toFixed(2)}`;
    }

    // Set product description
    const descriptionElement = document.getElementById('product-description');
    if (descriptionElement) {
      descriptionElement.textContent = this.product.fullDescription;
    }

    // Set dimensions
    const dimensionsElement = document.getElementById('product-dimensions');
    if (dimensionsElement && this.product.dimensions) {
      dimensionsElement.textContent = `${this.product.dimensions.inches} inches (${this.product.dimensions.centimeters} cm)`;
    }

    // Set materials
    const materialsElement = document.getElementById('product-materials');
    if (materialsElement && this.product.materials) {
      materialsElement.innerHTML = '';
      this.product.materials.forEach(material => {
        const li = document.createElement('li');
        li.textContent = material;
        materialsElement.appendChild(li);
      });
    }

    // Set colors
    const colorsElement = document.getElementById('product-colors');
    if (colorsElement && this.product.colors) {
      colorsElement.innerHTML = '';
      this.product.colors.forEach(color => {
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'color-swatch';
        colorSwatch.textContent = color;
        colorsElement.appendChild(colorSwatch);
      });
    }

    // Set care instructions (if present)
    const careSection = document.getElementById('care-section');
    const careElement = document.getElementById('product-care');
    if (this.product.careInstructions) {
      if (careSection) careSection.style.display = 'block';
      if (careElement) careElement.textContent = this.product.careInstructions;
    } else {
      if (careSection) careSection.style.display = 'none';
    }

    // Set up contact button
    const contactButton = document.getElementById('contact-button');
    if (contactButton) {
      contactButton.addEventListener('click', () => {
        // Navigate to contact page with product name in query string
        window.location.href = `../contact.html?product=${encodeURIComponent(this.product.name)}`;
      });
    }
  }

  /**
   * Render image gallery
   */
  renderImageGallery() {
    if (!this.product.images || this.product.images.length === 0) {
      return;
    }

    const mainImageElement = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-container');

    if (!mainImageElement || !thumbnailContainer) {
      return;
    }

    // Set main image
    const firstImage = this.product.images[0];
    const imagePath = `../images/products/${this.product.id}/${firstImage}`;
    mainImageElement.src = imagePath;
    mainImageElement.alt = `${this.product.name} - Main image`;

    // Clear thumbnail container
    thumbnailContainer.innerHTML = '';

    // Create thumbnails
    this.product.images.forEach((image, index) => {
      const thumbnail = document.createElement('img');
      thumbnail.src = `../images/products/${this.product.id}/${image}`;
      thumbnail.alt = `${this.product.name} - Image ${index + 1}`;
      thumbnail.className = 'thumbnail';
      thumbnail.setAttribute('tabindex', '0');
      thumbnail.setAttribute('role', 'button');
      thumbnail.setAttribute('aria-label', `View image ${index + 1} of ${this.product.images.length}`);
      
      // Mark first thumbnail as active
      if (index === 0) {
        thumbnail.classList.add('active');
        thumbnail.setAttribute('aria-pressed', 'true');
      } else {
        thumbnail.setAttribute('aria-pressed', 'false');
      }

      // Add click handler
      thumbnail.addEventListener('click', () => {
        this.handleThumbnailClick(thumbnail, image, index);
      });

      // Add keyboard handler
      thumbnail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleThumbnailClick(thumbnail, image, index);
        }
      });

      thumbnailContainer.appendChild(thumbnail);
    });
  }

  /**
   * Handle thumbnail click to change main image
   */
  handleThumbnailClick(thumbnailElement, imageName, index) {
    const mainImageElement = document.getElementById('main-image');
    if (!mainImageElement) return;

    // Update main image
    const imagePath = `../images/products/${this.product.id}/${imageName}`;
    mainImageElement.src = imagePath;
    mainImageElement.alt = `${this.product.name} - Image ${index + 1}`;

    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
      thumb.classList.remove('active');
      thumb.setAttribute('aria-pressed', 'false');
    });
    thumbnailElement.classList.add('active');
    thumbnailElement.setAttribute('aria-pressed', 'true');
  }

  /**
   * Navigate to next image in gallery
   */
  nextImage() {
    const thumbnails = Array.from(document.querySelectorAll('.thumbnail'));
    const activeIndex = thumbnails.findIndex(thumb => thumb.classList.contains('active'));
    
    if (activeIndex < thumbnails.length - 1) {
      const nextThumbnail = thumbnails[activeIndex + 1];
      const imageName = this.product.images[activeIndex + 1];
      this.handleThumbnailClick(nextThumbnail, imageName, activeIndex + 1);
    }
  }

  /**
   * Navigate to previous image in gallery
   */
  previousImage() {
    const thumbnails = Array.from(document.querySelectorAll('.thumbnail'));
    const activeIndex = thumbnails.findIndex(thumb => thumb.classList.contains('active'));
    
    if (activeIndex > 0) {
      const prevThumbnail = thumbnails[activeIndex - 1];
      const imageName = this.product.images[activeIndex - 1];
      this.handleThumbnailClick(prevThumbnail, imageName, activeIndex - 1);
    }
  }

  /**
   * Initialize the product page with keyboard navigation
   */
  initializeGallery() {
    this.renderImageGallery();
    
    // Add keyboard navigation for gallery
    const mainImageElement = document.getElementById('main-image');
    if (mainImageElement) {
      mainImageElement.setAttribute('tabindex', '0');
      mainImageElement.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextImage();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.previousImage();
        }
      });
    }
  }
}

/**
 * Load product data and initialize page
 */
async function loadProductPage() {
  try {
    // Get product ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
      displayProductNotFound();
      return;
    }

    // Fetch products data
    const response = await fetch('../data/products.json');
    if (!response.ok) {
      throw new Error('Failed to load product data');
    }

    const data = await response.json();
    const product = data.products.find(p => p.id === productId);

    if (!product) {
      displayProductNotFound();
      return;
    }

    // Get currency symbol from data
    const currencySymbol = (data.currency && data.currency.symbol) || '$';

    // Create and render product page
    const productPage = new ProductPage(product, currencySymbol);
    productPage.renderDetails();
    productPage.initializeGallery();

    // Update page title
    document.title = `${product.name} - JF Collections`;

  } catch (error) {
    console.error('Error loading product:', error);
    displayError();
  }
}

/**
 * Display product not found message
 */
function displayProductNotFound() {
  const container = document.querySelector('.product-detail-container');
  if (container) {
    container.innerHTML = `
      <div class="no-results">
        <h2>Product Not Found</h2>
        <p>Product not found. This product may have been removed or the link may be incorrect.</p>
        <a href="../index.html" class="back-link">← Back to Products</a>
      </div>
    `;
  }
}

/**
 * Display generic error message
 */
function displayError() {
  const container = document.querySelector('.product-detail-container');
  if (container) {
    container.innerHTML = `
      <div class="no-results">
        <h2>Error Loading Product</h2>
        <p>Unable to load product catalog. Please try again later.</p>
        <a href="../index.html" class="back-link">← Back to Products</a>
      </div>
    `;
  }
}

// Initialize page when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProductPage);
} else {
  loadProductPage();
}
