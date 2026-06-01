const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    apartmentId: {
      type: String,
      required: [true, 'Apartment ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    buildingNo: {
      type: String,
      required: [true, 'Building number is required'],
      trim: true,
    },
    apartmentNo: {
      type: String,
      required: [true, 'Apartment number is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    rooms: {
      type: Number,
      required: [true, 'Number of rooms is required'],
      min: [1, 'Must have at least 1 room'],
    },
    capacity: {
      type: Number,
      default: 1,
      min: [1, 'Capacity must be at least 1'],
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    airConditioning: {
      type: Boolean,
      default: false,
    },
    availableBeds: {
      type: Number,
      default: 0,
      min: [0, 'Available beds cannot be negative'],
    },
    available: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    amenities: {
      type: [String],
      default: [],
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Indexes for common queries
apartmentSchema.index({ districtId: 1 });
apartmentSchema.index({ price: 1 });
apartmentSchema.index({ featured: 1 });
apartmentSchema.index({ available: 1 });
apartmentSchema.index({ apartmentId: 'text' });

module.exports = mongoose.model('Apartment', apartmentSchema);
