const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Create the model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
