const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');


router.post('/toggle', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let favorite = await Favorite.findOne({ user: userId, product: productId });
    
    if (favorite) {
      await Favorite.findByIdAndDelete(favorite._id);
      res.status(200).json({ message: 'Product removed from favorites', isFavorite: false });
    } else {
      favorite = new Favorite({ user: userId, product: productId });
      await favorite.save();
      res.status(200).json({ message: 'Product added to favorites', isFavorite: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
});

router.get('/check/:userId/:productId', async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ user: req.params.userId, product: req.params.productId });
    res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: 'Error checking favorite status', error: error.message });
  }
});

module.exports = router;