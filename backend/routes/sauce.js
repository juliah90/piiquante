const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');

const Sauce = require('../models/sauce');

router.post('/', (sauceCtrl.createSauce));

module.exports = router;