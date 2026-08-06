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

    const user = await User.findOne({ username: "user1" });
    if (!user) {
        throw new Error("User 'user1' not found in database. Please ensure 'user1' is registered first.");
    }

    initdata.data = initdata.data.map((obj) => ({
        ...obj,
        owner: user._id,
    }));

    await Listing.insertMany(initdata.data);
    console.log("Database initialized with sample data");
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