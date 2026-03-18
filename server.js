/**
 * HTTP server for JF Collections
 * Serves static files and handles admin API routes
 * Run with: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { getProducts, addProduct, deleteProduct } = require('./server/api/products');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const ADMIN_DIR = path.join(__dirname, 'admin');

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime'
};

/**
 * Parse multipart form data (for file uploads)
 */
function parseMultipartFormData(req) {
    return new Promise((resolve, reject) => {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            reject(new Error('Not multipart form data'));
            return;
        }

        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
            reject(new Error('No boundary found'));
            return;
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);
                const result = { fields: {}, files: [] };
                
                const boundaryBuffer = Buffer.from(`--${boundary}`);
                const parts = splitBuffer(buffer, boundaryBuffer);

                for (const part of parts) {
                    const partStr = part.toString('utf-8', 0, Math.min(part.length, 1024));
                    
                    if (partStr.includes('filename="')) {
                        // File field
                        const filenameMatch = partStr.match(/filename="([^"]+)"/);
                        const headerEnd = part.indexOf('\r\n\r\n');
                        
                        if (filenameMatch && headerEnd !== -1) {
                            const fileData = part.slice(headerEnd + 4);
                            // Remove trailing \r\n
                            const cleanData = fileData.slice(0, fileData.length - 2);
                            result.files.push({
                                originalFilename: filenameMatch[1],
                                data: cleanData
                            });
                        }
                    } else if (partStr.includes('name="')) {
                        // Regular field
                        const nameMatch = partStr.match(/name="([^"]+)"/);
                        const headerEnd = part.indexOf('\r\n\r\n');
                        
                        if (nameMatch && headerEnd !== -1) {
                            const value = part.slice(headerEnd + 4, part.length - 2).toString('utf-8');
                            result.fields[nameMatch[1]] = value;
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

/**
 * Split buffer by boundary
 */
function splitBuffer(buffer, boundary) {
    const parts = [];
    let start = 0;
    
    while (true) {
        const idx = buffer.indexOf(boundary, start);
        if (idx === -1) break;
        
        if (start > 0) {
            parts.push(buffer.slice(start, idx));
        }
        start = idx + boundary.length;
        
        // Skip \r\n after boundary
        if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
            start += 2;
        }
    }
    
    return parts;
}


/**
 * Serve static files
 */
function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Page Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

/**
 * Main server
 */
const server = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];
    const method = req.method;

    // API Routes
    if (url === '/api/products' && method === 'GET') {
        await getProducts(req, res);
        return;
    }

    if (url === '/api/products' && method === 'POST') {
        try {
            const formData = await parseMultipartFormData(req);
            await addProduct(req, res, formData);
        } catch (error) {
            console.error('Error parsing form data:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid form data' }));
        }
        return;
    }

    if (url.startsWith('/api/products/') && method === 'DELETE') {
        const productId = url.split('/')[3];
        await deleteProduct(req, res, productId);
        return;
    }

    // Admin routes
    if (url.startsWith('/admin')) {
        const adminPath = url === '/admin' || url === '/admin/' 
            ? '/admin/index.html' 
            : url;
        const filePath = path.join(__dirname, adminPath);
        serveStaticFile(filePath, res);
        return;
    }

    // Public routes
    const publicPath = url === '/' ? '/index.html' : url;
    const filePath = path.join(PUBLIC_DIR, publicPath);
    serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
    console.log(`\n🚀 JF Collections website is running!`);
    console.log(`\n📍 Public site: http://localhost:${PORT}`);
    console.log(`📍 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`\n🔐 Admin password: jfcollections2024`);
    console.log(`\n✨ Press Ctrl+C to stop the server\n`);
});
