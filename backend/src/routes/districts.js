const express = require('express');
const { getDistricts, getDistrict } = require('../controllers/districtController');

const router = express.Router();

router.get('/', getDistricts);
router.get('/:id', getDistrict);

module.exports = router;
