const cookieFilter = require('../filters/cookieFilter');
const loginFilter = require('../filters/loginFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const url = webConfig.serverAddr;
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const qrcode = require('qrcode');
const errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');
let getClientIp = require('../utility/getClientIp');

module.exports = {
    // 支付方式选择
    checkout: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let workId = req.query.id || req.query.code;
                let workTitle = decodeURI(req.query.title);
                let mediaType = req.query.mediaType;
                // let price = req.query.price;
                let coverPic = req.query.coverPic;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                /* 0 文献 1期刊单期 2期刊年 3期刊全刊 4工具书 5词条 6 工具书包月、半年、年 7品得书院（图书） 8大成编客 9 活动 17 知网文化作品 18 知网文化微刊 19知网文化月会员 20知网文化年会员 */
                let callBackUrl = '';
                let orderType = req.query.ordertype || 17;
                // 文献不走此处
                if (orderType == 17) {
                    callBackUrl = '/payment/success?id=' + workId + '&orderType=' + orderType + '&mediatype=' + mediaType;
                } else if (orderType == 19 || orderType == 20) {
                    // 知网文化会员月和年
                    callBackUrl = '';
                    workId = 'KDVIP';
                } else {
                    callBackUrl = '/payment/success?id=' + workId + '&orderType=' + orderType;
                }
                let period = req.query.period || '';
                let year = req.query.year || '';
                let dbType = req.query.dbType || '';
                let author = req.query.author || '';
                let platForm = 3;
                let userIp = getClientIp(req);

                async.parallel([
                    // 账户余额
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/userbalance.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: {
                                    "openid": req.session.openId,
                                    "identifier": appId,
                                    "secret": secret,
                                    "signature": signature
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    console.log('账户余额：', resData)
                                    if (body.errorcode == 1) {
                                        cb(null, resData);
                                    } else {
                                        // res.json('用户账户余额查询失败');
                                        cb(null, null);
                                    }
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 支付宝二维码
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: {
                                    "signature": signature,
                                    "channel": '13',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                    "callbackurl": callBackUrl,
                                    "plateform": platForm,
                                    "ip": userIp
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 微信二维码
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json",
                                    "Cookies": "SID=110014"
                                },
                                json: true,
                                body: {
                                    "channel": '12',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "signature": signature,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                    "callbackurl": callBackUrl,
                                    "plateform": platForm,
                                    "ip": userIp
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 银联订单号
                    function (cb) {
                        let unionCallBackUrl = webConfig.domainName + callBackUrl;
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json",
                                    "Cookies": "SID=110014"
                                },
                                json: true,
                                body: {
                                    "channel": '7',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "signature": signature,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                    "callbackurl": unionCallBackUrl,
                                    "plateform": platForm,
                                    "ip": userIp
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 支付宝web收银台，去支付链接
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: {
                                    "signature": signature,
                                    "channel": '14',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                    "callbackurl": callBackUrl,
                                    "plateform": platForm,
                                    "ip": userIp
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    }
                ], function (err, results) {
                    if (err) {
                        // throw err;
                        errorHelper.error400(req, res);
                    }else {
                        if (results[0] && results[1] && results[2] && results[3] && results[4]) {
                            // 作品相关信息数据
                            let price = results[1].Price;
                            viewModel.workInfo = {
                                workId: workId,
                                workTitle: workTitle,
                                mediaType: mediaType,
                                price: parseFloat(price).toFixed(2),
                                coverPic: coverPic,
                                orderType: orderType,
                                period: period,
                                year: year,
                                dbType: dbType,
                                author: author
                            };
                            console.log('支付宝二维码：', results[1]);
                            console.log('微信二维码：', results[2]);
                            console.log('银联：', results[3]);
                            console.log('支付宝去支付：', results[4]);
                            // 微信二维码处理
                            qrcode.toDataURL(results[2].wechatQRCodeUrl, function (err, url) {
                                viewModel.qrcode = url;
                                // 异步查询返回数据
                                viewModel.data = {
                                    balance: results[0].rows,
                                    wechat: results[2],
                                    wechatQrcode: url,
                                    alipay: results[1],
                                    unionPay: results[3],
                                    alipayCashierUrl: results[4].AlipayCashierUrl,
                                    goAlipayOrder: results[4].TransactionCode
                                };

                                // 判断余额是否充足
                                if (parseFloat(results[0].rows.UsableMoney) + parseFloat(results[0].rows.UsableTicket) >= parseFloat(price)) {
                                    viewModel.balance = {
                                        insufficient: 0
                                    }
                                } else {
                                    viewModel.balance = {
                                        insufficient: 1
                                    }
                                }
                                res.render('payment/checkoutView', {title: '支付_知网文化', viewModel: viewModel});
                            });
                        }
                        else {
                            errorHelper.error500(req, res);
                        }
                    }

                });
            });
        })
    },
    //异步 确认支付 余额
    confirmPay: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let code = req.query.id;
                let channel = req.query.channel;
                let orderType = req.query.orderType;
                let year = req.query.year || '';
                let period = req.query.period || '';
                let openid = req.session.openId;
                let action = 'pay';
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let platForm = 3;
                let userIp = getClientIp(req);
                let formData = {
                    "signature": signature,
                    "channel": channel,
                    "year": year,
                    "code": code,
                    "period": period,
                    "ordertype": orderType, // 0文献  1期刊单期  2期刊年   7品得书院（图书） 17 知网文化作品  18 知网文化微刊 19月会员 20年会员
                    "openid": openid,
                    "action": action,
                    "plateform": platForm,
                    "identifier": appId,
                    "secret": secret,
                    "ip": userIp
                };
                console.log('支付提交参数：', formData);
                request({
                        url: webConfig.paymentAddr + '/commit.do',
                        method: 'post',
                        headers: {
                            "content-type": "application/json",
                            "Cookies": "SID=110014"
                        },
                        json: true,
                        body: formData
                    },
                    function (err, response, body) {
                        console.log('支付成功', body);
                        if (!err && response.statusCode == 200) {
                            let resData = body;
                            // 101：正在支付...；
                            // 102：已经有权限；||已经有权限，该作品试听；||已经有权限，已购买该作品所在微刊；||已经有权限，该作品的在微刊***内试听；||已经有权限，已购买包含该作品的某一本微刊；
                            // 103：免费工具书||免费词条||免费文集||免费作品；||免费微刊；
                            // 104：余额不足，请充值；
                            // 105：余额充足，请购买；
                            // 106：权限校验完成；
                            // 107：使用余额购买成功；
                            // 201：禁止售卖；
                            // 202：暂不支持整刊购买！
                            // 203：该文献已撤回；
                            // 204：该文章涉密，不提供下载，给您带来不便，敬请谅解！
                            // 205：当月下载量已超；
                            // 301：获取微信支付凭证失败；
                            // 302：CTS创建订单失败；
                            // 303：请求电商获取凭证失败；
                            // 304：请求电商获取支付宝二维码页面失败；
                            // 305：创建电商订单失败+具体错误信息；
                            // 306：余额支付：创建电商订单失败+具体错误信息；
                            // 307：CTS系统支付异常；
                            // 400：登录超时，请重新登录！
                            // 401：该机构无权下载！；
                            // 402：用户余额获取错误；
                            // 403：用户验证失败；
                            // 500：内部错误；
                            // 701：配置错误：月下载最大数量；
                            // 801：禁止充值（具体看ErrorMessage）；
                            // 900：参数错误；||参数错误，该微刊并未包含该作品；||参数错误：用户控制信息错误；||参数错误：用户信息错误；||参数错误：非法用户；||参数错误：非法应用；||参数错误：获取价格错误；||参数错误，图书不存在；||参数错误：图书取价格异常；||平台字段参数错误；||会员类型传输错误；||价格配置错误；||请检查OrderType字段；
                            // 1001：已经有权限，为2013年之前的文献；
                            if (resData.ErrorCode == 107) {
                                res.json({
                                    errorCode: 1,
                                    errorMessage: '支付成功！',
                                    orderType: orderType
                                });

                            }
                            else {
                                res.json(resData);
                            }
                        }
                        else {
                            // throw err;
                            errorHelper.async.reqFailed(res);
                        }
                    });
            });
        })
    },
    // 支付成功
    success: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let workId = req.query.id;
            let mediaType = req.query.mediatype;
            let orderType = req.query.orderType; // 0文献  1期刊单期  2期刊年   7品得书院（图书） 17 知网文化作品  18 知网文化微刊
            // 作品、微刊猜你喜欢
            if (orderType == 17) {
                var formData = {
                    appid: 'web',
                    code: 'getRecommendByPayed',
                    cid: workId,
                    username: viewModel.user.name,
                    limit: '8',
                    type: 0 // 作品
                };
                console.log('微刊猜你喜欢参数', formData);
            }
            else if (orderType == 18) {
                var formData = {
                    appid: 'web',
                    code: 'getRecommendByPayed',
                    cid: workId,
                    username: viewModel.user.name,
                    limit: '8',
                    type: 1 // 微刊
                };
            }
            // 单刊、期刊年 猜你喜欢
            else if (orderType == 1 || orderType == 2) {
                var formData = {
                    appid: 'web',
                    code: 'GetMagazineDetail',
                    thname: workId + '202020', // 得这么写
                    username: viewModel.user.name
                };
            }
            else if (orderType == 7) {
                // 图书 猜你喜欢
                var formData = {
                    appid: 'web',
                    code: 'getRecommendBook',
                    id: workId,
                    username: viewModel.user.name
                };
            }

            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {

                    if (!err && response.statusCode == 200) {
                        try {
                            let resData = JSON.parse(body);
                            console.log('支付成功猜你喜欢数据', resData.data)
                            viewModel.workId = workId;
                            viewModel.mediaType = mediaType;
                            viewModel.orderType = orderType;
                            viewModel.data = resData.data;
                            viewModel.uid = req.session.uid;
                            viewModel.openId = req.session.openId;
                            res.render('payment/successView', {
                                title: '支付成功_知网文化',
                                viewModel: viewModel
                            })
                        } catch (e) {
                            errorHelper.error500(req, res);
                        }

                    } else {
                        // throw err;
                        errorHelper.error400(req, res);
                    }
                })
        })
    },
    //会员支付
    membersCheckout: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('payment/membersCheckoutView', {title: '充值中心_知网文化', viewModel: viewModel})
        })
    },
    //会员支付成功
    paySuccess: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('payment/paySuccessView', {title: '充值中心_知网文化', viewModel: viewModel})
        })
    },
    // 支付失败
    fail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            viewModel.reloadUrl = req.url.replace('/fail', '');
            res.render('payment/failView', {title: '支付失败', viewModel: viewModel});
        })
    },

    modal: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            viewModel.type = req.query.type || '';
            res.render('payment/modalView', {title: '', viewModel});
        });

    },

    //同步 异步 支付方式选择
    checkoutOrder: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let workId = req.query.id || req.query.code;
                let workTitle = decodeURI(req.query.title);
                let mediaType = req.query.mediaType;
                // let price = req.query.price;
                let coverPic = req.query.coverPic;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                /* 0 文献 1期刊单期 2期刊年 3期刊全刊 4工具书 5词条 6 工具书包月、半年、年 7品得书院（图书） 8大成编客 9 活动 17 知网文化作品 18 知网文化微刊 19知网文化月会员 20知网文化年会员 */
                let callBackUrl = '';
                let orderType = req.query.ordertype || 17;

                // 支付方式：0余额 1微信 2支付宝和收银台 3银联
                let payType = req.query.payType || 0;

                let period = req.query.period || '';
                let year = req.query.year || '';
                let dbType = req.query.dbType || '';
                let author = req.query.author || '';
                let platForm = 3;
                let userIp = getClientIp(req);
                // 处理callback--------------------------------------
                // 作品
                if (orderType == 17) {
                    callBackUrl = '/payment/success?id=' + workId + '&orderType=' + orderType + '&mediatype=' + mediaType;
                }
                // 会员
                else if (orderType == 19 || orderType == 20) {
                    // 知网文化会员月和年
                    callBackUrl = '';
                    workId = 'KDVIP';
                }
                // 期刊单期
                else if (orderType == 1) {
                    callBackUrl = '/payment/success?id=' + workId + year + period + '&orderType=' + orderType;
                }
                else {
                    callBackUrl = '/payment/success?id=' + workId + '&orderType=' + orderType;
                }
                // 处理callback--------------------------------------

                // 余额支付
                if (payType == 0) {
                    async.parallel([
                        // 账户余额
                        function (cb) {
                            request({
                                    url: webConfig.paymentAddr + '/userbalance.do',
                                    method: 'post',
                                    headers: {
                                        "content-type": "application/json"
                                    },
                                    json: true,
                                    body: {
                                        "openid": req.session.openId,
                                        "identifier": appId,
                                        "secret": secret,
                                        "signature": signature
                                    }
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = body;
                                        if (body.errorcode == 1) {
                                            cb(null, resData);
                                        } else {
                                            cb(null, null);
                                        }
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 查询价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '13',
                                "code": workId,
                                "ordertype": orderType,
                                "period": period,
                                "year": year,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                                "callbackurl": callBackUrl,
                                "plateform": platForm,
                                "ip": userIp
                            };
                            request({
                                    url: webConfig.paymentAddr + '/commit.do',
                                    method: 'post',
                                    headers: {
                                        "content-type": "application/json"
                                    },
                                    json: true,
                                    body: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        try {
                                            let resData = body;
                                            cb(null, resData);
                                        } catch (e) {
                                            cb(null, null);
                                        }
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        },
                    ], function (err, results) {
                        if (err) {
                            errorHelper.error400(req, res);
                        }else {
                            console.log('单接口账户余额：', results[0]);
                            console.log('单接口价格返回:', results[1]);

                            if (results[0] != null && results[1] != null) {
                                // 作品相关信息数据
                                let price = results[1].Price;
                                viewModel.workInfo = {
                                    workId: workId,
                                    workTitle: workTitle,
                                    mediaType: mediaType,
                                    price: parseFloat(price).toFixed(2),
                                    coverPic: coverPic,
                                    orderType: orderType,
                                    period: period,
                                    year: year,
                                    dbType: dbType,
                                    author: author
                                };
                                // 异步查询返回数据
                                viewModel.data = {
                                    balance: results[0].rows,
                                };

                                // 判断余额是否充足
                                if (parseFloat(results[0].rows.UsableMoney) + parseFloat(results[0].rows.UsableTicket) >= parseFloat(price)) {
                                    viewModel.balance = {
                                        insufficient: 0
                                    }
                                } else {
                                    viewModel.balance = {
                                        insufficient: 1
                                    }
                                }
                                res.render('payment/checkoutOrderView', {title: '支付_知网文化', viewModel: viewModel});
                            }
                            else {
                                errorHelper.error500(req, res, '账户余额或价格错误，请重试或联系管理员');
                            }
                        }

                    });
                }
                // 微信二维码支付
                else if (payType == 1) {
                    console.log('payType的值：', payType);
                    console.log('参数：', {
                        "channel": '12',
                        "code": workId,
                        "ordertype": orderType,
                        "period": period,
                        "year": year,
                        "signature": signature,
                        "openid": req.session.openId,
                        "action": "pay",
                        "identifier": appId,
                        "secret": secret,
                        "callbackurl": callBackUrl,
                        "plateform": platForm,
                        "ip": userIp
                    })
                    request({
                            url: webConfig.paymentAddr + '/commit.do',
                            method: 'post',
                            headers: {
                                "content-type": "application/json",
                                "Cookies": "SID=110014"
                            },
                            json: true,
                            body: {
                                "channel": '12',
                                "code": workId,
                                "ordertype": orderType,
                                "period": period,
                                "year": year,
                                "signature": signature,
                                "openid": req.session.openId,
                                "action": "pay",
                                "identifier": appId,
                                "secret": secret,
                                "callbackurl": callBackUrl,
                                "plateform": platForm,
                                "ip": userIp
                            }
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                console.log('单接口微信二维码：', body);
                                // 微信二维码处理
                                qrcode.toDataURL(body.wechatQRCodeUrl, function (err, url) {
                                    viewModel.qrcode = url;
                                    // 异步查询返回数据
                                    viewModel.data = {
                                        wechat: body,
                                        wechatQrcode: url
                                    };
                                    // 会员没有余额支付，直接显示微信二维码
                                    if (orderType == 19 || orderType == 20) {
                                        let price = body.Price;
                                        viewModel.workInfo = {
                                            workId: workId,
                                            workTitle: workTitle,
                                            mediaType: mediaType,
                                            price: parseFloat(price).toFixed(2),
                                            coverPic: coverPic,
                                            orderType: orderType,
                                            period: period,
                                            year: year,
                                            dbType: dbType,
                                            author: author
                                        };
                                        res.render('payment/checkoutOrderView', {
                                            title: '支付_知网文化',
                                            viewModel: viewModel
                                        });
                                    }
                                    // 返回二维码
                                    else {
                                        res.json({
                                            url,
                                            TransactionCode: body.TransactionCode
                                        });
                                    }

                                });
                            }
                            else {
                                if (orderType == 19 || orderType == 20) {
                                    errorHelper.error500(req, res);
                                }
                                else {
                                    errorHelper.async.resFailed(res, '获取微信二维码失败');
                                }
                            }
                        });
                }
                // 支付宝web收银台，去支付链接
                else if (payType == 2) {
                    async.parallel([
                        // 支付宝web收银台，去支付链接
                        function (cb) {
                            request({
                                    url: webConfig.paymentAddr + '/commit.do',
                                    method: 'post',
                                    headers: {
                                        "content-type": "application/json"
                                    },
                                    json: true,
                                    body: {
                                        "signature": signature,
                                        "channel": '14',
                                        "code": workId,
                                        "ordertype": orderType,
                                        "period": period,
                                        "year": year,
                                        "openid": req.session.openId,
                                        "action": "pay",
                                        "identifier": appId,
                                        "secret": secret,
                                        "callbackurl": callBackUrl,
                                        "plateform": platForm,
                                        "ip": userIp
                                    }
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = body;
                                        cb(null, resData);
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        }
                    ], function (err, results) {
                        if (err) {
                            errorHelper.error400(req, res);
                        }else {
                            if (results[0] != null) {
                                console.log('支付宝去支付：', results[0]);
                                res.json({
                                    alipayCashierUrl: results[0].AlipayCashierUrl,
                                    goAlipayOrder: results[0].TransactionCode
                                })
                            }
                            else {
                                errorHelper.async.resFailed(res, '支付宝去支付链接获取错误');
                            }
                        }

                    });
                }
                // 银联支付
                else if (payType == 3) {
                    let unionCallBackUrl = webConfig.domainName + callBackUrl;
                    console.log('单接口银联参数：', {
                        "channel": '7',
                        "code": workId,
                        "ordertype": orderType,
                        "period": period,
                        "year": year,
                        "signature": signature,
                        "openid": req.session.openId,
                        "action": "pay",
                        "identifier": appId,
                        "secret": secret,
                        "callbackurl": unionCallBackUrl,
                        "plateform": platForm,
                        "ip": userIp
                    });
                    request({
                            url: webConfig.paymentAddr + '/commit.do',
                            method: 'post',
                            headers: {
                                "content-type": "application/json",
                                "Cookies": "SID=110014"
                            },
                            json: true,
                            body: {
                                "channel": '7',
                                "code": workId,
                                "ordertype": orderType,
                                "period": period,
                                "year": year,
                                "signature": signature,
                                "openid": req.session.openId,
                                "action": "pay",
                                "identifier": appId,
                                "secret": secret,
                                "callbackurl": unionCallBackUrl,
                                "plateform": platForm,
                                "ip": userIp
                            }
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                console.log('单接口银联：', body);
                                res.json({
                                    unionPay: body
                                })
                            }
                            else {
                                errorHelper.async.resFailed(res, '银联支付链接生成错误');
                            }
                        });
                }
                // 支付宝二维码
                else if (payType == 4) {
                    async.parallel([
                        function (cb) {
                            request({
                                    url: webConfig.paymentAddr + '/commit.do',
                                    method: 'post',
                                    headers: {
                                        "content-type": "application/json"
                                    },
                                    json: true,
                                    body: {
                                        "signature": signature,
                                        "channel": '13',
                                        "code": workId,
                                        "ordertype": orderType,
                                        "period": period,
                                        "year": year,
                                        "openid": req.session.openId,
                                        "action": "pay",
                                        "identifier": appId,
                                        "secret": secret,
                                        "callbackurl": callBackUrl,
                                        "plateform": platForm,
                                        "ip": userIp
                                    }
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = body;
                                        cb(null, resData);
                                    } else {
                                        // throw err;
                                        cb(null, null);
                                    }
                                });
                        }
                    ], function (err, results) {
                        if (err) {
                            errorHelper.error400(req, res);
                        }else {
                            if (results[0] != null) {
                                console.log('支付宝二维码：', results[0]);
                                res.json({
                                    alipayCashierUrl: results[0].alipayQRCodeHtml,
                                    goAlipayOrder: results[0].TransactionCode
                                })
                            }
                            else {
                                errorHelper.async.resFailed(res, '支付宝去支付链接获取错误');
                            }
                        }

                    });
                }
                else {
                    errorHelper.error400(req, res, '支付方式错误！');
                }


            });
        })
    },

    // 生成支付宝二维码页面
    generateAlipayEWM: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let workId = req.query.id || req.query.code;
                let workTitle = decodeURI(req.query.title);
                let mediaType = req.query.mediaType;
                // let price = req.query.price;
                let coverPic = req.query.coverPic;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                /* 0 文献 1期刊单期 2期刊年 3期刊全刊 4工具书 5词条 6 工具书包月、半年、年 7品得书院（图书） 8大成编客 9 活动 17 知网文化作品 18 知网文化微刊 19知网文化月会员 20知网文化年会员 */
                let callBackUrl = '';
                let orderType = req.query.ordertype || 17;
                // 文献不走此处
                if (orderType == 17) {
                    callBackUrl = '/payment/success?id=' + workId + '&orderType=' + orderType + '&mediatype=' + mediaType;
                } else if (orderType == 19 || orderType == 20) {
                    // 知网文化会员月和年
                    callBackUrl = '';
                    workId = 'KDVIP';
                } else {
                    callBackUrl = '/payment/success?id=' + workId + '&orderType=' + orderType;
                }
                let period = req.query.period || '';
                let year = req.query.year || '';
                let dbType = req.query.dbType || '';
                let author = req.query.author || '';
                let platForm = 3;
                let userIp = getClientIp(req);
                request({
                        url: webConfig.paymentAddr + '/commit.do',
                        method: 'post',
                        headers: {
                            "content-type": "application/json"
                        },
                        json: true,
                        body: {
                            "signature": signature,
                            "channel": '13',
                            "code": workId,
                            "ordertype": orderType,
                            "period": period,
                            "year": year,
                            "openid": req.session.openId,
                            "action": "pay",
                            "identifier": appId,
                            "secret": secret,
                            "callbackurl": callBackUrl,
                            "plateform": platForm,
                            "ip": userIp
                        }
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            res.render('payment/alipayEWM', {title: '', body});
                        } else {
                            errorHelper.error500(req, res, '二维码生成失败，请刷新页面重试活联系管理员');
                        }
                    });
            });
        })
    },
}