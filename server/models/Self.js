const axios = require('axios');

const User = require('./User');
const Stat = require('./Stat');

exports.initFromLock = (req, res) => {
  const sub = req.user.sub;
  const app_metadata = req.user['https://localhost:8443/app_metadata'];
  const user_metadata = req.user['https://localhost:8443/user_metadata'];
  const { roles, init } = app_metadata;

  if (!init) {
    User.findOne({ user_id: sub })
      .then((result) => {
        if (result) {
          return new Promise((resolve, reject) => {
            reject('USER ALREADY EXISTS IN MONGO');
          });
        }
        return Stat.create({});
      })
      .then(statRef => User.create({
        user_id: sub,
        name: user_metadata.name,
        roles,
        game_stats: statRef._id,
      }))
      .then(() => axios.patch(`https://thejapanexperience.auth0.com/api/v2/users/${sub}`, { app_metadata: { init: true } }, { headers: { authorization: `Bearer ${process.env.AUTH0_MANAGEMENT}` } }))
      .then(() => res.handle(null, 'MONGO INIT OF AUTH0 LOCK SIGNUP COMPLETE'))
      .catch(res.handle);
  } else {
    res.handle('USER HAS ALREADY BEEN INITIALIZED IN AUTH0 AND MONGO');
  }
};
