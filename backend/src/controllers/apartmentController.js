const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { validationResult } = require('express-validator');
const Apartment = require('../models/Apartment');
const District = require('../models/District');



// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'unistay/apartments') => {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto', quality: 'auto', fetch_format: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      
      const readStream = streamifier.createReadStream(buffer);
      
      // Prevent unhandled stream errors from crashing Node.js
      readStream.on('error', reject);
      stream.on('error', reject);
      
      readStream.pipe(stream);
    } catch (err) {
      reject(err);
    }
  });
};

// Helper: delete image from Cloudinary by URL
const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
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

// @desc    Get all apartments (with filters)
// @route   GET /api/apartments
// @access  Public
const getApartments = async (req, res, next) => {
  try {
    const {
      districtId,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      featured,
      gender,
      available,
    } = req.query;

    const query = {};

    if (districtId) query.districtId = districtId;
    if (search) query.apartmentId = { $regex: search, $options: 'i' };
    if (gender && ['male', 'female', 'mixed'].includes(gender)) query.gender = gender;
    if (available !== undefined) query.available = available === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortQuery = sortOptions[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [apartments, total] = await Promise.all([
      Apartment.find(query)
        .populate('districtId', 'name')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum),
      Apartment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: apartments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured apartments
// @route   GET /api/apartments/featured
// @access  Public
const getFeaturedApartments = async (req, res, next) => {
  try {
    const apartments = await Apartment.find({ featured: true, available: true })
      .populate('districtId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({ success: true, data: apartments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single apartment
// @route   GET /api/apartments/:id
// @access  Public
// @desc    Upload a single image to Cloudinary (used for sequential background uploading)
// @route   POST /api/admin/upload-image
// @access  Protected
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({
      success: true,
      data: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

const getApartment = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id).populate(
      'districtId',
      'name description'
    );

    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found.' });
    }

    res.status(200).json({ success: true, data: apartment });
  } catch (error) {
    next(error);
  }
};


// @desc    Create apartment
// @route   POST /api/admin/apartments
// @access  Protected
const createApartment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Verify district exists
    const district = await District.findById(req.body.districtId);
    if (!district) {
      return res.status(400).json({ success: false, message: 'Selected district does not exist.' });
    }

    // Upload images to Cloudinary if they were sent directly in the request (fallback)
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      images = results.map((r) => r.secure_url);
    }
    
    // Add any pre-uploaded images sent as JSON array
    if (req.body.uploadedImages) {
      try {
        const preUploaded = JSON.parse(req.body.uploadedImages);
        images = [...images, ...preUploaded];
      } catch (_) {}
    }

    // Parse JSON fields
    let contactInfo = {};
    try {
      if (req.body.contactInfo) contactInfo = JSON.parse(req.body.contactInfo);
    } catch (_) {}

    const apartment = await Apartment.create({
      apartmentId: req.body.apartmentId,
      districtId: req.body.districtId,
      floor: Number(req.body.floor),
      description: req.body.description,
      buildingNo: req.body.buildingNo,
      apartmentNo: req.body.apartmentNo,
      price: Number(req.body.price),
      images,
      rooms: Number(req.body.rooms),
      capacity: Number(req.body.capacity) || 1,
      gender: req.body.gender || 'mixed',
      wifi: req.body.wifi === 'true' || req.body.wifi === true,
      desks: req.body.desks === 'true' || req.body.desks === true,
      elevator: req.body.elevator === 'true' || req.body.elevator === true,
      garden: req.body.garden === 'true' || req.body.garden === true,
      airConditioning: req.body.airConditioning === 'true' || req.body.airConditioning === true,
      fans: req.body.fans === 'true' || req.body.fans === true,
      availableBeds: Number(req.body.availableBeds) || 0,
      available: req.body.available !== 'false' && req.body.available !== false,
      featured: req.body.featured === 'true' || req.body.featured === true,
      contactInfo,
    });

    const populated = await apartment.populate('districtId', 'name');

    res.status(201).json({
      success: true,
      message: 'Apartment created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update apartment
// @route   PUT /api/admin/apartments/:id
// @access  Protected
const updateApartment = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found.' });
    }

    // Upload new images
    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map((r) => r.secure_url);
    }

    // Handle existing images and pre-uploaded new images sent from frontend
    let existingImages = apartment.images;
    if (req.body.existingImages !== undefined) {
      try {
        const toKeep = JSON.parse(req.body.existingImages);
        
        const removedImages = existingImages.filter((img) => !toKeep.includes(img));
        const deletePromises = removedImages.map((img) => deleteFromCloudinary(img));
        await Promise.all(deletePromises);

        existingImages = toKeep;
      } catch (_) {}
    }
    
    if (req.body.uploadedImages !== undefined) {
      try {
        const preUploaded = JSON.parse(req.body.uploadedImages);
        newImageUrls = [...newImageUrls, ...preUploaded];
      } catch (_) {}
    }

    // Parse JSON fields
    let contactInfo = apartment.contactInfo;
    try {
      if (req.body.contactInfo) contactInfo = JSON.parse(req.body.contactInfo);
    } catch (_) {}

    const updatableFields = [
      'apartmentId', 'districtId', 'description', 'rooms',
      'buildingNo', 'apartmentNo',
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) apartment[field] = req.body[field];
    });
    if (req.body.floor !== undefined) apartment.floor = Number(req.body.floor);

    if (req.body.price !== undefined) apartment.price = Number(req.body.price);
    if (req.body.capacity !== undefined) apartment.capacity = Number(req.body.capacity);
    if (req.body.availableBeds !== undefined) apartment.availableBeds = Number(req.body.availableBeds);
    if (req.body.rooms !== undefined) apartment.rooms = Number(req.body.rooms);
    if (req.body.gender !== undefined) apartment.gender = req.body.gender;
    if (req.body.wifi !== undefined) apartment.wifi = req.body.wifi === 'true' || req.body.wifi === true;
    if (req.body.desks !== undefined) apartment.desks = req.body.desks === 'true' || req.body.desks === true;
    if (req.body.elevator !== undefined) apartment.elevator = req.body.elevator === 'true' || req.body.elevator === true;
    if (req.body.garden !== undefined) apartment.garden = req.body.garden === 'true' || req.body.garden === true;
    if (req.body.airConditioning !== undefined) apartment.airConditioning = req.body.airConditioning === 'true' || req.body.airConditioning === true;
    if (req.body.fans !== undefined) apartment.fans = req.body.fans === 'true' || req.body.fans === true;
    if (req.body.available !== undefined) apartment.available = req.body.available === 'true' || req.body.available === true;
    if (req.body.featured !== undefined) apartment.featured = req.body.featured === 'true' || req.body.featured === true;
    apartment.contactInfo = contactInfo;
    apartment.images = [...existingImages, ...newImageUrls];

    const updated = await apartment.save();
    const populated = await updated.populate('districtId', 'name');

    res.status(200).json({
      success: true,
      message: 'Apartment updated successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete apartment
// @route   DELETE /api/admin/apartments/:id
// @access  Protected
const deleteApartment = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found.' });
    }

    // Delete all images from Cloudinary
    for (const imgUrl of apartment.images) {
      await deleteFromCloudinary(imgUrl);
    }

    await apartment.deleteOne();

    res.status(200).json({ success: true, message: 'Apartment deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/admin/apartments/:id/toggle-featured
// @access  Protected
const toggleFeatured = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found.' });
    }
    apartment.featured = !apartment.featured;
    await apartment.save();
    res.status(200).json({
      success: true,
      message: `Apartment ${apartment.featured ? 'marked as' : 'removed from'} featured.`,
      data: { featured: apartment.featured },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability status
// @route   PATCH /api/admin/apartments/:id/toggle-available
// @access  Protected
const toggleAvailable = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found.' });
    }
    apartment.available = !apartment.available;
    await apartment.save();
    res.status(200).json({
      success: true,
      message: `Apartment marked as ${apartment.available ? 'available' : 'unavailable'}.`,
      data: { available: apartment.available },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApartments,
  getApartment,
  getFeaturedApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  toggleFeatured,
  toggleAvailable,
  uploadImage,
};
