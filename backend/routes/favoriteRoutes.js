const express       = require('express');
const router        = express.Router();
const controller    = require('../controllers/favoriteController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRole('customer'));

router.get('/', controller.listMine);
router.post('/', controller.addFavorite);
router.delete('/:providerId', controller.removeFavorite);

module.exports = router;
