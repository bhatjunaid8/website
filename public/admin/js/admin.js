/**
 * Admin Panel JavaScript — Vercel + GitHub API version
 */

const ADMIN_PASSWORD = 'jfcollections2024';
let isAuthenticated = false;

const loginSection = document.getElementById('login-section');
const adminContent = document.getElementById('admin-content');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const addProductForm = document.getElementById('add-product-form');
const productImagesInput = document.getElementById('product-images');
const imagePreview = document.getElementById('image-preview');
const formMessage = document.getElementById('form-message');
const productList = document.getElementById('product-list');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        loginSection.style.display = 'none';
        adminContent.style.display = 'block';
        loadProducts();
    } else {
        loginError.textContent = 'Incorrect password. Please try again.';
    }
});

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


function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { showMessage('Please login first', 'error'); return; }

    const submitBtn = addProductForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding product...';

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

    const images = [];
    const files = productImagesInput.files;
    for (let i = 0; i < files.length; i++) {
        const base64 = await fileToBase64(files[i]);
        images.push({ name: files[i].name, data: base64 });
    }

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productData, images })
        });
        const result = await response.json();
        if (response.ok) {
            showMessage('Product added! Site will redeploy in ~30 seconds.', 'success');
            addProductForm.reset();
            imagePreview.innerHTML = '';
            loadProducts();
        } else {
            showMessage(result.error || 'Failed to add product', 'error');
        }
    } catch (error) {
        showMessage('Error adding product. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Product';
    }
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.products && data.products.length > 0) {
            const currencySymbol = (data.currency && data.currency.symbol) || '₹';
            displayProducts(data.products, currencySymbol);
        } else {
            productList.innerHTML = '<p>No products found.</p>';
        }
    } catch (error) {
        productList.innerHTML = '<p>Error loading products: ' + error.message + '</p>';
    }
}

function displayProducts(products, currencySymbol) {
    productList.innerHTML = '';
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        const imagePath = product.primaryImage
            ? `images/products/${product.id}/${product.primaryImage}`
            : 'images/placeholder.jpg';
        productItem.innerHTML = `
            <img src="/${imagePath}" alt="${product.name}">
            <div class="product-item-info">
                <h3>${product.name}</h3>
                <p>${product.category} - ${currencySymbol}${product.price.toFixed(2)}</p>
            </div>
            <button class="btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        `;
        productList.appendChild(productItem);
    });
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const response = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok) {
            showMessage('Product deleted! Site will redeploy in ~30 seconds.', 'success');
            loadProducts();
        } else {
            showMessage(result.error || 'Failed to delete product', 'error');
        }
    } catch (error) {
        showMessage('Error deleting product.', 'error');
    }
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    setTimeout(() => { formMessage.textContent = ''; formMessage.className = 'form-message'; }, 5000);
}

window.deleteProduct = deleteProduct;