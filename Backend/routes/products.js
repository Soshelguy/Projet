/**
 * This file contains API endpoints for products. It allows users to get a list of all products, get a specific product by ID, and get a list of similar products to a specific product.
 */
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

/**
 * Connect to the PostgreSQL database.
 */
const pool = new Pool({
  user: 'postgres', 
  host: 'localhost', 
  database: 'delivprojdb', 
  password: '2OO4', 
  port: 5432, 
});

/**
 * Get a list of all products.
 * 
 * @return {JSON} A JSON object containing a list of products.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get a list of products that are similar to a specific product.
 * 
 * @param {string} productId The ID of the product to get similar products for.
 * @return {JSON} A JSON object containing a list of similar products.
 */
router.get('/similar/:productId', async (req, res) => {
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get a list of products that are in the same category as the product specified by the productId parameter.
    // Exclude the product specified by the productId parameter from the results.
    const similarProducts = await pool.query(
      'SELECT * FROM products WHERE category = $1 AND id != $2 LIMIT 5',
      [product.rows[0].category, req.params.productId]
    );
    res.json(similarProducts.rows);
  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get a specific product by ID.
 * 
 * @param {string} id The ID of the product to get.
 * @return {JSON} A JSON object containing the product.
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

