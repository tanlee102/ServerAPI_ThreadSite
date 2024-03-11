const axios = require('axios');

class UserServer {
    static BanUpdate(){
        axios.post(process.env.HOST_URL_MAIL+'/user/ban/check')
        .then(response => {
            console.log('send update ban!');
        })
        .catch(error => {
            console.log(error);
        });
    }
}

module.exports = UserServer;

