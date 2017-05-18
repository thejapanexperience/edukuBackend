const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  payment_status: { type: Number, default: 0 },
  origin_user: { type: String, default: '' },
  child_users: [{ type: String }],
  child_user_allowance: { type: Number, default: 0 },
  roles: [{ type: String, required: true }],
  game_stats: { type: mongoose.Schema.Types.ObjectId, ref: 'stats', required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }],
}, { minimize: false });

const User = mongoose.model('users', userSchema);
module.exports = User;
