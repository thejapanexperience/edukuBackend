const mongoose = require('mongoose');
const moment = require('moment');
const axios = require('axios');

let User;

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  payment_status: { type: Number, required: true },
  origin_user: { type: String },
  child_users: [{ type: String }],
  child_user_allowance: { type: Number, required: true },
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
      child_users: [],
      child_user_allowance: 1,
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

const createChildUserMongo = (newUser, originUser) => {
};

const createChildUserAuth0 = (newUser, originUser) => {
  return axios.post(
    `https://ziyaemanet.auth0.com/api/v2/users`,
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
      }
    },
    { headers: { authorization: `Bearer ${process.env.AUTH0_MANAGEMENT}` } }
  );
};

userSchema.statics.createChildUser = (req, res) => {
  const { sub, app_metadata } = req.user;
  const { payment_status, origin_user, roles } = app_metadata;
  let creationResults = null;

  if (origin_user) {
    User.findOne({ user_id: origin_user })
      .then((user) => {
        // determine if child user creation is allowed and begin creation
        if (user.payment_status > moment().unix()) {
          if (roles[0] !== 'student' && user.child_users.length + req.body.newUsers.length < user.child_user_allowance) {
            const mongoPromises = [];
            // req.body.newUsers.forEach((element) => {
            //   mongoPromises.push(createChildUserMongo(element, origin_user));
            // });

            const auth0Promises = [];
            req.body.newUsers.forEach((element) => {
              auth0Promises.push(createChildUserAuth0(element, origin_user));
            });

            return Promise.all([...auth0Promises]);
          } else {
            res.handle('INVALID ROLE OR USER ALLOWANCE INSUFFICIENT');
          }
        } else {
          res.handle('EXPIRED SUBSCRIPTION');
        }
      })
      .then((results) => {
        // save results of auth0 and mongodb user creation
        creationResults = results;
        return User.findOne({ user_id: origin_user });
      })
      .then((user) => {
        // save child users to origin user
        creationResults.forEach((creationResult) => {
          if (creationResult.data.user_id) {
            user.child_users.push(creationResult.data.user_id);
          }
        });
        return Promise.all([user.save(), User.findOne({ user_id: sub })]);
      })
      .then((results) => {
        // save child users to creating user
        creationResults.forEach((creationResult) => {
          if (creationResult.data.user_id) {
            results[1].child_users.push(creationResult.data.user_id);
          }
        });
        creationResults = null;
        return results[1].save();
      })
      .then(() => {
        // complete child user creation
        res.handle(null, 'USER CREATION COMPLETE');
      })
      .catch(res.handle);
  } else {
    console.log('NO ORIGIN USER FOUND');
    // if () {
    //
    // } else {
    //
    // }
  }
};

User = mongoose.model('users', userSchema);
module.exports = User;
