const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', 
  host: 'localhost', 
  database: 'delivprojdb', 
  password: '2OO4', 
  port: 5432, 
});



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

router.get('/similar/:productId', async (req, res) => {
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

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
