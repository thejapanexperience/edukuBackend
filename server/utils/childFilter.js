const User = require('../models/User');

function filterAllExceptStudent(newUsers) {
  // filters all users expect type student from new users to be created
  return newUsers.filter((element) => {
    if (element.role !== 'student') return false;
    return true;
  });
}

function filterNewUsers(newUsers, requestingUserRole) {
  // filters new users based on what the requesting user role may create
  // TODO: VALIDATE NEW USERS AND XSS FILTER
  // REMOVE USERS WHO DO NOT PASS CHECKS

  // administrators: student, educator, administrator
  // educator: student
  // parent: student
  // other: student
  // student: none

  switch (requestingUserRole) {
    case 'administrator':
      return newUsers.filter((element) => {
        const role = element.role;
        if (role === 'student' || role === 'educator' || role === 'administrator') {
          return true;
        }
        return false;
      });
    case 'parent':
      return filterAllExceptStudent(newUsers);
    case 'student':
      // this should never be invoked, unless there is an error of authorization
      return [];
    case 'educator':
      return filterAllExceptStudent(newUsers);
    case 'other':
      return filterAllExceptStudent(newUsers);
    default:
      // this should never be invoked, unless there is an error allowing invalid roles
      return [];
  }
}

function filterDeleteUsersRole(deleteUserRole, requestingUserRole) {
  // filters delete users based on what the requesting user role may delete
  // TODO: VALIDATE req.body.deleteUsers AND FILTER FOR XSS(?)
  // REMOVE USERS WHO DO NOT PASS CHECKS

  // administrators: all child of origin user/self
  // educator: none
  // parent: child student
  // other: child student
  // student: none

  // return true for roles that the requesting user is allowed to delete

  switch (requestingUserRole) {
    case 'administrator':
      if (role === 'student' || role) {

      } else {

      }
    case 'parent':
      return deleteUsers;
    case 'student':
      // this should never be invoked, unless there is an error of authorization
      return [];
    case 'educator':
      // this should never be invoked, unless a user creates a custom request
      return [];
    case 'other':
      return deleteUsers;
    default:
      // this should never be invoked, unless there is an error allowing invalid roles
      return [];
  }
}

function filterDeleteUsers(users, targetUser, requestingUser, requestingUserRole) {
  return Promise.all([
    User.findOne({ user_id: targetUser }),
    User.find({ user_id: { $in: users } })
  ])
    .then((results) => {
      const childUsers = results[0].child_users;
      const deleteUsers = results[1];
      let pass = true;

      deleteUsers.forEach((element, index) => {
        if (!childUsers.includes(element.user_id)) pass = false;
        if (!filterDeleteUsersRole(element.roles[0], requestingUserRole)) pass = false;
      });




    });
}

exports.filterRequests = async function (propertyToCheck, body, requestingUserRole, requestingUser, targetUser) {
  // check for existance and type of property
  if (body[propertyToCheck]) {
    if (!Array.isArray(body[propertyToCheck])) {
      throw new Error(`${propertyToCheck} IS NOT AN ARRAY`);
    }
  } else {
    throw new Error(`REQUEST BODY DOES NOT CONTAIN ${propertyToCheck} PROPERTY`);
  }

  // check size of request
  if (body[propertyToCheck].length > 100 || body[propertyToCheck].length === 0) {
    throw new Error(`INVALID SIZE OF ${propertyToCheck} REQUEST`);
  }

  // confirmed request body is correct type, exists, and is not excessively large
  // use const to refer to body[propertyToCheck] for convenience
  const users = body[propertyToCheck];
  let usersFiltered = null;

  // filter users based on role and action to be performed
  switch (propertyToCheck) {
    case 'newUsers':
      usersFiltered = filterNewUsers(users, requestingUserRole);

      // deny requests where user has created a custom request not using our front end
      if (usersFiltered.length !== users.length) {
        throw new Error('INVALID CUSTOM REQUEST OR ERROR WITH FILTERING');
      }

      return usersFiltered;
    case 'deleteUsers':
      // do not allow self deletion using child delete endpoint
      if (users.includes(requestingUser)) throw new Error('CANNOT DELETE SELF USING THIS END POINT');

      try {
        usersFiltered = await filterDeleteUsers(
          users,
          targetUser,
          requestingUserRole
        );
      } catch (err) {
        throw err;
      }

      break;
    default:
      throw new Error('INVALID ACTION SPECIFIED');
  }
};
