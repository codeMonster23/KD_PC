module.exports = function (req) {
    let userIp = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (userIp.split(',').length > 0) {
        userIp = userIp.split(',')[0];
    }
    if (userIp.indexOf('ffff:192.168.51') != -1) {
        userIp = '124.193.98.133';
    }
    return userIp;
};