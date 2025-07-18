const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  status: { type: String, enum: ['ready', 'packed', 'in_transit', 'delivered'], default: 'ready' },
  assignedTo: { type: String },
  dispatchDate: { type: Date },
  deliveryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Dispatch', dispatchSchema);