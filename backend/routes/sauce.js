const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');

const Sauce = require('../models/sauce');

router.post('/', (sauceCtrl.createSauce));
router.get('/', (sauceCtrl.allSauce));
router.get('/', (sauceCtrl.oneSauce));

module.exports = router;