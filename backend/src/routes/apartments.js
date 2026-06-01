const express = require('express');
const {
  getApartments,
  getFeaturedApartments,
  getApartment,
} = require('../controllers/apartmentController');

const router = express.Router();

router.get('/featured', getFeaturedApartments);
router.get('/', getApartments);
router.get('/:id', getApartment);

module.exports = router;
