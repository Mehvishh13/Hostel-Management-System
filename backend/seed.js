// backend/seed.js - Create Fixed Admin and Warden Accounts
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixedAccounts = [
  {
    name: 'Admin User',
    email: 'admin769@hostel.com',
    password: 'admin123#769',
    role: 'admin',
    phoneNumber: '9999999999'
  },
  {
    name: 'Warden User',
    email: 'warden769@hostel.com',
    password: 'warden123#769',
    role: 'warden',
    phoneNumber: '8888888888'
  }
];

async function seedAdminAccounts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel-management');
    console.log('✅ MongoDB Connected!\n');

    console.log('🔄 Creating fixed admin and warden accounts...\n');

    for (const account of fixedAccounts) {
      // Check if account already exists
      const exists = await User.findOne({ email: account.email });
      
      if (exists) {
        console.log(`⚠️  ${account.role.toUpperCase()} account already exists: ${account.email}`);
        // Update password in case it was changed
        exists.password = account.password;
        await exists.save();
        console.log(`   Password reset to default\n`);
      } else {
        await User.create(account);
        console.log(`✅ ${account.role.toUpperCase()} account created successfully!`);
        console.log(`   Email: ${account.email}`);
        console.log(`   Password: ${account.password}\n`);
      }
    }

    console.log('\n📋 ADMIN/WARDEN LOGIN CREDENTIALS:');
    console.log('=====================================');
    console.log('\n👨‍💼 ADMIN:');
    console.log('   Email: admin769@hostel.com');
    console.log('   Password: admin123#769\n');
    console.log('👮 WARDEN:');
    console.log('   Email: warden769@hostel.com');
    console.log('   Password: warden123#769\n');
    console.log('=====================================\n');
    console.log('✅ All done! You can now login with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdminAccounts();