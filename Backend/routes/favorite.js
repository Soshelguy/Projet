const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// Toggle the favorite status of a product for a user
router.post('/toggle', async (req, res) => {
  try {
    // Extract userId and productId from request body
    const { userId, productId } = req.body;
    
    // Check if the product is already a favorite for the user
    let favorite = await Favorite.findOne({ user: userId, product: productId });
    
    if (favorite) {
      // If it exists, remove from favorites
      await Favorite.findByIdAndDelete(favorite._id);
      res.status(200).json({ message: 'Product removed from favorites', isFavorite: false });
    } else {
      // If not, add to favorites
      favorite = new Favorite({ user: userId, product: productId });
      await favorite.save();
      res.status(200).json({ message: 'Product added to favorites', isFavorite: true });
    }
  } catch (error) {
    // Return error message if an exception occurs
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
});

// Check if a product is a favorite for a user
router.get('/check/:userId/:productId', async (req, res) => {
  try {
    // Find favorite entry by userId and productId
    const favorite = await Favorite.findOne({ user: req.params.userId, product: req.params.productId });
    
    // Respond with whether the product is a favorite
    res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    // Return error message if an exception occurs
    res.status(500).json({ message: 'Error checking favorite status', error: error.message });
  }
});

module.exports = router;

