// require('../../auth/google');
// require('../../auth/facebook')
// const passport = require('passport');
// const userController = require('../controllers/user.controller');

module.exports = function(routerx){

    routerx.get('/', function (req, res) {
        res.send('VNTHREAD API!');
    });

    //GOOGLE AUTHENTICATION
    // routerx.get('/auth/google', passport.authenticate('google'));
    // routerx.get('/oauth2/redirect/google', passport.authenticate('google', { failureRedirect: process.env.FAILED_URL_LOGIN, failureMessage: true, session: false }), userController.checkUserGoogle);
 
    // routerx.get('/auth/facebook', passport.authenticate('facebook'));
    // routerx.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: process.env.FAILED_URL_LOGIN, failureMessage: true, session: false }), userController.checkUserFacebook);

}