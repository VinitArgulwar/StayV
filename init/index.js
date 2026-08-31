const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/users.js");

async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    let admin = await User.findOne({ username: "admin" });
    if (!admin) {
        // If user1 exists, check if we should make user1 admin or create admin
        let user1 = await User.findOne({ username: "user1" });
        if (user1) {
            user1.role = "admin";
            await user1.save();
            admin = user1;
            console.log("Updated 'user1' to admin role");
        } else {
            const newAdmin = new User({
                email: "admin@stayv.com",
                username: "admin",
                role: "admin"
            });
            admin = await User.register(newAdmin, "admin123");
            console.log("Created default admin user: 'admin' (password: 'admin123')");
        }
    } else {
        if (admin.role !== "admin") {
            admin.role = "admin";
            await admin.save();
        }
    }

    initdata.data = initdata.data.map((obj) => ({
        ...obj,
        owner: admin._id,
    }));

    await Listing.insertMany(initdata.data);
    console.log("Database initialized with sample data owned by admin:", admin.username);
};

main()
    .then(async () => {
        console.log("Connected to MongoDB");
        await initDB();
        await mongoose.connection.close();
        console.log("Database connection closed");
    })
    .catch((err) => {
        console.error("Error: ", err);
    });