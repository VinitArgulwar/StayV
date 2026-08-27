const moongose = require("mongoose");
const Schema = moongose.Schema;

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // OTP expires after 5 minutes (300 seconds)
    },
});

module.exports = moongose.model("Otp", otpSchema);