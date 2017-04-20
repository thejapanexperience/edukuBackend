const axios = require('axios');

const User = require('./User');

exports.initFromLock = (req, res) => {
  const sub = req.user.sub;
  const app_metadata = req.user['https://localhost:8443/app_metadata'];
  const { payment_status, origin_user, roles, init } = app_metadata;

  if (!init) {
    User.findOne({ user_id: sub })
      .then((result) => {
        if (result) {
          return new Promise((resolve, reject) => {
            reject('USER ALREADY EXISTS IN MONGO');
          });
        } else {
          return User.create({
            user_id: sub,
            payment_status,
            origin_user,
            child_users: [],
            child_user_allowance: 1,
            roles,
            meta: { game_info: 1 },
          });
        }
      })
      .then(() => axios.patch(
        `https://ziyaemanet.auth0.com/api/v2/users/${sub}`,
        { app_metadata: { init: true } },
        { headers: { authorization: `Bearer ${process.env.AUTH0_MANAGEMENT}` } }
      ))
      .then(() => res.handle(null, 'MONGO INIT OF AUTH0 LOCK SIGNUP COMPLETE'))
      .catch(res.handle);
  } else {
    res.handle('USER HAS ALREADY BEEN INITIALIZED IN AUTH0 AND MONGO');
  }
};
