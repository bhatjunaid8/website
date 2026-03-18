# JF Collections Admin Panel

## Access

Visit: http://localhost:3000/admin

**Password:** `jfcollections2024`

## Features

### Add New Products
1. Login with the admin password
2. Fill in the product form:
   - Product Name (required)
   - Category: Backpack, Handbag, Tote Bag, or Travel Bag (required)
   - Price in USD (required)
   - Brief Description - shown on catalog page (required)
   - Full Description - shown on product detail page (required)
   - Dimensions in inches and centimeters (required)
   - Materials - comma-separated list (required)
   - Colors - comma-separated list (required)
   - Care Instructions (optional)
   - Product Images - select 1-5 images (required)
     - First image will be the primary/main image
     - Supported formats: JPG, PNG, GIF, WebP

3. Click "Add Product" to save

### View Products
- All current products are displayed in the right panel
- Shows product image, name, category, and price

### Delete Products
- Click the "Delete" button next to any product
- Confirm the deletion
- Product and all its images will be removed

## Security Note

⚠️ **Important:** This is a simple password-protected admin panel suitable for local use. For production deployment, implement proper authentication with:
- User accounts and encrypted passwords
- Session management
- HTTPS/SSL encryption
- CSRF protection
- Rate limiting

## Technical Details

- Products are stored in `public/data/products.json`
- Product images are stored in `public/images/products/{product-id}/`
- Each product gets a unique ID based on timestamp
- Images are automatically named (main.jpg, image1.jpg, etc.)
