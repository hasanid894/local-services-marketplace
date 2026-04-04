const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');
const { attachDemoUser, verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public reads — attach user if token present, but don't require it
router.get('/', attachDemoUser, controller.getServices);
router.get('/:id', attachDemoUser, controller.getServiceById);

// Write operations — require a valid JWT + provider or admin role
router.post('/', verifyToken, requireRole('provider', 'admin'), controller.createService);
router.put('/:id', verifyToken, requireRole('provider', 'admin'), controller.updateService);
router.delete('/:id', verifyToken, requireRole('provider', 'admin'), controller.deleteService);

module.exports = router;
