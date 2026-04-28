const express = require('express');
const router  = express.Router();
const controller = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin only — list all users or create a user account manually
router.get('/',           verifyToken, requireRole('admin'), controller.getUsers);
router.post('/',          verifyToken, requireRole('admin'), controller.createUser);
router.delete('/:id',     verifyToken, requireRole('admin'), controller.deleteUser);

// Public — provider list for dropdowns (no sensitive data exposed)
router.get('/providers',  controller.getProviders);

// Any authenticated user — view or update a profile
router.get('/:id',    verifyToken, controller.getUser);
router.put('/:id',    verifyToken, controller.updateUser);

module.exports = router;
