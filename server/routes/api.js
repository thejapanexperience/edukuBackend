const router = require('express').Router();
const jwtAuthz = require('express-jwt-authz');

const checkManageAuth = jwtAuthz(['manage']);
// const checkAdminAuth = jwtAuthz(['admin']);

// router.use('/validate-jwt', require('./validateJwt'));

router.use('/child', checkManageAuth, require('./child'));
router.use('/self', checkManageAuth, require('./self'));
// router.use('/admin', checkAdminAuth, require('./admin'));

module.exports = router;
