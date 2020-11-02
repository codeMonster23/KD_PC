let cookieFilter = require('../filters/cookieFilter');
let loginFilter = require('../filters/loginFilter');
let authorization = require('../config/authorization');
let appId = authorization.appId;
let secret = authorization.secret;
let jsEncryptHelper = require('../helpers/jsEncryptHelper');
let pagerHelper = require('../helpers/pagerHelper');
let worksCategory = require('../data/category');
let async = require('async');
let request = require('request');
let webConfig = require('../config/web.config');
let accountUrl = webConfig.accountAddr;
let url = webConfig.serverAddr;
let multiparty = require('multiparty');
let formData = require('form-data');
let fs = require('fs');
let path = require('path');
let http = require('http');
var errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');

module.exports = {
    //个人中心首页
    home: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let mediatype = req.body.mediatype || -1;
                async.parallel([
                    //可能感兴趣的
                    function (cb) {
                        let pageIndex = req.query.pageNum || 1;
                        let pageSize = req.query.pageSize || 10;
                        let isAsync = req.query.isAsync || 0;
                        let formData = {
                            pagesize: pageSize,
                            pageindex: pageIndex,
                            order: 'desc',
                            appid: 'web',
                            code: 'GetSysRecommendForPCPersonalCenter',
                            sort: 'updatetime'
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = JSON.parse(body)
                                    let recommendPersonalList = JSON.parse(body).data;
                                    if (resData.code == 0) {
                                        if (isAsync == 0) {
                                            cb(null, recommendPersonalList);
                                        } else {
                                            res.json(resData);
                                        }
                                    } else {
                                        console.log('请检查个人中心接口！')
                                    }

                                } else {
                                    throw err;
                                }
                            });
                    },
                    //我关注的看点号
                    function (cb) {
                        let formData = {
                            username: viewModel.user.name,
                            appid: 'web',
                            code: 'ConcernlistPC'
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    cb(null, body);
                                } else {
                                    throw err;
                                }
                            })
                    },
                    //我收藏的作品
                    function (cb) {
                        let formData = {
                            username: viewModel.user.name,
                            appid: 'web',
                            code: 'GetMyCollect',
                            type: 0,
                            mediatype: mediatype,
                            //groupid:groupid,
                            offset: 0,
                            limit: 3
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    cb(null, body);
                                } else {
                                    throw err;
                                }
                            })
                    },
                    //最近浏览
                    function (cb) {
                        let formData = {
                            username: viewModel.user.name,
                            appid: 'web',
                            code: 'UserLogList',
                            offset: 0,
                            limit: 3
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    cb(null, body);
                                } else {
                                    throw err;
                                }
                            })
                    },
                ], function (err, results) {
                    if (err) {
                        throw err;
                    }
                    viewModel.data = {
                        recommendPersonalList: results[0],
                        concernList: JSON.parse(results[1]).data.concernlist,
                        myCollectList: JSON.parse(results[2]).data.list
                    };
                    //console.log(viewModel.data.myCollectList)
                    //console.log(viewModel.data.concernList)
                    console.log(viewModel.data.myCollectList)
                    res.render('personalCenter/homeView', {
                        title: '个人中心_知网文化',
                        viewModel: viewModel
                    });
                })

            })
        })
    },
    //我的已购
    purchased: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let pageNum = req.query.pageNum || 1;
            let formData = {
                username: viewModel.user.name,
                type: '',
                platform: 'KDPC',
                rows: 10,
                colmunname: '',
                order: '',
                appid: 'web',
                code: 'GetPurchasedProducts'
            };
            res.render('personalCenter/purchasedView', {
                title: '我的已购_知网文化',
                viewModel: viewModel
            });
        })
    },
    //查看全年期刊
    allyearPeriod: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/allyearPeriodView', {
                title: '查看全年',
                viewModel: viewModel
            });
        })
    },
    //我的收藏
    collected: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/collectedView', {
                title: '我的收藏_知网文化',
                viewModel: viewModel
            });
        })
    },
    //收藏夹详情
    collectedDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/collectedDetailView', {
                title: '我的收藏_知网文化',
                viewModel: viewModel
            });
        })
    },
    //我的关注
    follow: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/followView', {
                title: '我关注的看点号',
                viewModel: viewModel
            });
        })
    },
    //历史记录
    history: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/historyView', {
                title: '浏览历史',
                viewModel: viewModel
            });
        })
    },
    //账号关联
    connect: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/connectView', {
                title: '机构关联',
                viewModel: viewModel
            });
        })
    },
    //消息中心
    message: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/messageView', {
                title: '消息中心_知网文化',
                viewModel: viewModel
            });
        })
    },
    //删除信息模态框
    delWarn: function (req, res, next) {
        res.render('personalCenter/delWarnView', {
            title: '删除提示'
        });

    },
    //移至收藏夹
    transfer: function (req, res, next) {
        res.render('personalCenter/transferView', {
            title: '转移至收藏夹'
        });
    },
    //取消关注
    cancelFollow: function (req, res, next) {
        res.render('personalCenter/cancelFollowView', {
            title: '取消关注'
        });
    },
    //我的账户
    myAccount: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                // 用户账户余额
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
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        let resData = body;
                        viewModel.data = resData.rows;
                        res.render('personalCenter/myAccountView', {
                            title: '我的账户_知网文化',
                            viewModel: viewModel
                        });
                    } else {
                        throw err;
                    }
                });
            })
        })
    },
    //我的账单
    myBills: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                //let spIds = req.query.spIds || '';
                //let userName = viewModel.user.name;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let url = 'https://kdjk.cnki.net/recharge/online/recharge/dbhistory.action';
                //let formData = {
                //username: viewModel.user.name,
                //spIds: '',
                //paySources:'19,20,21,22,23',
                //status:'1'
                //};
                request({
                        url: url,
                        method: 'post',
                        headers: {
                            "content-type": "application/json"
                        },
                        json: true,
                        body: {
                            "username": viewModel.user.name,
                            "signature": signature,
                            "pageindex": 1,
                            "pagesize": 100000
                        }
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            let resData = body;
                            console.log(body)
                            viewModel.data = {
                                rechargeRecordList: resData.rows
                            }
                            res.render('personalCenter/myBillsView', {
                                title: '我的账单_知网文化',
                                viewModel: viewModel
                            });
                        } else {
                            throw err;
                        }
                    })
            })
        })
    },
    //我的账单消费记录
    myBillsConsumeRecord: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let pageIndex = req.query.pageNum || 1;
                let pageSize = req.query.pageSize || 15;
                let username = viewModel.user.name;
                let titKeyword = req.query.titKeyword || ''
                request({
                    url: 'https://kdjk.cnki.net/pay/cnki/order/record.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "username": username,
                        "signature": signature,
                        "type": "KD_CONSUME",
                        "pageindex": pageIndex,
                        "pagesize": pageSize
                    }
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        res.json({
                            reslist: body
                        });
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    //发票索取
    invoice: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let url = 'https://kdjk.cnki.net/recharge/online/recharge/dbhistory.action';
                request({
                        url: url,
                        method: 'post',
                        headers: {
                            "content-type": "application/json"
                        },
                        json: true,
                        body: {
                            "username": viewModel.user.name,
                            "signature": signature,
                            "pageindex": 1,
                            "pagesize": 100000
                        }
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            let resData = body;
                            console.log(body)
                            viewModel.data = {
                                rechargeRecordList: resData.rows
                            }
                            res.render('personalCenter/invoiceView', {
                                title: '发票索取_知网文化',
                                viewModel: viewModel
                            });
                        } else {
                            throw err;
                        }
                    })
            })
        })
    },
    //填写发票信息
    invoiceInfo: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                res.render('personalCenter/invoiceInfoView', {
                    title: '发票信息',
                    viewModel: viewModel
                });
            })
        })
    },
    //提交发票信息
    submitInfo: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let userName = viewModel.user.name;
                let invoiceType = req.body.invoiceType;
                let invoiceTitle = req.body.invoiceTitle;
                let txtInvoiceNsrsbh = req.body.txtInvoiceNsrsbh;
                let txtInvoiceKhyh = req.body.txtInvoiceKhyh;
                let txtInvoiceYhzh = req.body.txtInvoiceYhzh;
                let txtInvoiceZcdz = req.body.txtInvoiceZcdz;
                let txtInvoiceZcdh = req.body.txtInvoiceZcdh;
                let invoiceContent = req.body.invoiceContent;
                let invoicePrice = req.body.invoicePrice;
                let realName = req.body.realName;
                let mobile = req.body.mobile;
                let phone = req.body.phone;
                let remark = req.body.remark;
                let formData = {
                    json: JSON.stringify({
                        "address": "",
                        "invoiceContent": invoiceContent,
                        "invoicePrice": invoicePrice,
                        "invoiceTitle": invoiceTitle,
                        "invoiceType": "1",
                        "mobile": mobile,
                        "phone": phone,
                        "postCode": "",
                        "realName": realName,
                        "rechargeArr": [],
                        "remark": remark,
                        "source": "1",
                        "txtInvoiceKhyh": txtInvoiceKhyh,
                        "txtInvoiceNsrsbh": txtInvoiceNsrsbh,
                        "txtInvoiceYhzh": txtInvoiceYhzh,
                        "txtInvoiceZcdh": txtInvoiceZcdh,
                        "txtInvoiceZcdz": txtInvoiceZcdz,
                        "userName": userName
                    })
                };
                console.log(formData)
                request.post({
                    url: "https://card.cnki.net/invoiceApplyClient.action",
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        res.send(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    //发票详情
    invoiceDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                res.render('personalCenter/invoiceDetailView', {
                    title: '发票详情_知网文化',
                    viewModel: viewModel
                });
            });
        })
    },
    //个人资料
    personalInfo: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                viewModel.category = worksCategory;
                async.parallel([
                    // 获取用户信息
                    function (cb) {
                        let formData = {
                            appid: 'web',
                            code: 'GetPCUserInfo',
                            username: viewModel.user.name
                        };
                        request.post({
                            url: url,
                            form: formData
                        }, function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }
                        })
                    },
                    //获取系统头像
                    function (cb) {
                        let formData = {
                            appid: 'web',
                            code: 'getSystemAvatar'
                        };
                        request.post({
                            url: url,
                            //url:'http://192.168.107.112:8098/resource/api/command',
                            form: formData
                        }, function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }
                        })
                    }

                ], function (err, results) {
                    if (err) {
                        throw err;
                    }
                    viewModel.data = {
                        userInfoList: JSON.parse(results[0]).data,
                        avatarList: JSON.parse(results[1]).list
                    };
                    res.render('personalCenter/personalInfoView', {
                        title: '账号设置_知网文化',
                        viewModel: viewModel
                    });
                })

            })
        })
    },
    //左侧菜单获取用户名和头像
    menuInfo: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let formData = {
                    appid: 'web',
                    code: 'GetPCUserInfo',
                    username: viewModel.user.name
                };
                request.post({
                    url: url,
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log('获取用户信息：', JSON.parse(body));
                        res.json(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    //修改个人信息
    updatePersonalInfoA: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let username = req.body.username;
                let nickname = req.body.nickname;
                let gender = req.body.gender;
                let age = req.body.age;
                let mylocation = req.body.mylocation;
                let formData = {
                    appid: 'web',
                    code: 'UpdatePCUserInfo',
                    username: username,
                    nickname: nickname,
                    gender: gender,
                    age: age,
                    location: mylocation
                };
                request.post({
                    url: url,
                    //url:'http://192.168.107.112:8098/resource/api/command',
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        res.send(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    //修改兴趣分类
    updatePersonalInfoB: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let username = req.body.username;
                let cateids = req.body.cateids;
                let formData = {
                    appid: 'web',
                    code: 'AddUserCategory',
                    username: username,
                    cateids: cateids
                };
                request.post({
                    url: url,
                    //url:'http://192.168.107.112:8098/resource/api/command',
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        res.send(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    //修改个人头像
    updatePersonalInfoC: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let username = viewModel.user.name;
                //let username='wsk10073'
                let avatar = req.body.avatar || '';
                let formData = {
                    appid: 'web',
                    code: 'UpdatePCUserInfo',
                    username: username,
                    avatar: avatar
                };
                request.post({
                    url: url,
                    //url:'http://192.168.107.112:8098/resource/api/command',
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        res.send(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    //上传头像图片
    uploadImg: function (req, res, next) {
        let Response = res;
        let queryParam = new formData();
        let headers = queryParam.getHeaders();
        let filePath = null;
        let form = new multiparty.Form();
        form.parse(req, function (err, fields, file) {
            filePath = file.img[0].path;
            console.log(filePath);
            cookieFilter(req, res, function (viewModel) {
                loginFilter(req, res, viewModel, function () {
                    let username = viewModel.user.name;
                    //let username='wsk10073'
                    queryParam.append('username', username);
                    queryParam.append('file', fs.createReadStream(filePath));
                    let options = {
                        method: 'post',
                        // host: 'kandian.cnki.net',
                        host: 'wanxuan.cnki.net',
                        //host:'192.168.107.112',
                        //port:'80',
                        //port:'8089',
                        path: '/resource/file/uploadPic',
                        headers: headers
                    };

                    let request = http.request(options, function (res) {

                        let resStr = '';
                        res.on('data', function (res) {
                            resStr += res;
                        });

                        res.on('end', () => {
                            Response.send(JSON.parse(resStr));
                            return;
                            console.log(resStr);
                        })

                    })
                    queryParam.pipe(request);
                })
            })
        })
    },
    //剪裁图片上传
    clipImg: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let fileName = req.body.fileName;
                let imgWidth = req.body.imgWidth;
                let imgHeight = req.body.imgHeight;
                let imageX1 = req.body.imageX1;
                let imageX2 = req.body.imageX2;
                let imageY1 = req.body.imageY1;
                let imageY2 = req.body.imageY2;
                let formData = {
                    fileName: fileName,
                    imgWidth: imgWidth,
                    imgHeight: imgHeight,
                    imageX1: imageX1,
                    imageX2: imageX2,
                    imageY1: imageY1,
                    imageY2: imageY2
                }
                request.post({
                    url: 'https://wanxuan.cnki.net/resource/file/clipImage',
                    //url:'http://192.168.107.112:8089/resource/file/clipImage',
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        res.send(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })

            })
        })
    },

    //更新密码
    updatePassword: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let password = req.query.password;
                let newPassword = req.query.newPassword;
                request({
                    url: accountUrl + '/resetpwd',
                    headers: {
                        'Cookies': 'SID=110014',
                        'Content-Type': 'application/json',
                    },
                    json: true,
                    method: 'post',
                    body: {
                        "username": viewModel.user.name,
                        "password": password,
                        "newPassword": newPassword
                    }
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body);
                        res.json(body);
                    } else {
                        throw err;
                    }
                })
            })
        })
    },
    // 验证手机号码是否可以注册
    verifyPhoneNum: function (req, res, next) {
        let phoneNum = req.query.phoneNum;
        request({
                url: accountUrl + '/checkeom',
                headers: {
                    'Cookies': 'SID=110014',
                    'Content-Type': 'application/json'
                },
                json: true,
                method: 'post',
                body: {
                    type: 'mobile',
                    key: phoneNum
                }
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    if (body.Code == 1) {
                        res.json(body);
                    }
                } else {
                    console.log('验证手机号码失败！')
                }
            });
    },

    // 验证手机号码是否可以注册
    sendCaptcha: function (req, res, next) {
        let phoneNum = req.query.phoneNum;
        request({
                url: accountUrl + '/send_verify_code',
                headers: {
                    'Cookies': 'SID=110014',
                    'Content-Type': 'application/json'
                },
                json: true,
                method: 'post',
                body: {
                    to: phoneNum,
                    app: 'bear'
                }
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    if (body.Success == true) {
                        console.log(body)
                        res.json({
                            errorCode: 1,
                            errorMessage: '发送成功',
                            body: body
                        });
                    } else {
                        res.json({
                            errorCode: 0,
                            errorMessage: '该手机号获取验证码已达上限，请明天再试。'
                        })
                    }
                } else {
                    console.log('验证码发送失败！')
                }
            });
    },
    //提交修改绑定手机号
    updatePhone: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let phonenumber = req.query.phonenumber;
                let captcha = req.query.captcha;
                if (captcha == req.session.captcha) {
                    req.session.captcha = null;
                    let formData = {
                        appid: 'web',
                        code: 'UpdatePCUserInfo',
                        username: viewModel.user.name,
                        phonenumber
                    }
                    request.post({
                        url: url,
                        form: formData
                    }, function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            let resData = JSON.parse(body);
                            console.log('绑定手机号码返回数据：', resData);
                            if (resData.code == 0) {
                                res.json({
                                    errorCode: 0,
                                    errorMessage: '绑定手机号码成功'
                                });
                            } else {
                                res.json({
                                    errorCode: 1,
                                    errorMessage: '绑定失败'
                                })
                            }
                        } else {
                            throw err;
                        }
                    })
                } else {
                    res.json({
                        errorCode: -1,
                        errorMessage: '验证码错误！'
                    })
                }

            })
        })
    },
    //判断是否是会员
    isVip: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let username = viewModel.user.name;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                request({
                    url: 'https://kdjk.cnki.net/pay/cnki/vip/is.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "username": username,
                        "signature": signature
                    }
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        let resData = body;
                        res.send(resData);
                    } else {
                        throw err;
                    }
                });
            });
        })
    },

    //会员首页
    vip: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let formData = {
                names: 'tipVIP特权Web,tip文献Web,tip期刊Web,tip图书Web,tip微刊Web,tip图文Web,tip音频Web,tip视频Web,tip图集Web,月会员Web,年会员Web,月优惠描述Web,年优惠描述Web,月特惠Web,年特惠Web,会员服务说明Web',
                appid: 'web',
                code: 'GetSysDictList'
            };

            console.log('vip参数', formData)
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            let resData = JSON.parse(body);
                            if (resData.code == 0) {
                                // let isVip = 0;
                                // if (req.session.isVip == true) {
                                //     isVip = 1;
                                // }
                                // viewModel.isVip = isVip;
                                viewModel.isVip = req.session.isVip ? 1 : 0;
                                viewModel.data = resData;
                                console.log('vip数据：', resData);
                                res.render('personalCenter/vipView', {
                                    title: '会员首页',
                                    viewModel: viewModel
                                });
                            }
                            else {
                                res.json(resData.msg);
                            }
                        } catch (e) {
                            errorHelper.error500(req, res, '数据转换错误');
                        }
                    }
                    else {
                        errorHelper.error400(req, res, '无法获取vip数据');
                    }
                });
        })
    },
    //会员个人中心
    vipRecord: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let pageIndex = req.query.pageIndex || 1;
                let pageSize = req.query.pageSize || 20;
                let username = viewModel.user.name;
                request({
                    url: webConfig.paymentAddr1 + '/order/record.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "username": username,
                        "signature": signature,
                        "type": "KD_VIP",
                        "pageindex": pageIndex,
                        "pagesize": pageSize
                    }
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log('会员记录：', body);
                        viewModel.data = {
                            vipList: body
                        };
                        viewModel.pageStr = pagerHelper(viewModel.data.vipList.total, 20, 5, pageIndex);
                        res.render('personalCenter/vipRecordView', {
                            title: '会员中心',
                            viewModel: viewModel
                        });

                    } else {
                        throw err;
                    }
                })

            })
        })
    },
    //会员详情
    vipDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let username = viewModel.user.name;
                request({
                    url: webConfig.paymentAddr1 + '/vip/detail.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "username": username,
                        "signature": signature,
                    }
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        req.session.isVip = true; // 购买会员成功后，查询此接口时候设置
                        console.log('查询过期时间', body);
                        res.json(body);
                    } else {
                        throw err;
                    }
                })

            })
        })
    },
    //  我的卡券
    myCoupon: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                res.render('personalCenter/myCouponView', {
                    title: '我的卡券_知网文化',
                    viewModel: viewModel
                });
            })
        })
    },
    //左侧菜单会员导语
    getVipGuideWord: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let formData = {
                    appid: 'web',
                    code: 'GetSysDictList',
                    names: '会员导语IOS,会员导语Web,会员导语Android'
                };
                request.post({
                    url: url,
                    form: formData
                }, function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        console.log(body)
                        res.send(JSON.parse(body))
                    } else {
                        throw err;
                    }
                })
            })
        })
    },

    // 同步 异步 浏览记录
    browseRecord: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let offset = typeof req.query.o == 'Number' && req.query.o >= 0 ? req.query.o : 0;
                let limit = typeof req.query.l == 'Number' && req.query.l >= 0 ? req.query.o : 3;
                let isAsync = parseInt(req.query.isAsync) == 1 ? 1 : 0;
                let formData = {
                    code: 'UserLogList',
                    appid: 'web',
                    offset,
                    limit,
                    username: viewModel.user.name
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            let data = {}
                            try {
                                data = JSON.parse(body);
                            } catch (e) {
                                data = body;
                            }
                            console.log('最近浏览：', data.data);
                            if (isAsync == 0) {

                            }
                            else {
                                res.json(data);
                            }
                        }
                        else {
                            // redirectHelper(res, '/literature' + req.url);
                        }
                    });
            })
        })
    },
}