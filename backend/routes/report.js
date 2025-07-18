const express = require('express');
const { protect, isManagerOrAbove } = require('../middleware/auth');
const Dispatch = require('../models/Dispatch');
const Inventory = require('../models/Inventory');
const Salary = require('../models/Salary');

const router = express.Router();

// Export dispatch report as CSV
router.get('/dispatch', protect, isManagerOrAbove, async (req, res) => {
  const dispatches = await Dispatch.find();
  let csv = 'Order Number,Client,Status,Assigned To,Dispatch Date,Delivery Date\n';
  dispatches.forEach(d => {
    csv += `${d.orderNumber},${d.client},${d.status},${d.assignedTo || ''},${d.dispatchDate || ''},${d.deliveryDate || ''}\n`;
  });
  res.header('Content-Type', 'text/csv');
  res.attachment('dispatch_report.csv');
  res.send(csv);
});

// Export inventory report as CSV
router.get('/inventory', protect, isManagerOrAbove, async (req, res) => {
  const items = await Inventory.find();
  let csv = 'Name,Quantity,Description\n';
  items.forEach(i => {
    csv += `${i.name},${i.quantity},${i.description || ''}\n`;
  });
  res.header('Content-Type', 'text/csv');
  res.attachment('inventory_report.csv');
  res.send(csv);
});

// Export salary report as CSV
router.get('/salary', protect, isManagerOrAbove, async (req, res) => {
  const salaries = await Salary.find();
  let csv = 'Employee ID,Amount,Month,Status\n';
  salaries.forEach(s => {
    csv += `${s.employeeId},${s.amount},${s.month || ''},${s.status || ''}\n`;
  });
  res.header('Content-Type', 'text/csv');
  res.attachment('salary_report.csv');
  res.send(csv);
});

module.exports = router;