const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getStats } = require('../controllers/adminController');
const {
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require('../controllers/districtController');
const {
  createApartment,
  updateApartment,
  deleteApartment,
  toggleFeatured,
  toggleAvailable,
  getAdminApartments,
  getAdminApartment,
} = require('../controllers/apartmentController');

const router = express.Router();

// All admin routes are protected
router.use(protect);

// Stats
router.get('/stats', getStats);

// District management
router.post(
  '/districts',
  upload.single('coverImage'),
  [body('name').notEmpty().withMessage('District name is required.')],
  createDistrict
);
router.put('/districts/:id', upload.single('coverImage'), updateDistrict);
router.delete('/districts/:id', deleteDistrict);

// Apartment management
router.get('/apartments', getAdminApartments);
router.get('/apartments/:id', getAdminApartment);
router.post(
  '/apartments',
  upload.array('images', 10),
  [
    body('districtId').notEmpty().withMessage('District is required.'),
    body('floor').isNumeric().withMessage('Floor must be a number.'),
    body('price').isNumeric().withMessage('Price must be a number.'),
    body('buildingNo').notEmpty().withMessage('Building number is required.'),
    body('apartmentNo').notEmpty().withMessage('Apartment number is required.'),
    body('rooms').isNumeric().withMessage('Rooms must be a number.'),
  ],
  createApartment
);
router.put('/apartments/:id', upload.array('images', 10), updateApartment);
router.delete('/apartments/:id', deleteApartment);
router.patch('/apartments/:id/toggle-featured', toggleFeatured);
router.patch('/apartments/:id/toggle-available', toggleAvailable);

module.exports = router;
