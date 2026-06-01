require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    const email = 'admin@unistay.com';
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log('ℹ️  Admin account already exists. Skipping seed.');
    } else {
      const passwordHash = await bcrypt.hash('Admin@123', 12);
      await Admin.create({ email, passwordHash });
      console.log('✅ Default admin account created:');
      console.log('   Email:    admin@unistay.com');
      console.log('   Password: Admin@123');
      console.log('');
      console.log('⚠️  IMPORTANT: Change the default password after first login!');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed. Seed complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
