const axios = require('axios');
const moment = require('moment');

const User = require('../models/User');
const Stat = require('../models/Stat');

function createChildUserMongo(newAuth0User, originUser, gameStatsObjectId) {
  const { user_id, app_metadata, user_metadata } = newAuth0User.data;

  return User.create({
    user_id,
    name: user_metadata.name,
    origin_user: originUser,
    roles: app_metadata.roles,
    game_stats: gameStatsObjectId,
  });
}

function createChildUserAuth0(newUser, originUser) {
  return axios.post(
    'https://thejapanexperience.auth0.com/api/v2/users',
    {
      connection: 'Username-Password-Authentication',
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      user_metadata: { name: newUser.name },
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
  );
}

exports.checkPaymentAllowanceThenCreateUsers = (targetUser, newUsersFiltered, handle) => {
  User.findOne({ user_id: targetUser })
    .then((user) => {
      // check payment status for expired subscription
      if (user.payment_status < moment().unix()) {
        return new Promise((resolve, reject) => reject('EXPIRED SUBSCRIPTION'));
      }

      // confirm that the origin user has sufficient child user allowance
      if (user.child_users.length + newUsersFiltered.length > user.child_user_allowance) {
        return new Promise((resolve, reject) => reject('INSUFFICIENT USER ALLOWANCE'));
      }

      console.log('PASSED ALLOWANCE AND SUBSCRIPTION CHECKS');
      // confirmed payment status and child allowance, begin auth0 account creation
      const auth0Promises = newUsersFiltered.map(element =>
        createChildUserAuth0(element, targetUser)
      );

      // create documents for storing game stats
      const statsPromises = newUsersFiltered.map(() =>
        Stat.create({})
      );

      // wait for and confirm:
      // creation of all child user accounts in auth0
      // initialization of game stat documents
      return Promise.all([...auth0Promises, ...statsPromises]);
    })
    .then((creationResults) => {

      // seperate results of auth0 and game stats
      const auth0Results = creationResults.slice(0, newUsersFiltered.length);
      const statsResults = creationResults.slice(newUsersFiltered.length);


      // begin creation of all child accounts in mongo
      const mongoPromises = auth0Results.map((element, index) =>
        createChildUserMongo(element, targetUser, statsResults[index]._id)
      );

      // wait for creation of all child user accounts in mongo
      // get reference to origin user so we may add child users
      return Promise.all([User.findOne({ user_id: targetUser }), ...mongoPromises]);
    })
    .then((mongoCreationResults) => {
      // remove reference to origin user and save it to a variable
      const user = mongoCreationResults.shift();

      // add child users to origin user
      mongoCreationResults.forEach(element =>
        user.child_users.push(element.user_id)
      );

      // save changes to origin user
      return user.save();
    })
    .then(() => handle(null, 'CHILD USER CREATION COMPLETE'))
    .catch(handle);
};
