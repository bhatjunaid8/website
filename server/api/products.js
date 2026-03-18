const fs = require('fs').promises;
const path = require('path');
const { readProductsJSON, writeProductsJSON } = require('../utils/fileSystem');

/**
 * Generate a unique product ID
 */
function generateProductId() {
    return Date.now().toString();
}

/**
 * Handle GET /api/products - Get all products
 */
async function getProducts(req, res) {
    try {
        const data = await readProductsJSON();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    } catch (error) {
        console.error('Error reading products:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read products' }));
    }
}

/**
 * Handle POST /api/products - Add new product
 */
async function addProduct(req, res, formData) {
    try {
        // Parse product data
        const productData = JSON.parse(formData.fields.productData);
        const images = formData.files;

        // Generate product ID
        const productId = generateProductId();

        // Create product directory
        const productDir = path.join(__dirname, '../../public/images/products', productId);
        await fs.mkdir(productDir, { recursive: true });

        // Save images and get filenames
        const imageFilenames = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const ext = path.extname(image.originalFilename);
            const filename = i === 0 ? `main${ext}` : `image${i}${ext}`;
            const imagePath = path.join(productDir, filename);
            
            await fs.writeFile(imagePath, image.data);
            imageFilenames.push(filename);
        }

        // Create product object
        const newProduct = {
            id: productId,
            name: productData.name,
            category: productData.category,
            price: productData.price,
            briefDescription: productData.briefDescription,
            fullDescription: productData.fullDescription,
            dimensions: productData.dimensions,
            materials: productData.materials,
            colors: productData.colors,
            careInstructions: productData.careInstructions,
            primaryImage: imageFilenames[0],
            images: imageFilenames,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Read existing products
        const data = await readProductsJSON();
        
        // Add new product
        data.products.push(newProduct);
        
        // Update category count
        if (newProduct.category && data.categories[newProduct.category] !== undefined) {
            data.categories[newProduct.category]++;
        }
        
        // Update lastUpdated timestamp
        data.lastUpdated = new Date().toISOString();
        
        // Write back to file
        await writeProductsJSON(data);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, product: newProduct }));
    } catch (error) {
        console.error('Error adding product:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to add product: ' + error.message }));
    }
}

/**
 * Handle DELETE /api/products/:id - Delete product
 */
async function deleteProduct(req, res, productId) {
    try {
        // Read existing products
        const data = await readProductsJSON();
        
        // Find product
        const productIndex = data.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
            return;
        }

        const deletedProduct = data.products[productIndex];

        // Remove product from array
        data.products.splice(productIndex, 1);
        
        // Update category count
        if (deletedProduct.category && data.categories[deletedProduct.category] !== undefined) {
            data.categories[deletedProduct.category]--;
        }
        
        // Update lastUpdated timestamp
        data.lastUpdated = new Date().toISOString();
        
        // Write back to file
        await writeProductsJSON(data);

        // Delete product directory
        const productDir = path.join(__dirname, '../../public/images/products', productId);
        try {
            await fs.rm(productDir, { recursive: true, force: true });
        } catch (error) {
            console.error('Error deleting product directory:', error);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } catch (error) {
        console.error('Error deleting product:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete product' }));
    }
}

module.exports = {
    getProducts,
    addProduct,
    deleteProduct
};
