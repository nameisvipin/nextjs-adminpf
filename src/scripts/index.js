const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const AdminUser = require("../models/AdminUser").default;



dotenv.config(); // Load environment variables

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "user@gmail.com"; // Change this if needed
    const plainPassword = "12345";  // Change this if needed

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      console.log("❌ Admin user already exists");
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Create the admin user
    const newUser = new AdminUser({ email, password: hashedPassword });
    await newUser.save();

    console.log("✅ Admin user created successfully:", newUser);
    process.exit(); // Exit the script
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
