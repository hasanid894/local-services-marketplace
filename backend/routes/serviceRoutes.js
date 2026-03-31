const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');

router.get('/', controller.getServices);
router.post('/', controller.createService);

module.exports = router;
