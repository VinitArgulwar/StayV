const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["user", "project_manager", "admin"],
        default: "user"
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameQueryFields: ["email"]
});
module.exports = mongoose.model("User", userSchema);