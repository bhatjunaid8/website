/**
 * Admin Panel JavaScript
 */

// Simple password protection (in production, use proper authentication)
const ADMIN_PASSWORD = 'jfcollections2024';
let isAuthenticated = false;

// DOM Elements
const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const addProductForm = document.getElementById('add-product-form');
const productImagesInput = document.getElementById('product-images');
const imagePreview = document.getElementById('image-preview');
const formMessage = document.getElementById('form-message');
const productList = document.getElementById('product-list');

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    console.log('Login attempt with password:', password);
    
    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        loginSection.style.display = 'none';
        adminContent.style.display = 'block';
        console.log('Login successful, loading products...');
        loadProducts();
    } else {
        loginError.textContent = 'Incorrect password. Please try again.';
        console.log('Login failed');
    }
});

// Image Preview Handler
productImagesInput.addEventListener('change', (e) => {
    const files = e.target.files;
    imagePreview.innerHTML = '';
    
    if (files.length > 5) {
        showMessage('Please select maximum 5 images', 'error');
        productImagesInput.value = '';
        return;
    }
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Add Product Form Handler
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const formData = new FormData();
    
    // Get form values
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        briefDescription: document.getElementById('product-brief-desc').value,
        fullDescription: document.getElementById('product-full-desc').value,
        dimensions: {
            inches: document.getElementById('product-dimensions-inches').value,
            centimeters: document.getElementById('product-dimensions-cm').value
        },
        materials: document.getElementById('product-materials').value.split(',').map(m => m.trim()),
        colors: document.getElementById('product-colors').value.split(',').map(c => c.trim()),
        careInstructions: document.getElementById('product-care').value || undefined
    };
    
    // Add product data
    formData.append('productData', JSON.stringify(productData));
    
    // Add images
    const images = productImagesInput.files;
    for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
    }
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Product added successfully!', 'success');
            addProductForm.reset();
            imagePreview.innerHTML = '';
            loadProducts();
        } else {
            showMessage(result.error || 'Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage('Error adding product. Please try again.', 'error');
    }
});

// Load Products
async function loadProducts() {
    console.log('Loading products...');
    try {
        const response = await fetch('/api/products');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Products data:', data);
        
        if (data.products && data.products.length > 0) {
            const currencySymbol = (data.currency && data.currency.symbol) || '₹';
            displayProducts(data.products, currencySymbol);
        } else {
            productList.innerHTML = '<p>No products found.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productList.innerHTML = '<p>Error loading products: ' + error.message + '</p>';
    }
}

// Display Products
function displayProducts(products, currencySymbol) {
    productList.innerHTML = '';

    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';

        const imagePath = product.primaryImage
            ? `../public/images/products/${product.id}/${product.primaryImage}`
            : '../public/images/placeholder.jpg';

        productItem.innerHTML = `
            <img src="${imagePath}" alt="${product.name}">
            <div class="product-item-info">
                <h3>${product.name}</h3>
                <p>${product.category} - ${currencySymbol}${product.price.toFixed(2)}</p>
            </div>
            <button class="btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        `;

        productList.appendChild(productItem);
    });
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Product deleted successfully!', 'success');
            loadProducts();
        } else {
            showMessage(result.error || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product. Please try again.', 'error');
    }
}

// Show Message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }, 5000);
}

// Make deleteProduct available globally
window.deleteProduct = deleteProduct;
