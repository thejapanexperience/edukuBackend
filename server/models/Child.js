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

function filterAllExceptStudent(newUsers) {
  return newUsers.filter((element) => {
    if (element.role !== 'student') return false;
    return true;
  });
}

// administrators: student, educator, administrator, other
// educator: student
// parent: student
// other: student
// student: none
function filterNewUsers(newUsers, role) {
  // filters new users based on what the requesting user role may create
  // TODO: VALIDATE NEW USERS, XSS FILTER, ETC
  // REMOVE USERS WHO DO NOT PASS CHECKS

  switch (role) {
    case 'administrator':
      return newUsers;
    case 'parent':
      return filterAllExceptStudent(newUsers);
    case 'student':
      return [];
    case 'educator':
      return filterAllExceptStudent(newUsers);
    case 'other':
      return filterAllExceptStudent(newUsers);
    default:
      return [];
  }
}

exports.createChildUser = (req, res) => {
  const sub = req.user.sub; // current user that is requesting this action
  const app_metadata = req.user['https://localhost:8443/app_metadata'];
  const { payment_status, origin_user, roles } = app_metadata;
  let auth0CreationResults = null;

  // TODO: MOVE NEW USER FILTERING HERE, IMPLEMENTED IN TWO .then's CURRENTLY
  // CHECK FOR AND DENY OF LARGE REQUESTS FOR NEW USERS SHOULD BE HERE
  // DENY ALL REQUESTS WHERE LENGTH OF req.body.newUsers DOES NOT MATCH OUTPUT OF filterNewUsers

  if (origin_user) { // if there is an origin user this means that the requesting user is a child
    User.findOne({ user_id: origin_user })
      .then((user) => {
        // determine if child user creation is allowed and begin auth0 account creation
        if (user.payment_status > moment().unix()) {
          if (user.child_users.length + req.body.newUsers.length <= user.child_user_allowance) {
            // TODO: CHECK FOR EXTREMELY LARGE REQUESTS OF NEW UERS AND DENY
            // COULD POSSIBLY SLOW DOWN SERVER?

            // filter new users to allowed types
            const newUsersFiltered = filterNewUsers(req.body.newUsers, roles[0]);

            if (newUsersFiltered.length === 0) {
              return new Promise((resolve, reject) => {
                reject('NO NEW USERS TO CREATE');
              });
            }

            // create promises which create auth0 user accounts
            const auth0Promises = [];
            newUsersFiltered.forEach((element) => {
              auth0Promises.push(childUtils.createChildUserAuth0(element, origin_user));
            });

            return Promise.all(auth0Promises);
          } else {
            return new Promise((resolve, reject) => {
              reject('USER ALLOWANCE INSUFFICIENT');
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
        // save child users to creating user in mongo (results[1] is a refernce to the creating user in mongo)
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
    // user creation with no origin user
    User.findOne({ user_id: sub })
      .then((user) => {
        // determine if child user creation is allowed and begin auth0 account creation
        if (user.child_users.length + req.body.newUsers.length <= user.child_user_allowance) {
          // TODO: CHECK FOR EXTREMELY LARGE REQUESTS OF NEW UERS AND DENY
          // COULD POSSIBLY SLOW DOWN SERVER?

          // filter new users to allowed types
          const newUsersFiltered = filterNewUsers(req.body.newUsers, roles[0]);

          if (newUsersFiltered.length === 0) {
            return new Promise((resolve, reject) => {
              reject('NO NEW USERS TO CREATE');
            });
          }

          // create promises which create auth0 user accounts
          const auth0Promises = [];
          newUsersFiltered.forEach((element) => {
            auth0Promises.push(childUtils.createChildUserAuth0(element, sub));
          });

          return Promise.all(auth0Promises);
        } else {
          return new Promise((resolve, reject) => {
            reject('USER ALLOWANCE INSUFFICIENT');
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
        // save child users to user in mongo
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
