/**
 * This file contains API routes for managing the shopping cart.
 * 
 * The routes are:
 * - POST /add: Adds a product to the cart or increases its quantity if already present.
 * - GET /:userId: Retrieves the cart for the given user.
 * 
 * The functions are:
 * - addProduct: Adds a product to the cart or increases its quantity if already present.
 * - getCart: Retrieves the cart for the given user.
 */

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * POST /add
 * Adds a product to the cart or increases its quantity if already present.
 * 
 * Parameters:
 * - userId (string): The ID of the user.
 * - productId (string): The ID of the product.
 * - quantity (number): The quantity of the product to add.
 * 
 * Returns:
 * - { message: string, cart: object }: The cart with the added product and a success message.
 * - { message: string, error: string }: An error message if the operation fails.
 */
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      // If the cart does not exist, create a new one
      cart = new Cart({ user: userId, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      // If the product is already in the cart, increase its quantity
      existingItem.quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});

/**
 * GET /:userId
 * Retrieves the cart for the given user.
 * 
 * Parameters:
 * - userId (string): The ID of the user.
 * 
 * Returns:
 * - { cart: object }: The cart for the given user.
 * - { message: string, error: string }: An error message if the operation fails.
 */
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

module.exports = router;
