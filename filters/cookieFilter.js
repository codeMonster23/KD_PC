const cookieConfig = require('../config/cookie.config');
const crypto = require('../utility/cryptoFunctions');
const async = require('async');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const request = require('request');
const uuid = require('node-uuid');
const webConfig = require('../config/web.config');
const accountUrl = webConfig.accountAddr;
const xss = require('node-xss').clean;
const errorHelper = require('../helpers/errorHelper');
let getClientIp = require('../utility/getClientIp');

// 未登录用户，跳转到登录界面

module.exports = function (req, res, callback) {
    console.log('lllllid', req.cookies['LID'])
    console.log('session:', req.session)
    console.log('sessionid:', req.session.id)
    let method = req.method.toLowerCase();
    if (method == 'get' || method == 'post' || method == 'delete' || method == 'put') {
        // req.body = xss(req.body);
        // req.query = xss(req.query);
        // req.params = xss(req.params);
        let reqUrl = req.url;
        console.log('req.url:', req.url);

        // 注册页面没有cookieFilter
        let tempBody = req.body, tempQuery = req.query, tempParams = req.params;
        // 只允许汉字、大小写字母和数字
        let pattern1 = /^[\u4e00-\u9fa5_a-zA-Z0-9、\-]+$/;
        // let pattern = new RegExp("[`~!@#$^&*()=|{}+<>/]");
        // let pattern2 = new RegExp("[`~@#$^&*=|{}+<>/]");
        // 过滤特殊符号
        let pattern2 = /^[`~#$^&*=|{}+<>/]+$/;

        // let pattern = new RegExp("[+=*\-]");
        if (reqUrl.indexOf('checkout') != -1 || reqUrl.indexOf('literatureResult') != -1 || reqUrl.indexOf('getSearchResult') != -1 || reqUrl.indexOf('libraryResult') != -1 || reqUrl.indexOf('loginChecking') != -1 || reqUrl.indexOf('home?kd=') != -1 || reqUrl.indexOf('literatureDownload') != -1 || reqUrl.indexOf('submitInfo') != -1 || reqUrl.indexOf('updatePersonalInfoC') != -1) {
            if (Object.keys(tempBody).length > 0) {
                for (let tb in tempBody) {
                    if (tempBody[tb] && pattern2.test(tempBody[tb])) {
                        errorHelper.error400(req, res);
                        return;
                    }
                }
            }
            if (Object.keys(tempQuery).length > 0) {
                for (let tq in tempQuery) {
                    if (tempBody[tq] && pattern2.test(tempQuery[tq])) {
                        errorHelper.error400(req, res);
                        return;
                    }
                }
            }
            if (Object.keys(tempParams).length > 0) {
                for (let tp in tempParams) {
                    if (tempBody[tp] && pattern2.test(tempParams[tp])) {
                        errorHelper.error400(req, res);
                        return;
                    }
                }
            }
        }
        else {
            tempBody = xss(req.body);
            tempQuery = xss(req.query);
            tempParams = xss(req.params);
            if (Object.keys(tempBody).length > 0) {
                for (let tb in tempBody) {
                    if (tempBody[tb] && !pattern1.test(tempBody[tb])) {
                        errorHelper.error400(req, res);
                        return;
                    }
                }
            }
            if (Object.keys(tempQuery).length > 0) {
                for (let tq in tempQuery) {
                    if (tempBody[tq] && !pattern1.test(tempQuery[tq])) {
                        errorHelper.error400(req, res);
                        return;
                    }
                }
            }
            if (Object.keys(tempParams).length > 0) {
                for (let tp in tempParams) {
                    if (tempBody[tp] && !pattern1.test(tempParams[tp])) {
                        errorHelper.error400(req, res);
                        return;
                    }
                }
            }
        }

        // res.setHeader('cache-control', 'no-cache');
        let viewModel = {
            user: {
                name: null,
                isOrg: false
            }
        };
        let referer = '';
        if (typeof req.headers.referer == 'undefined') {
            referer = '/';
        } else {
            let host = 'https://' + req.headers.host;
            referer = req.headers.referer.replace(host, '');
        }
        viewModel.referer = referer;


        if (typeof req.session.username != 'undefined') {
            viewModel.user.name = req.session.username;
            viewModel.user.isOrg = req.session.isOrg;
        }
        //用户在cnki中心网站已登录
        else if (typeof req.cookies['LID'] != 'undefined') {
            let uid = req.cookies['LID'];
            let claimedId = uuid.v4();
            let userIp = getClientIp(req);

            async.waterfall([
                // 获取授权
                function (cb) {
                    request({
                            url: 'https://xyz.cnki.net/cnkioauth/api/auth/access/token.html?appid=' + appId + '&secret=' + secret + '&claimedid=' + claimedId,
                            method: 'get',
                            headers: {
                                "content-type": "application/json"
                            }
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // uid登录
                function (arg, cb) {
                    if (arg && arg.indexOf('bearer') != -1) {
                        let newArg = JSON.parse(arg);
                        request({
                                url: 'http://kdjk.cnki.net/passport/resource/api/account/loginbyuid',
                                method: 'post',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer ' + newArg['access_token']
                                },
                                form: {
                                    uid
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    cb(null, JSON.parse(body));
                                } else {
                                    cb(null, null);
                                }
                            });
                    } else {
                        cb(null, null);
                    }
                },
            ], function (err, results) {
                if (err) {
                    // do nothing
                    console.log('保持登录状态出错');
                }
                else {
                    console.log("uid登录数据：", results)
                    if (results && results.errorcode == 1) {
                        // 设置cookie
                        req.session.username = results.username;
                        req.session.uid = uid;
                        req.session.openId = results.openid;
                        req.session.isVip = results.isvip;
                        req.session.isOrg = results.isorg;
                        req.session.isBindOrg = results.isbindorg;
                        viewModel.user.name = results.username
                    }
                    else {
                        // do nothing
                        console.log('保持登录状态出错11', results.errorcode);
                    }
                }
            });
        }

        callback(viewModel);
    }
    else {
        res.writeHead(405, 'Method Not Allowed', {'content-type': 'text/plain'});
        res.end('Method Not Allowed');
    }
};

