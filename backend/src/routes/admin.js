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
  uploadImage,
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
router.post('/upload-image', upload.single('image'), uploadImage);

router.post(
  '/apartments',
  upload.array('images', 50),
  [
    body('apartmentId').notEmpty().withMessage('Apartment Code is required.'),
    body('districtId').notEmpty().withMessage('District is required.'),
    body('floor').optional({ checkFalsy: true }).isNumeric().withMessage('Floor must be a number.'),
    body('price').isNumeric().withMessage('Price must be a number.'),
    body('buildingNo').optional({ checkFalsy: true }).trim(),
    body('apartmentNo').optional({ checkFalsy: true }).trim(),
    body('rooms').optional({ checkFalsy: true }).isNumeric().withMessage('Rooms must be a number.'),
  ],
  createApartment
);
router.put('/apartments/:id', upload.array('images', 50), updateApartment);
router.delete('/apartments/:id', deleteApartment);
router.patch('/apartments/:id/toggle-featured', toggleFeatured);
router.patch('/apartments/:id/toggle-available', toggleAvailable);

module.exports = router;
