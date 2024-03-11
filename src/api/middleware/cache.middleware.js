const NodeCache = require('node-cache');

const cache = new NodeCache();

module.exports.usecache = duration => (req, res, next) => {
    if(req.method !== 'GET'){
        console.log('Cannot cache GET method!!')
        return next();
    }

    const key = req.originalUrl;
    const cacheResponse = cache.get(key);

    if(cacheResponse){
        console.log('Cache hit for '+ key);
        res.send(cacheResponse);
    }else{

        console.log('Cache miss for '+key);
        res.originalSend = res.send;
        res.send = body => {
            res.originalSend(body);
            cache.set(key, body, duration);
        }
        next();
    }
}

module.exports.delcache = key => {
    cache.del( key );
}

module.exports.getcache = key => {
    return cache.get(key);
}

module.exports.setcache = (key, body, duration) => {
    return cache.set(key, body, duration);
}