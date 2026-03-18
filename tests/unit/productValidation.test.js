const {
  validateProduct,
  validateProductsJSON,
  createProduct,
  isValidISODate,
  generateId
} = require('../../server/utils/productValidation');

describe('Product Validation Utilities', () => {
  describe('isValidISODate', () => {
    test('accepts valid ISO 8601 dates', () => {
      expect(isValidISODate('2024-01-01T00:00:00.000Z')).toBe(true);
      expect(isValidISODate('2023-12-31T23:59:59.999Z')).toBe(true);
    });

    test('rejects invalid date strings', () => {
      expect(isValidISODate('not a date')).toBe(false);
      expect(isValidISODate('2024-01-01')).toBe(false);
      expect(isValidISODate('')).toBe(false);
    });
  });

  describe('generateId', () => {
    test('generates a valid UUID format', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateProduct', () => {
    const validProduct = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Bag',
      briefDescription: 'A test bag',
      fullDescription: 'This is a full description of the test bag',
      price: 99.99,
      dimensions: {
        inches: '12 x 8 x 4',
        centimeters: '30 x 20 x 10'
      },
      materials: ['Leather', 'Cotton'],
      colors: ['Black', 'Brown'],
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      careInstructions: 'Wipe clean with damp cloth',
      category: 'backpack',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    test('validates a correct product', () => {
      const result = validateProduct(validProduct);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects product with missing id', () => {
      const product = { ...validProduct, id: '' };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product id is required and must be a non-empty string');
    });

    test('rejects product with invalid name length', () => {
      const product = { ...validProduct, name: 'a'.repeat(101) };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name must be between 1 and 100 characters'))).toBe(true);
    });

    test('rejects product with invalid briefDescription length', () => {
      const product = { ...validProduct, briefDescription: 'a'.repeat(201) };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('briefDescription must be between 1 and 200 characters'))).toBe(true);
    });

    test('rejects product with non-positive price', () => {
      const product = { ...validProduct, price: 0 };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('price must be a positive number'))).toBe(true);
    });

    test('rejects product with NaN price', () => {
      const product = { ...validProduct, price: NaN };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('price must be a positive number'))).toBe(true);
    });

    test('rejects product with missing dimensions', () => {
      const product = { ...validProduct, dimensions: {} };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('dimensions.inches'))).toBe(true);
      expect(result.errors.some(e => e.includes('dimensions.centimeters'))).toBe(true);
    });

    test('rejects product with empty materials array', () => {
      const product = { ...validProduct, materials: [] };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('materials must contain at least one material'))).toBe(true);
    });

    test('rejects product with empty colors array', () => {
      const product = { ...validProduct, colors: [] };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('colors must contain at least one color'))).toBe(true);
    });

    test('rejects product with less than 3 images', () => {
      const product = { ...validProduct, images: ['img1.jpg', 'img2.jpg'] };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('images must contain at least 3 images'))).toBe(true);
    });

    test('accepts product with null careInstructions', () => {
      const product = { ...validProduct, careInstructions: null };
      const result = validateProduct(product);
      expect(result.valid).toBe(true);
    });

    test('rejects product with invalid category', () => {
      const product = { ...validProduct, category: 'invalid' };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('category must be one of'))).toBe(true);
    });

    test('accepts all valid categories', () => {
      ['backpack', 'handbag', 'tote', 'travel'].forEach(category => {
        const product = { ...validProduct, category };
        const result = validateProduct(product);
        expect(result.valid).toBe(true);
      });
    });

    test('rejects product with invalid ISO date', () => {
      const product = { ...validProduct, createdAt: '2024-01-01' };
      const result = validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('createdAt must be a valid ISO 8601 timestamp'))).toBe(true);
    });
  });

  describe('validateProductsJSON', () => {
    const validData = {
      products: [],
      categories: {
        backpack: 0,
        handbag: 0,
        tote: 0,
        travel: 0
      },
      lastUpdated: '2024-01-01T00:00:00.000Z'
    };

    test('validates correct products.json structure', () => {
      const result = validateProductsJSON(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects data without products array', () => {
      const data = { ...validData, products: null };
      const result = validateProductsJSON(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('products field is required and must be an array'))).toBe(true);
    });

    test('rejects data without categories object', () => {
      const data = { ...validData, categories: null };
      const result = validateProductsJSON(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('categories field is required and must be an object'))).toBe(true);
    });

    test('rejects data with missing category counts', () => {
      const data = { ...validData, categories: { backpack: 0 } };
      const result = validateProductsJSON(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('categories.handbag'))).toBe(true);
    });

    test('rejects data with negative category counts', () => {
      const data = { ...validData, categories: { ...validData.categories, backpack: -1 } };
      const result = validateProductsJSON(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('categories.backpack must be non-negative'))).toBe(true);
    });

    test('rejects data with invalid lastUpdated', () => {
      const data = { ...validData, lastUpdated: 'invalid' };
      const result = validateProductsJSON(data);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('lastUpdated must be a valid ISO 8601 timestamp'))).toBe(true);
    });
  });

  describe('createProduct', () => {
    test('creates product with provided data', () => {
      const data = {
        id: 'test-id',
        name: 'Test Bag',
        price: 99.99,
        category: 'handbag'
      };
      const product = createProduct(data);
      expect(product.id).toBe('test-id');
      expect(product.name).toBe('Test Bag');
      expect(product.price).toBe(99.99);
      expect(product.category).toBe('handbag');
    });

    test('generates ID if not provided', () => {
      const product = createProduct({});
      expect(product.id).toBeDefined();
      expect(product.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('sets default values for missing fields', () => {
      const product = createProduct({});
      expect(product.name).toBe('');
      expect(product.briefDescription).toBe('');
      expect(product.price).toBe(0);
      expect(product.materials).toEqual([]);
      expect(product.colors).toEqual([]);
      expect(product.images).toEqual([]);
      expect(product.careInstructions).toBe(null);
      expect(product.category).toBe('backpack');
    });

    test('sets timestamps if not provided', () => {
      const product = createProduct({});
      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
      expect(isValidISODate(product.createdAt)).toBe(true);
      expect(isValidISODate(product.updatedAt)).toBe(true);
    });
  });
});
