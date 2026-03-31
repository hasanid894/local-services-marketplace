const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');
const { attachDemoUser, requireRole } = require('../middleware/authMiddleware');

router.use(attachDemoUser);

router.get('/', controller.getServices);
router.get('/:id', controller.getServiceById);
router.post('/', requireRole('provider', 'admin'), controller.createService);
router.put('/:id', requireRole('provider', 'admin'), controller.updateService);
router.delete('/:id', requireRole('provider', 'admin'), controller.deleteService);

module.exports = router;
