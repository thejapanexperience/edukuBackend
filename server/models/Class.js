const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  students: [{ type: String }],
});

const Class = mongoose.model('classes', classSchema);
module.exports = Class;
