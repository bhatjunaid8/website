/**
 * File System Utilities for Product Catalog Management
 * Handles reading and writing products.json with error handling
 */

const fs = require('fs').promises;
const path = require('path');
const { validateProductsJSON } = require('./productValidation');

// Path to products.json file
const PRODUCTS_FILE_PATH = path.join(__dirname, '../../public/data/products.json');

/**
 * Reads the products.json file and returns parsed data
 * @returns {Promise<Object>} The products data object
 * @throws {Error} If file cannot be read or data is corrupted
 */
async function readProductsJSON() {
  try {
    const fileContent = await fs.readFile(PRODUCTS_FILE_PATH, 'utf8');
    
    // Parse JSON
    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error(`Corrupted data: Invalid JSON format - ${parseError.message}`);
    }

    // Validate structure
    const validation = validateProductsJSON(data);
    if (!validation.valid) {
      throw new Error(`Corrupted data: ${validation.errors.join('; ')}`);
    }

    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Products file not found');
    }
    if (error.message.startsWith('Corrupted data:')) {
      throw error;
    }
    throw new Error(`Failed to read products file: ${error.message}`);
  }
}

/**
 * Writes data to the products.json file
 * @param {Object} data - The products data object to write
 * @returns {Promise<void>}
 * @throws {Error} If data is invalid or file cannot be written
 */
async function writeProductsJSON(data) {
  // Validate data before writing
  const validation = validateProductsJSON(data);
  if (!validation.valid) {
    throw new Error(`Invalid data: ${validation.errors.join('; ')}`);
  }

  try {
    // Convert to JSON with pretty formatting
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Write to file
    await fs.writeFile(PRODUCTS_FILE_PATH, jsonContent, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write products file: ${error.message}`);
  }
}

/**
 * Reads all products from the catalog
 * @returns {Promise<Array>} Array of product objects
 */
async function getAllProducts() {
  const data = await readProductsJSON();
  return data.products;
}

/**
 * Finds a product by ID
 * @param {string} productId - The product ID to find
 * @returns {Promise<Object|null>} The product object or null if not found
 */
async function getProductById(productId) {
  const products = await getAllProducts();
  return products.find(p => p.id === productId) || null;
}

/**
 * Adds a new product to the catalog
 * @param {Object} product - The product object to add
 * @returns {Promise<Object>} The added product
 * @throws {Error} If product already exists or data is invalid
 */
async function addProduct(product) {
  const data = await readProductsJSON();
  
  // Check if product with same ID already exists
  if (data.products.some(p => p.id === product.id)) {
    throw new Error(`Product with ID ${product.id} already exists`);
  }

  // Add product
  data.products.push(product);
  
  // Update category count
  if (product.category && data.categories[product.category] !== undefined) {
    data.categories[product.category]++;
  }
  
  // Update lastUpdated timestamp
  data.lastUpdated = new Date().toISOString();
  
  // Write back to file
  await writeProductsJSON(data);
  
  return product;
}

/**
 * Updates an existing product in the catalog
 * @param {string} productId - The ID of the product to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated product
 * @throws {Error} If product not found or data is invalid
 */
async function updateProduct(productId, updates) {
  const data = await readProductsJSON();
  
  const index = data.products.findIndex(p => p.id === productId);
  if (index === -1) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const oldProduct = data.products[index];
  const updatedProduct = { ...oldProduct, ...updates, updatedAt: new Date().toISOString() };
  
  // Update category count if category changed
  if (updates.category && updates.category !== oldProduct.category) {
    if (data.categories[oldProduct.category] !== undefined) {
      data.categories[oldProduct.category]--;
    }
    if (data.categories[updates.category] !== undefined) {
      data.categories[updates.category]++;
    }
  }
  
  data.products[index] = updatedProduct;
  data.lastUpdated = new Date().toISOString();
  
  await writeProductsJSON(data);
  
  return updatedProduct;
}

/**
 * Deletes a product from the catalog
 * @param {string} productId - The ID of the product to delete
 * @returns {Promise<Object>} The deleted product
 * @throws {Error} If product not found
 */
async function deleteProduct(productId) {
  const data = await readProductsJSON();
  
  const index = data.products.findIndex(p => p.id === productId);
  if (index === -1) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const deletedProduct = data.products[index];
  
  // Remove product
  data.products.splice(index, 1);
  
  // Update category count
  if (deletedProduct.category && data.categories[deletedProduct.category] !== undefined) {
    data.categories[deletedProduct.category]--;
  }
  
  data.lastUpdated = new Date().toISOString();
  
  await writeProductsJSON(data);
  
  return deletedProduct;
}

/**
 * Gets category counts from the catalog
 * @returns {Promise<Object>} Object with category counts
 */
async function getCategoryCounts() {
  const data = await readProductsJSON();
  return data.categories;
}

module.exports = {
  readProductsJSON,
  writeProductsJSON,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategoryCounts
};
