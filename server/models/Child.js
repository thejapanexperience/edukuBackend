const moment = require('moment');

const User = require('./User');
const childUtils = require('../utils/child');

exports.getChildUser = (req, res) => {
  User.findOne({ user_id: req.user.sub })
    .then(user => User.find({ user_id: { $in: user.child_users } }))
    .then(users => res.handle(null, users))
    .catch(res.handle);
};

// exports.deleteChildUser = (req, res) => {
//   const { sub, app_metadata } = req.user;
//   const { payment_status, origin_user, roles } = app_metadata;
//
//   User.find({ user_id: sub })
//     .then
//
//   // User.findOne({ user_id: sub })
//   //   .then((user) => {
//   //     user.child_users = user.child_users.filter((element) => {
//   //
//   //     });
//   //   })
//   //   .catch(res.handle);
// };

exports.createChildUser = (req, res) => {
  const sub = req.user.sub;
  const app_metadata = req.user['https://localhost:8443/app_metadata'];
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
              auth0Promises.push(childUtils.createChildUserAuth0(element, origin_user));
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
          mongoPromises.push(childUtils.createChildUserMongo(element, origin_user));
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
            auth0Promises.push(childUtils.createChildUserAuth0(element, sub));
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
          mongoPromises.push(childUtils.createChildUserMongo(element, sub));
        });

        return Promise.all(mongoPromises);
      })
      .then(() => User.findOne({ user_id: sub }))
      .then((user) => {
        // save child users to origin user(sub is the requesting user and origin user in this case) in mongo
        auth0CreationResults.forEach((creationResult) => {
          user.child_users.push(creationResult.data.user_id);
        });
        auth0CreationResults = null;
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
