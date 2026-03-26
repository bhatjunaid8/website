const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'bhatjunaid8';
const REPO_NAME = 'website';
const PRODUCTS_PATH = 'data/products.json';
const BRANCH = 'main';

async function githubRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  return res;
}

async function getProductsFile() {
  const res = await githubRequest(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PRODUCTS_PATH}?ref=${BRANCH}`
  );
  if (!res.ok) throw new Error('Failed to fetch products from GitHub');
  const data = await res.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { content, sha: data.sha };
}

async function updateProductsFile(content, sha, message) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await githubRequest(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PRODUCTS_PATH}`,
    {
      method: 'PUT',
      body: JSON.stringify({ message, content: encoded, sha, branch: BRANCH })
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update products');
  }
  return res.json();
}


async function uploadImage(productId, filename, base64Data) {
  const imagePath = `images/products/${productId}/${filename}`;
  const res = await githubRequest(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${imagePath}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: `Add image ${filename} for product ${productId}`,
        content: base64Data,
        branch: BRANCH
      })
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to upload image');
  }
  return res.json();
}

async function deleteImageFolder(productId) {
  // List files in the product image folder
  const res = await githubRequest(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/images/products/${productId}?ref=${BRANCH}`
  );
  if (!res.ok) return; // folder may not exist
  const files = await res.json();
  if (!Array.isArray(files)) return;
  for (const file of files) {
    await githubRequest(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          message: `Delete ${file.name} for product ${productId}`,
          sha: file.sha,
          branch: BRANCH
        })
      }
    );
  }
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  try {
    if (req.method === 'GET') {
      const { content } = await getProductsFile();
      return res.status(200).json(content);
    }

    if (req.method === 'POST') {
      const { productData, images } = req.body;
      const { content, sha } = await getProductsFile();
      const productId = Date.now().toString();
      const imageFilenames = [];

      // Upload images to GitHub
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const ext = img.name.split('.').pop();
          const filename = i === 0 ? `main.${ext}` : `image${i}.${ext}`;
          await uploadImage(productId, filename, img.data);
          imageFilenames.push(filename);
        }
      }

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
        primaryImage: imageFilenames[0] || 'main.jpg',
        images: imageFilenames,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      content.products.push(newProduct);
      if (newProduct.category && content.categories[newProduct.category] !== undefined) {
        content.categories[newProduct.category]++;
      }
      content.lastUpdated = new Date().toISOString();

      await updateProductsFile(content, sha, `Add product: ${newProduct.name}`);
      return res.status(201).json({ success: true, product: newProduct });
    }

    if (req.method === 'DELETE') {
      const productId = req.query.id;
      if (!productId) return res.status(400).json({ error: 'Product ID required' });

      const { content, sha } = await getProductsFile();
      const idx = content.products.findIndex(p => p.id === productId);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });

      const deleted = content.products[idx];
      content.products.splice(idx, 1);
      if (deleted.category && content.categories[deleted.category] !== undefined) {
        content.categories[deleted.category]--;
      }
      content.lastUpdated = new Date().toISOString();

      await updateProductsFile(content, sha, `Delete product: ${deleted.name}`);
      await deleteImageFolder(productId);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
};