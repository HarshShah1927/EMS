const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);