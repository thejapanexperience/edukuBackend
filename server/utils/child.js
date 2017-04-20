const axios = require('axios');

const User = require('../models/User');

exports.createChildUserMongo = (newAuth0User, originUser) => {
  const { user_id, app_metadata } = newAuth0User.data;

  return User.create({
    user_id,
    payment_status: 0,
    origin_user: originUser,
    child_users: [],
    child_user_allowance: 0,
    roles: app_metadata.roles,
    meta: { game_info: 1 },
  });
};

exports.createChildUserAuth0 = (newUser, originUser) => (
  axios.post(
    'https://ziyaemanet.auth0.com/api/v2/users',
    {
      connection: 'Username-Password-Authentication',
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      user_metadata: {},
      email_verified: false,
      verify_email: false,
      app_metadata: {
        init: true,
        payment_status: 0,
        origin_user: originUser,
        roles: [newUser.role],
      },
    },
    { headers: { authorization: `Bearer ${process.env.AUTH0_MANAGEMENT}` } }
  )
);
