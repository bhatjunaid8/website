const fs = require('fs').promises;
const path = require('path');
const {
  readProductsJSON,
  writeProductsJSON,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategoryCounts
} = require('../../server/utils/fileSystem');

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('File System Utilities', () => {
  const validProductsData = {
    products: [
      {
        id: 'test-id-1',
        name: 'Test Bag 1',
        briefDescription: 'A test bag',
        fullDescription: 'Full description',
        price: 99.99,
        dimensions: { inches: '12 x 8 x 4', centimeters: '30 x 20 x 10' },
        materials: ['Leather'],
        colors: ['Black'],
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        careInstructions: null,
        category: 'backpack',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    categories: {
      backpack: 1,
      handbag: 0,
      tote: 0,
      travel: 0
    },
    lastUpdated: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readProductsJSON', () => {
    test('reads and parses valid products.json', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      const data = await readProductsJSON();
      
      expect(data).toEqual(validProductsData);
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('products.json'),
        'utf8'
      );
    });

    test('throws error for corrupted JSON', async () => {
      fs.readFile.mockResolvedValue('{ invalid json }');
      
      await expect(readProductsJSON()).rejects.toThrow('Corrupted data: Invalid JSON format');
    });

    test('throws error for invalid data structure', async () => {
      const invalidData = { products: 'not an array' };
      fs.readFile.mockResolvedValue(JSON.stringify(invalidData));
      
      await expect(readProductsJSON()).rejects.toThrow('Corrupted data:');
    });

    test('throws error when file not found', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValue(error);
      
      await expect(readProductsJSON()).rejects.toThrow('Products file not found');
    });

    test('throws error for other read failures', async () => {
      fs.readFile.mockRejectedValue(new Error('Permission denied'));
      
      await expect(readProductsJSON()).rejects.toThrow('Failed to read products file');
    });
  });

  describe('writeProductsJSON', () => {
    test('writes valid data to file', async () => {
      fs.writeFile.mockResolvedValue();
      
      await writeProductsJSON(validProductsData);
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('products.json'),
        JSON.stringify(validProductsData, null, 2),
        'utf8'
      );
    });

    test('throws error for invalid data', async () => {
      const invalidData = { products: 'not an array' };
      
      await expect(writeProductsJSON(invalidData)).rejects.toThrow('Invalid data:');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('throws error when write fails', async () => {
      fs.writeFile.mockRejectedValue(new Error('Disk full'));
      
      await expect(writeProductsJSON(validProductsData)).rejects.toThrow('Failed to write products file');
    });
  });

  describe('getAllProducts', () => {
    test('returns all products from catalog', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      const products = await getAllProducts();
      
      expect(products).toEqual(validProductsData.products);
      expect(products).toHaveLength(1);
    });
  });

  describe('getProductById', () => {
    test('returns product when found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      const product = await getProductById('test-id-1');
      
      expect(product).toEqual(validProductsData.products[0]);
    });

    test('returns null when product not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      const product = await getProductById('non-existent-id');
      
      expect(product).toBeNull();
    });
  });

  describe('addProduct', () => {
    const newProduct = {
      id: 'test-id-2',
      name: 'New Bag',
      briefDescription: 'A new bag',
      fullDescription: 'Full description',
      price: 149.99,
      dimensions: { inches: '14 x 10 x 5', centimeters: '35 x 25 x 12' },
      materials: ['Canvas'],
      colors: ['Blue'],
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      careInstructions: 'Hand wash',
      category: 'tote',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    };

    test('adds new product to catalog', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      fs.writeFile.mockResolvedValue();
      
      const result = await addProduct(newProduct);
      
      expect(result).toEqual(newProduct);
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);
      expect(writtenData.products).toHaveLength(2);
      expect(writtenData.categories.tote).toBe(1);
    });

    test('throws error when product ID already exists', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      const duplicateProduct = { ...newProduct, id: 'test-id-1' };
      
      await expect(addProduct(duplicateProduct)).rejects.toThrow('Product with ID test-id-1 already exists');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('updates lastUpdated timestamp', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      fs.writeFile.mockResolvedValue();
      
      await addProduct(newProduct);
      
      const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);
      expect(writtenData.lastUpdated).not.toBe(validProductsData.lastUpdated);
    });
  });

  describe('updateProduct', () => {
    test('updates existing product', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      fs.writeFile.mockResolvedValue();
      
      const updates = { name: 'Updated Bag', price: 129.99 };
      const result = await updateProduct('test-id-1', updates);
      
      expect(result.name).toBe('Updated Bag');
      expect(result.price).toBe(129.99);
      expect(result.updatedAt).not.toBe(validProductsData.products[0].updatedAt);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('throws error when product not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      await expect(updateProduct('non-existent-id', { name: 'Test' })).rejects.toThrow('Product with ID non-existent-id not found');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('updates category counts when category changes', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      fs.writeFile.mockResolvedValue();
      
      await updateProduct('test-id-1', { category: 'handbag' });
      
      const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);
      expect(writtenData.categories.backpack).toBe(0);
      expect(writtenData.categories.handbag).toBe(1);
    });
  });

  describe('deleteProduct', () => {
    test('deletes existing product', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      fs.writeFile.mockResolvedValue();
      
      const result = await deleteProduct('test-id-1');
      
      expect(result).toEqual(validProductsData.products[0]);
      expect(fs.writeFile).toHaveBeenCalled();
      
      const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);
      expect(writtenData.products).toHaveLength(0);
      expect(writtenData.categories.backpack).toBe(0);
    });

    test('throws error when product not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      await expect(deleteProduct('non-existent-id')).rejects.toThrow('Product with ID non-existent-id not found');
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryCounts', () => {
    test('returns category counts', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(validProductsData));
      
      const counts = await getCategoryCounts();
      
      expect(counts).toEqual(validProductsData.categories);
    });
  });
});
