const jwt = require('jsonwebtoken');
const M_UserToken = require('../../api/schema/mongodb/user.token.schema');

class Auth {

  static generateTokens = (user) => {
    // Create JWT
    const accessToken = jwt.sign(
      {user},
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: String(process.env.ACCESS_TOKEN_TIME)
      }
    )
    const refreshToken = jwt.sign(
      {user},
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: String(process.env.REFRESH_TOKEN_TIME)
      }
    )
    return { accessToken, refreshToken }
  }


  
  static generateToken = (user) => {
    const accessToken = jwt.sign(
      {user},
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: String(process.env.ACCESS_TOKEN_TIME)
      }
    )
    return {accessToken};
  }



  static updateRefreshToken = async (refreshToken, next) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET , function(err, decoded) {
      if(err){
        next(false, 'RefreshToken Unauthorized: ' + err);
      }else{
        M_UserToken.find({id_user: decoded.user.id, device: decoded.user.device}, function (err, data) {
          if (err){
            next(false, 'RefreshToken Unauthorized: ' + err);
          }else{
            if(data.length == 1){
              const newTokens = Auth.generateTokens(decoded.user);
              Auth.updateValidToken(decoded.user.id, decoded.user.device, newTokens.refreshToken, function (code, result) {
                if(code){
                  next(true, newTokens);
                }else{
                  next(false, 'RefreshToken Unauthorized: ' + result);
                }
              });
            }else next(false, 'RefreshToken Unauthorized: Not match.');
          }
      });
      }
    });
  }



  static ReToken = async (refreshToken, next) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET , function(err, decoded) {
      if(err){
        next(false, 'RefreshToken Unauthorized: ' + err);
      }else{
        M_UserToken.find({id_user: Number(decoded.user.id), device: String(decoded.user.device), refresh_token: String(refreshToken)}, function (err, data) {
          if (err){
            next(false, 'RefreshToken Unauthorized: ' + err);
          }else{
            if(data.length == 1){
              next(true, Auth.generateToken(decoded.user))
            }else next(false, 'RefreshToken Unauthorized: Not match.');
          }
        });
      }
    });
  }

  static updateValidToken = async (iduser, device ,refreshToken, next) => {
      M_UserToken.findOneAndUpdate({ id_user: iduser, device: device },
      { $set: { refresh_token: refreshToken, time: new Date() } },
      { upsert: true }).exec((err, data) => {
        if(err) next(false, err);
        else next(true, data);
      });
  }

}

module.exports = Auth;











