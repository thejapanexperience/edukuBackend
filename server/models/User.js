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
      .then(() => res.handle(null, 'MONGO INIT OF AUTH0 LOCK SIGNUP COMPLETE'))
      .catch(res.handle);
  } else {
    res.handle(null, '');
  }
};

userSchema.statics.getChildUser = (req, res) => {
  User.findOne({ user_id: req.user.sub })
    .then(user => User.find({ user_id: { $in: user.child_users } }))
    .then(users => res.handle(null, users))
    .catch(res.handle);
};

const createChildUserMongo = (newAuth0User, originUser) => {
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

const createChildUserAuth0 = (newUser, originUser) => (
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

userSchema.statics.createChildUser = (req, res) => {
  const { sub, app_metadata } = req.user;
  const { payment_status, origin_user, roles } = app_metadata;
  let auth0CreationResults = null;

  if (origin_user) {
    User.findOne({ user_id: origin_user })
      .then((user) => {
        // determine if child user creation is allowed and begin auth0 account creation
        if (user.payment_status > moment().unix()) {
          if (roles[0] !== 'student' && user.child_users.length + req.body.newUsers.length <= user.child_user_allowance) {
            const auth0Promises = [];
            req.body.newUsers.forEach((element) => {
              auth0Promises.push(createChildUserAuth0(element, origin_user));
            });

            return Promise.all(auth0Promises);
          } else {
            return new Promise((resolve, reject) => {
              reject('INVALID ROLE OR USER ALLOWANCE INSUFFICIENT');
            });
          }
        } else {
          return new Promise((resolve, reject) => {
            reject('EXPIRED SUBSCRIPTION');
          });
        }
      })
      .then((results) => {
        // save results of auth0 account creation to variable and begin mongodb user creation
        auth0CreationResults = results;
        const mongoPromises = [];
        auth0CreationResults.forEach((element) => {
          mongoPromises.push(createChildUserMongo(element, origin_user));
        });

        return Promise.all(mongoPromises);
      })
      .then(() => User.findOne({ user_id: origin_user }))
      .then((user) => {
        // save child users to origin user in mongo
        auth0CreationResults.forEach((creationResult) => {
          user.child_users.push(creationResult.data.user_id);
        });
        return Promise.all([user.save(), User.findOne({ user_id: sub })]);
      })
      .then((results) => {
        // save child users to creating user in mongo
        auth0CreationResults.forEach((creationResult) => {
          results[1].child_users.push(creationResult.data.user_id);
        });
        auth0CreationResults = null;
        return results[1].save();
      })
      .then(() => {
        // completed child user creation in mongo and auth0
        res.handle(null, 'USER CREATION COMPLETE');
      })
      .catch(res.handle);
  } else if (payment_status > moment().unix()) {
    User.findOne({ user_id: sub })
      .then((user) => {
        // determine if child user creation is allowed and begin auth0 account creation
        if (roles[0] !== 'student' && user.child_users.length + req.body.newUsers.length <= user.child_user_allowance) {
          const auth0Promises = [];
          req.body.newUsers.forEach((element) => {
            auth0Promises.push(createChildUserAuth0(element, sub));
          });

          return Promise.all(auth0Promises);
        } else {
          return new Promise((resolve, reject) => {
            reject('INVALID ROLE OR USER ALLOWANCE INSUFFICIENT');
          });
        }
      })
      .then((results) => {
        // save results of auth0 account creation to variable and begin mongodb user creation
        auth0CreationResults = results;
        const mongoPromises = [];
        auth0CreationResults.forEach((element) => {
          mongoPromises.push(createChildUserMongo(element, sub));
        });

        return Promise.all(mongoPromises);
      })
      .then(() => User.findOne({ user_id: sub }))
      .then((user) => {
        // save child users to origin user(sub is the requesting user and origin user in this case) in mongo
        auth0CreationResults.forEach((creationResult) => {
          user.child_users.push(creationResult.data.user_id);
        });
        return user.save();
      })
      .then(() => {
        // completed child user creation in mongo and auth0
        res.handle(null, 'USER CREATION COMPLETE');
      })
      .catch(res.handle);
  } else {
    res.handle('EXPIRED SUBSCRIPTION');
  }
};

User = mongoose.model('users', userSchema);
module.exports = User;
