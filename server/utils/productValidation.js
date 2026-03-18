/**
 * Product Data Model and Validation Utilities
 * Validates product data according to the design specification
 */

/**
 * Validates a product object against the schema
 * @param {Object} product - The product object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateProduct(product) {
  const errors = [];

  // Validate id
  if (!product.id || typeof product.id !== 'string' || product.id.trim() === '') {
    errors.push('Product id is required and must be a non-empty string');
  }

  // Validate name
  if (!product.name || typeof product.name !== 'string') {
    errors.push('Product name is required and must be a string');
  } else if (product.name.length < 1 || product.name.length > 100) {
    errors.push('Product name must be between 1 and 100 characters');
  }

  // Validate briefDescription
  if (!product.briefDescription || typeof product.briefDescription !== 'string') {
    errors.push('Product briefDescription is required and must be a string');
  } else if (product.briefDescription.length < 1 || product.briefDescription.length > 200) {
    errors.push('Product briefDescription must be between 1 and 200 characters');
  }

  // Validate fullDescription
  if (!product.fullDescription || typeof product.fullDescription !== 'string') {
    errors.push('Product fullDescription is required and must be a string');
  }

  // Validate price
  if (typeof product.price !== 'number') {
    errors.push('Product price is required and must be a number');
  } else if (product.price <= 0 || isNaN(product.price) || !isFinite(product.price)) {
    errors.push('Product price must be a positive number');
  }

  // Validate dimensions
  if (!product.dimensions || typeof product.dimensions !== 'object') {
    errors.push('Product dimensions is required and must be an object');
  } else {
    if (!product.dimensions.inches || typeof product.dimensions.inches !== 'string') {
      errors.push('Product dimensions.inches is required and must be a string');
    }
    if (!product.dimensions.centimeters || typeof product.dimensions.centimeters !== 'string') {
      errors.push('Product dimensions.centimeters is required and must be a string');
    }
  }

  // Validate materials
  if (!Array.isArray(product.materials)) {
    errors.push('Product materials is required and must be an array');
  } else if (product.materials.length === 0) {
    errors.push('Product materials must contain at least one material');
  } else if (!product.materials.every(m => typeof m === 'string')) {
    errors.push('All materials must be strings');
  }

  // Validate colors
  if (!Array.isArray(product.colors)) {
    errors.push('Product colors is required and must be an array');
  } else if (product.colors.length === 0) {
    errors.push('Product colors must contain at least one color');
  } else if (!product.colors.every(c => typeof c === 'string')) {
    errors.push('All colors must be strings');
  }

  // Validate images
  if (!Array.isArray(product.images)) {
    errors.push('Product images is required and must be an array');
  } else if (product.images.length < 3) {
    errors.push('Product images must contain at least 3 images');
  } else if (!product.images.every(img => typeof img === 'string')) {
    errors.push('All images must be strings');
  }

  // Validate careInstructions (optional)
  if (product.careInstructions !== null && product.careInstructions !== undefined) {
    if (typeof product.careInstructions !== 'string') {
      errors.push('Product careInstructions must be a string or null');
    }
  }

  // Validate category
  const validCategories = ['backpack', 'handbag', 'tote', 'travel'];
  if (!product.category || typeof product.category !== 'string') {
    errors.push('Product category is required and must be a string');
  } else if (!validCategories.includes(product.category)) {
    errors.push(`Product category must be one of: ${validCategories.join(', ')}`);
  }

  // Validate createdAt
  if (!product.createdAt || typeof product.createdAt !== 'string') {
    errors.push('Product createdAt is required and must be a string');
  } else if (!isValidISODate(product.createdAt)) {
    errors.push('Product createdAt must be a valid ISO 8601 timestamp');
  }

  // Validate updatedAt
  if (!product.updatedAt || typeof product.updatedAt !== 'string') {
    errors.push('Product updatedAt is required and must be a string');
  } else if (!isValidISODate(product.updatedAt)) {
    errors.push('Product updatedAt must be a valid ISO 8601 timestamp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates if a string is a valid ISO 8601 date
 * @param {string} dateString - The date string to validate
 * @returns {boolean}
 */
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Validates the products.json structure
 * @param {Object} data - The products.json data object
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateProductsJSON(data) {
  const errors = [];

  // Validate products array
  if (!data.products || !Array.isArray(data.products)) {
    errors.push('products field is required and must be an array');
  } else {
    // Validate each product
    data.products.forEach((product, index) => {
      const validation = validateProduct(product);
      if (!validation.valid) {
        errors.push(`Product at index ${index} (id: ${product.id || 'unknown'}): ${validation.errors.join(', ')}`);
      }
    });
  }

  // Validate categories
  if (!data.categories || typeof data.categories !== 'object') {
    errors.push('categories field is required and must be an object');
  } else {
    const requiredCategories = ['backpack', 'handbag', 'tote', 'travel'];
    requiredCategories.forEach(cat => {
      if (typeof data.categories[cat] !== 'number') {
        errors.push(`categories.${cat} must be a number`);
      } else if (data.categories[cat] < 0) {
        errors.push(`categories.${cat} must be non-negative`);
      }
    });
  }

  // Validate lastUpdated
  if (!data.lastUpdated || typeof data.lastUpdated !== 'string') {
    errors.push('lastUpdated field is required and must be a string');
  } else if (!isValidISODate(data.lastUpdated)) {
    errors.push('lastUpdated must be a valid ISO 8601 timestamp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a new product object with default values
 * @param {Object} productData - Partial product data
 * @returns {Object} Complete product object
 */
function createProduct(productData) {
  const now = new Date().toISOString();
  
  return {
    id: productData.id || generateId(),
    name: productData.name || '',
    briefDescription: productData.briefDescription || '',
    fullDescription: productData.fullDescription || '',
    price: productData.price || 0,
    dimensions: {
      inches: productData.dimensions?.inches || '',
      centimeters: productData.dimensions?.centimeters || ''
    },
    materials: productData.materials || [],
    colors: productData.colors || [],
    images: productData.images || [],
    careInstructions: productData.careInstructions || null,
    category: productData.category || 'backpack',
    createdAt: productData.createdAt || now,
    updatedAt: productData.updatedAt || now
  };
}

/**
 * Generates a simple unique ID (UUID v4 format)
 * @returns {string}
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = {
  validateProduct,
  validateProductsJSON,
  createProduct,
  isValidISODate,
  generateId
};
