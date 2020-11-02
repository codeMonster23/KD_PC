const soap = require('soap');
const webConfig = require('../config/web.config');

module.exports = {
    getUserSysInfoCount: function (userName, productName) {
        return new Promise((resolve, reject) => {
            try {
                soap.createClient(webConfig.drmWebService, function (err, client) {
                    client["GetUserSysInfoCount"]({UserName:userName,ProductName:productName}, function (err, result) {
                        if (err) {
                            resolve({});
                        } else {
                            resolve(result["GetUserSysInfoCountResult"]);
                        }
                    });
                });
            } catch (error) {
                resolve({});
            }
        });
    },
    getUserIsIE:function(req){
        var userAgent=req.headers['user-agent'];
        rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
        rFirefox = /(firefox)\/([\w.]+)/,
        rOpera = /(opera).+version|(opr)\/([\w.]+)/,
        //rOpera = /(opera).+version\/([\w.]+)/,
        rChrome = /(chrome)\/([\w.]+)/,
        rSafari = /version\/([\w.]+).*(safari)/;
        var ua = userAgent.toLowerCase();

        var version = "0";
        var match = rMsie.exec(ua);
        if (match != null||ua.indexOf('mozilla/4.0 (windows; u; windows nt 5.1; zh-tw; rv:1.9.0.11)')>=0) {
            return true;
            // cnkibrowser.msie = true;
            // cnkibrowser.name = "msie";
            // version = match[2] || "0";
        }
        return false;
    }
};