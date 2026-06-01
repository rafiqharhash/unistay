const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { validationResult } = require('express-validator');
const District = require('../models/District');
const Apartment = require('../models/Apartment');

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'unistay/districts') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Helper: delete image from Cloudinary by URL
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Extract public_id from URL
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

// @desc    Get all districts with apartment count
// @route   GET /api/districts
// @access  Public
const getDistricts = async (req, res, next) => {
  try {
    const districts = await District.aggregate([
      {
        $lookup: {
          from: 'apartments',
          localField: '_id',
          foreignField: 'districtId',
          as: 'apartments',
        },
      },
      {
        $addFields: {
          apartmentCount: { $size: '$apartments' },
          availableCount: {
            $size: {
              $filter: {
                input: '$apartments',
                as: 'apt',
                cond: { $eq: ['$$apt.available', true] },
              },
            },
          },
        },
      },
      {
        $project: { apartments: 0 },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single district
// @route   GET /api/districts/:id
// @access  Public
const getDistrict = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found.' });
    }

    const apartmentCount = await Apartment.countDocuments({ districtId: district._id });
    const availableCount = await Apartment.countDocuments({ districtId: district._id, available: true });

    res.status(200).json({
      success: true,
      data: { ...district.toObject(), apartmentCount, availableCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create district
// @route   POST /api/admin/districts
// @access  Protected
const createDistrict = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, googleMapsUrl } = req.body;
    let coverImage = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      coverImage = result.secure_url;
    }

    const district = await District.create({ name, description, coverImage, googleMapsUrl });

    res.status(201).json({
      success: true,
      message: 'District created successfully.',
      data: district,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update district
// @route   PUT /api/admin/districts/:id
// @access  Protected
const updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found.' });
    }

    const { name, description, googleMapsUrl } = req.body;
    if (name) district.name = name;
    if (description !== undefined) district.description = description;
    if (googleMapsUrl !== undefined) district.googleMapsUrl = googleMapsUrl;

    if (req.file) {
      // Delete old image
      if (district.coverImage) await deleteFromCloudinary(district.coverImage);
      const result = await uploadToCloudinary(req.file.buffer);
      district.coverImage = result.secure_url;
    }

    const updated = await district.save();

    res.status(200).json({
      success: true,
      message: 'District updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete district
// @route   DELETE /api/admin/districts/:id
// @access  Protected
const deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found.' });
    }

    // Delete cover image from Cloudinary
    if (district.coverImage) await deleteFromCloudinary(district.coverImage);

    // Delete all apartments in this district
    const apartments = await Apartment.find({ districtId: district._id });
    for (const apt of apartments) {
      for (const imgUrl of apt.images) {
        await deleteFromCloudinary(imgUrl);
      }
    }
    await Apartment.deleteMany({ districtId: district._id });

    await district.deleteOne();

    res.status(200).json({
      success: true,
      message: 'District and all associated apartments deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict,
};
