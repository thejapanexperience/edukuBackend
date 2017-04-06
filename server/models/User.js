const mongoose = require('mongoose');
const axios = require('axios');

let User;

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  payment_status: { type: Number, required: true },
  origin_user: { type: String },
  roles: [{ type: String, required: true }],
  meta: {
    game_info: { type: Number },
  },
});

userSchema.statics.initFromLock = (req, res) => {
  const { sub, app_metadata } = req.user;
  const { payment_status, origin_user, roles, init } = app_metadata;

  if (!init) {
    User.create({
      user_id: sub,
      payment_status,
      origin_user,
      roles,
      meta: { game_info: 1 },
    })
      .then(() => axios.patch(
        `https://ziyaemanet.auth0.com/api/v2/users/${sub}`,
        { app_metadata: { init: true } },
        { headers: { authorization: `Bearer ${process.env.AUTH0_MANAGEMENT}` } }
      ))
      .then(() => res.handle(null, ''))
      .catch(res.handle);
  } else {
    res.handle(null, '');
  }
};

User = mongoose.model('users', userSchema);
module.exports = User;
