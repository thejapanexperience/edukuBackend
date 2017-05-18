const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  placeHolder: { type: String, default: 'place holder for game data' },
}, { minimize: false });

const Stat = mongoose.model('stats', statSchema);
module.exports = Stat;
