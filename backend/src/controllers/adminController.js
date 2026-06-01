const Apartment = require('../models/Apartment');
const District = require('../models/District');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Protected
const getStats = async (req, res, next) => {
  try {
    const [
      totalDistricts,
      totalApartments,
      availableApartments,
      featuredApartments,
      recentApartments,
    ] = await Promise.all([
      District.countDocuments(),
      Apartment.countDocuments(),
      Apartment.countDocuments({ available: true }),
      Apartment.countDocuments({ featured: true }),
      Apartment.find()
        .populate('districtId', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDistricts,
        totalApartments,
        availableApartments,
        unavailableApartments: totalApartments - availableApartments,
        featuredApartments,
        recentApartments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
