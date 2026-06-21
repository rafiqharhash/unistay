require('dotenv').config();
const mongoose = require('mongoose');
const Apartment = require('./models/Apartment');
const cloudinary = require('./config/cloudinary');

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

const wipeApartments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    const apartments = await Apartment.find({});
    console.log(`🗑️  Found ${apartments.length} apartment(s) to delete...`);

    let deletedImages = 0;
    for (const apt of apartments) {
      for (const imgUrl of apt.images) {
        await deleteFromCloudinary(imgUrl);
        deletedImages++;
      }
    }

    const result = await Apartment.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} apartment(s) from database.`);
    console.log(`🖼️  Removed ${deletedImages} image(s) from Cloudinary.`);

    await mongoose.connection.close();
    console.log('✅ Done. All apartments wiped successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

wipeApartments();
