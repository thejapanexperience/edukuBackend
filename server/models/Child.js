const User = require('./User');
const childCreationUtils = require('../utils/childCreation');
const childFilterUtils = require('../utils/childFilter');

exports.getChildUser = (req, res) => {

  // NOT FINISHED PROBABLY DOESNT WORK - DO IT YOURSELF ASSHOLE

  // User.findOne({ user_id: req.user.sub })
  //   .then(user => User.find({ user_id: { $in: user.child_users } }))
  //   .then(users => res.handle(null, users))
  //   .catch(res.handle);
};

exports.deleteChildUser = (req, res) => {

  // NOT FINISHED YET

  const sub = req.user.sub; // current user that is requesting this action
  const app_metadata = req.user['https://localhost:8443/app_metadata'];
  const { origin_user, roles } = app_metadata;

  // do some validation on requests
  childFilterUtils.filterRequests(
    'deleteUsers', // property in req.body to validate
    req.body,
    roles[0], // role of requesting user
    sub,
    origin_user || sub // target which owns child accounts
  )
  .then() // ADD SOME STUFF HERE!!
  .catch((err) => {
    // TODO: LOG THESE ERRORS FOR SECURITY AND DEVELOPMENT PURPOSES
    res.handle(err.message);
  });
};

exports.createChildUser = (req, res) => {
  const sub = req.user.sub; // current user that is requesting this action
  const app_metadata = req.user['https://localhost:8443/app_metadata'];
  const { origin_user, roles } = app_metadata;

  childFilterUtils.filterRequests(
    'newUsers', // property in req.body to validate
    req.body,
    roles[0] // role of requesting user
  )
  .then((newUsersFiltered) => {
    // create accounts
    console.log('PASSED FILTERING')
    childCreationUtils.checkPaymentAllowanceThenCreateUsers(
      // check for origin user, if no origin user exists requesting user is target user
      origin_user || sub,
      newUsersFiltered,
      res.handle
    );
  })
  .catch((err) => {
    // TODO: LOG THESE ERRORS FOR SECURITY AND DEVELOPMENT PURPOSES
    res.handle(err.message);
  });
};
