require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    const newEmail = 'muhammed@unistay.com';
    const newPassword = 'Muhammed@123';
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update any existing admin account
    const result = await Admin.updateOne(
      {},
      { $set: { email: newEmail, passwordHash } }
    );

    if (result.matchedCount === 0) {
      // No admin exists yet, create one
      await Admin.create({ email: newEmail, passwordHash });
      console.log('✅ New admin account created.');
    } else {
      console.log('✅ Admin credentials updated successfully.');
    }

    console.log(`   Email:    ${newEmail}`);
    console.log(`   Password: ${newPassword}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdmin();
