const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const authorization = require('../config/authorization');
const pagerHelper = require('../helpers/pagerHelper');
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const uuid = require('node-uuid');
const url = webConfig.serverAddr;
const appId = authorization.appId;
const secret = authorization.secret;
const errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');

module.exports = {
    // 包括图文、音视频、图集
    workDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let workId = '';
            let mediatype = '';
            // 参数idType最后一位为mediatype值
            if (Object.keys(req.params).length > 0 && req.params.idType) {
                let idType = req.params.idType;
                workId = idType.substring(0, idType.length - 1);
                mediatype = idType.substring(idType.length - 1);
            }
            else {
                workId = req.query.id;
                mediatype = req.query.mediatype;
            }
            let hasViewRight = 0; // 0：无权限阅读，1：有权限阅读

            // 手机端访问
            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/detail/" + workId : "";
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            }
            // pc端访问
            else {
                // if (viewModel.user.name == null) {
                let formData = {
                    appid: 'web',
                    // code: 'GetOrgCollectionByIdFromPC',
                    code: 'GetCollectionById',
                    id: workId,
                    mediatype: mediatype,
                    username: viewModel.user.name
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            let data = {};
                            try {
                                data = JSON.parse(body);
                                console.log('作品接口数据：', data.data)
                                if (data.code == 0) {
                                    //获取作品是否在包含的微刊中被设置为试听、试看、试读
                                    if (data.data.mircbookList && data.data.mircbookList.length > 0) {
                                        for (let i = 0; i < data.data.mircbookList.length; i++) {
                                            if (data.data.mircbookList[i].collectionfree == 1) {
                                                hasViewRight = 1;
                                                // 结束for循环
                                                i = data.data.mircbookList.length
                                            }
                                        }
                                    }
                                    console.log('是否有权限', hasViewRight)

                                    viewModel.data = data.data;
                                    viewModel.workId = workId;
                                    viewModel.platformcatename = JSON.parse(data.data.collection.platformcatename);
                                    viewModel.mediatype = mediatype;
                                    viewModel.hasViewRight = hasViewRight;
                                    viewModel.uid = req.session.uid || 0;
                                    viewModel.openId = req.session.openId || 0;
                                    viewModel.isVip = req.session.isVip || 0;
                                    // viewModel.isPurchased = isPurchased;


                                    // 可单独售卖
                                    if (viewModel.data.collection.isselfsell == 0) {
                                        // 图文
                                        if (mediatype == 1) {
                                            res.render('detail/graphicDetailView', {
                                                title: '[图文]' + data.data.collection.title + '_知网文化',
                                                viewModel: viewModel,
                                                addr: webConfig
                                            });
                                        }
                                        // 音视频
                                        else if (mediatype == 2 || mediatype == 3) {
                                            var title = '';
                                            if (mediatype == 2) {
                                                title = '[音频]' + data.data.collection.title + '_知网文化';
                                            } else {
                                                title = '[视频]' + data.data.collection.title + '_知网文化';
                                            }
                                            res.render('detail/multimediaDetailView', {
                                                title,
                                                viewModel: viewModel,
                                                addr: webConfig
                                            });
                                        }
                                        // 图集
                                        else if (mediatype == 4) {
                                            res.render('detail/imgCollectionDetailView', {
                                                title: '[图集]' + data.data.collection.title + '_知网文化',
                                                viewModel: viewModel,
                                                addr: webConfig
                                            });
                                        } else {
                                            // res.json('作品类型错误!');
                                            errorHelper.error500(req, res, '作品类型错误');
                                        }
                                    }
                                    // 不可单独售卖
                                    else if (viewModel.data.collection.isselfsell == 1) {
                                        // 是否设置为试读、试看、试听，或者已购相应微刊、会员免费等
                                        // isbuy: 0 无权限 1已购权限 2会员免费权限 3 活动免费权限
                                        if (hasViewRight == 1 || viewModel.data.collection.isbuy != 0) {
                                            // 图文
                                            if (mediatype == 1) {
                                                res.render('detail/graphicDetailView', {
                                                    title: '[图文]' + data.data.collection.title + '_知网文化',
                                                    viewModel: viewModel,
                                                    addr: webConfig
                                                });
                                            }
                                            // 音视频
                                            else if (mediatype == 2 || mediatype == 3) {
                                                var title = '';
                                                if (mediatype == 2) {
                                                    title = '[音频]' + data.data.collection.title + '_知网文化';
                                                } else {
                                                    title = '[视频]' + data.data.collection.title + '_知网文化';
                                                }
                                                res.render('detail/multimediaDetailView', {
                                                    title,
                                                    viewModel: viewModel,
                                                    addr: webConfig
                                                });
                                            }
                                            // 图集
                                            else if (mediatype == 4) {
                                                res.render('detail/imgCollectionDetailView', {
                                                    title: '[图集]' + data.data.collection.title + '_知网文化',
                                                    viewModel: viewModel,
                                                    addr: webConfig
                                                });
                                            } else {
                                                // res.json('作品类型错误!');
                                                errorHelper.error500(req, res, '作品类型错误!');
                                            }
                                        } else {
                                            res.render('detail/notSingleSellWorksView', {
                                                title: '不可单独售卖作品_知网文化',
                                                viewModel: viewModel
                                            });
                                        }
                                    }
                                } else {
                                    errorHelper.error400(req, res);
                                }
                            }
                            catch (e) {
                                errorHelper.error500(req, res, '作品详情内部错误');
                            }
                        }
                        else {
                            // errorHelper.error400(req, res, '作品详情请求无响应');
                            redirectHelper(res, '/detail' + req.url);
                        }
                    });
            }
        })
    },

    // 微刊
    microBookDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let signature = jsEncryptHelper.encrypt(req.session.uid);
            let microBookId = req.query.id;
            let pageNum = req.query.pageNum || 1;
            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/tinyjournal/detail/" + microBookId : "";
            // mobile
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            }
            // pc
            else {
                // 用户未登录
                if (viewModel.user.name == null) {
                    async.parallel([
                        // 微刊详情
                        function (cb) {
                            var formData = {
                                code: 'GetMircBookDetailByMicBookId',
                                appid: 'web',
                                username: viewModel.user.name,
                                id: microBookId
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        cb(null, body);
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 微刊目录
                        function (cb) {
                            var formData = {
                                appid: 'web',
                                code: 'GetMircBookCollectionListByMicBookId',
                                id: microBookId,
                                offset: (pageNum - 1) * 8,
                                limit: 8
                                // sort: 'SubmitTime' // 默认排序 SortNum ，最新排序SubmitTime
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        cb(null, body);
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        }
                    ], function (err, results) {
                        if (err) {
                            throw err;
                        }
                        try {
                            // console.log('未登录微刊数据1：',JSON.parse(results[0]));
                            // console.log('未登录微刊目录1：',JSON.parse(results[1]).data.rows);
                            let result0 = JSON.parse(results[0]);
                            let result1 = JSON.parse(results[1]);
                            if (result0 && result0.code == 0) {
                                let rows = [];
                                let microBookCatalogPageStr = '';
                                if (result1.code == 0) {
                                    rows = result1.data.rows;
                                    let microBookCatalogData = result1.data;
                                    if (typeof microBookCatalogData.total != "undefined" && microBookCatalogData.total > 0) {
                                        microBookCatalogPageStr = pagerHelper(microBookCatalogData.total, 8, 5, pageNum, '/detail/microBookDetail', {id: microBookId});
                                    }
                                }

                                viewModel.data = {
                                    microBookDetail: result0.data.mircbook,
                                    microBookCatalog: rows,
                                    microBookCatalogPageStr: microBookCatalogPageStr,
                                    microBookId: microBookId
                                };
                                if (result0.data.shopprice) {
                                    viewModel.data.shopprice = result0.data.shopprice;
                                }
                                console.log('未登录微刊详情数据:', viewModel.data);
                                res.render('detail/microBookDetailView', {
                                    title: '微刊详情',
                                    viewModel: viewModel,
                                    addr: webConfig
                                });
                            } else {
                                res.send('微刊id错误！');
                            }
                        } catch (e) {
                            errorHelper.error400(req, res, '检查微刊详情或者目录数据');
                        }


                    });
                }
                // 用户已登录
                else {
                    async.parallel([
                        // 微刊详情
                        function (cb) {
                            var formData = {
                                code: 'GetMircBookDetailByMicBookId',
                                appid: 'web',
                                username: viewModel.user.name,
                                id: microBookId
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
                                });
                        },
                        // 微刊目录
                        function (cb) {
                            var formData = {
                                appid: 'web',
                                code: 'GetMircBookCollectionListByMicBookId',
                                id: microBookId,
                                offset: (pageNum - 1) * 8,
                                limit: 8
                                // sort: 'SubmitTime' // 默认排序 SortNum ，最新排序SubmitTime
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
                                });
                        },
                        // 获取微刊价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '1',
                                "code": microBookId,
                                "ordertype": 18,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                            };
                            console.log('获取微刊价格参数:', formData);
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
                                    console.log('获取微刊价格返回:', body)
                                    if (!err && response.statusCode == 200) {
                                        let resData = body;
                                        cb(null, resData);
                                    } else {
                                        throw err;
                                    }
                                });
                        },
                    ], function (err, results) {
                        if (err) {
                            // throw err;
                            errorHelper.error500(req, res, '检查微刊详情或微刊目录或者微刊价格数据！');
                        }
                        else {
                            try {
                                // console.log('已登录微刊详情数据2：',JSON.parse(results[0]));
                                // console.log('已登录微刊目录数据2：',JSON.parse(results[1].data));
                                let result0 = JSON.parse(results[0]);
                                let result1 = JSON.parse(results[1]);
                                if (result0 != null) {
                                    let microBookCatalogData = result1.data;
                                    let microBookCatalogPageStr = pagerHelper(microBookCatalogData.total, 8, 5, pageNum, '/detail/microBookDetail', {id: microBookId});
                                    // 判断是否已购买
                                    let hasRight = 0;
                                    if (results[2].ErrorCode == 102) {
                                        hasRight = 1;
                                    }
                                    viewModel.data = {
                                        microBookDetail: result0.data.mircbook,
                                        microBookCatalog: result1.data.rows,
                                        microBookCatalogPageStr: microBookCatalogPageStr,
                                        microBookId: microBookId,
                                        hasRight
                                    };
                                    viewModel.isVip = req.session.isVip;
                                    if (result0.data.shopprice) {
                                        viewModel.data.shopprice = result0.data.shopprice;
                                    }


                                    console.log('已登录微刊详情数据:', viewModel.data)
                                    res.render('detail/microBookDetailView', {
                                        title: '微刊详情',
                                        viewModel: viewModel,
                                        addr: webConfig
                                    });
                                } else {
                                    errorHelper.error500(req, res, '微刊详情接口返回数据为空！');
                                }
                            } catch (e) {
                                errorHelper.error500(req, res, '已登录微刊详情数据错误！');
                            }
                        }

                    });
                }

            }
        })
    },

    //异步 根据机构id获取万选号信息
    getOrgIdById: function (req, res, next) {
        var orgId = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetOrgBaseInfo',
            orgid: orgId
        };
        console.log('根据机构id获取万选号信息参数', formData);
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        let resData = JSON.parse(body);
                        console.log('根据机构id获取万选号信息', resData);
                        if (resData.code == 0) {
                            errorHelper.async.success(res, resData.data.org);
                        } else {
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                } else {
                    errorHelper.async.reqFailed(res);
                }
            });
    },

    //异步 获取微刊详情页推荐作品
    getMicroBookRecommendWorks: function (req, res, next) {
        var microBookId = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetRecommendCollectionForDetailTinyJournal',
            id: microBookId,
            limit: 5,
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        let resData = JSON.parse(body);
                        if (resData.code == 0) {
                            // res.json(resData.data);
                            errorHelper.async.success(res, resData.data);
                        } else {
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    errorHelper.async.reqFailed(res);
                }
            });
    },

    //异步 获取微刊详情页推荐微刊
    getMicroBookRecommendMicroBooks: function (req, res, next) {
        var microBookId = req.params.id;
        if (typeof microBookId != 'undefined' && microBookId != null && microBookId != '' && microBookId.length > 0) {
            var formData = {
                appid: 'web',
                code: 'GetRecommendMircBookByMicBookId',
                id: microBookId
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            if (resData.code == 0) {
                                // res.json(resData.data);
                                errorHelper.async.success(res, resData.data);
                            } else {
                                errorHelper.async.resFailed(res);
                            }
                        } catch (e) {
                            errorHelper.async.resFailed(res);
                        }
                    } else {
                        errorHelper.async.reqFailed(res);
                    }
                });
        }
        else {
            errorHelper.async.resFailed(res, '获取微刊详情页推荐微刊id不正确');
        }
    },

    //异步 获取音视频推荐列表
    getMultimediaRecommendList: function (req, res, next) {
        var workId = req.body.id;
        var formData = {
            appid: 'web',
            code: 'GetRecommendCollectionForDetailCollection',
            id: workId,
            limit: 10
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        console.log('音视频推荐数据：', data)
                        if (data.code == 0) {
                            // res.json(data);
                            errorHelper.async.success(res, data.data);
                        } else {
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                } else {
                    errorHelper.async.reqFailed(res);
                }
            });
    },

    //同步 异步 图集预览
    imgPreview: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let imgId = req.query.id;
            let isAsync = req.query.isAsync || 0;

            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/detail/" + imgId : "";
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            } else {
                async.parallel([
                    // 获取最后一张广告图
                    function (cb) {
                        let formData = {
                            // appid: 'web',
                            // code: 'getSysIndexSelectedTableList',
                            // pageindex: 1,
                            // pagesize: 1,
                            // typeid: 241,
                            // sort: 'rand()',
                            // order: ''
                            appid: 'web',
                            code: 'getAdPicList',
                            collectionid: imgId
                        };
                        // console.log('获取最后一张广告图',formData)
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    try {
                                        let resData = JSON.parse(body);
                                        // console.log(resData);
                                        if (resData.code == 0) {
                                            cb(null, resData);
                                        } else {
                                            // throw new Error('获取最后一张图片接口错误');
                                            cb(null, null);
                                        }
                                    } catch (e) {
                                        cb(null, null);
                                    }
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 图集数据
                    function (cb) {
                        let formData = {
                            appid: 'web',
                            code: 'GetOrgCollectionPicList',
                            collectionid: imgId,
                            order: 0 // 0升序；1降序
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    try {
                                        let resData = JSON.parse(body);
                                        console.log('图集预览：', resData.data);
                                        if (resData.code == 0) {
                                            cb(null, resData);
                                        } else {
                                            // res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                                            cb(null, null);
                                        }
                                    } catch (e) {
                                        cb(null, null);
                                    }
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    }
                ], function (err, results) {
                    if (err) {
                        // throw err;
                        errorHelper.error500(req, res);
                    }
                    else {
                        if (results[0] && results[1]) {
                            // 最后一张图片
                            viewModel.lastPic = results[0].data.list[0];
                            let lastPicLink = '';
                            let mediaType = -1;
                            switch (viewModel.lastPic.collectiontype) {
                                case 'collection':
                                    if (viewModel.lastPic.link == 'PTV0100') {
                                        mediaType = 1;
                                    } else if (viewModel.lastPic.link == 'ADH0100') {
                                        mediaType = 2;
                                    } else if (viewModel.lastPic.link == 'VDH0100') {
                                        mediaType = 3;
                                    } else if (viewModel.lastPic.link == 'ATH0100') {
                                        mediaType = 4;
                                    }
                                    lastPicLink = '/detail/workDetail?id=' + viewModel.lastPic.foreignkeyid + '&mediatype=' + mediaType;
                                    break;
                                case 'mircbook':
                                    lastPicLink = '/detail/microBookDetail?id=' + viewModel.lastPic.foreignkeyid;
                                    break;
                                case 'magazine':
                                    lastPicLink = '/detail/singlePeriodDetail/' + viewModel.lastPic.foreignkeyid;
                                    break;
                                case 'book':
                                    lastPicLink = '/detail/bookDetail/' + viewModel.lastPic.foreignkeyid;
                                    break;
                                case 'article':
                                    lastPicLink = '';
                                    break;
                                case 'articlecate':
                                    lastPicLink = '';
                                    break;
                                case 'channel':
                                    lastPicLink = '';
                                    break;
                                case 'org':
                                    lastPicLink = '/kdh/home/' + viewModel.lastPic.foreignkeyid;
                                    break;
                            }
                            viewModel.lastPic.lastPicLink = lastPicLink;

                            // 计算图片总数
                            let picList = results[1].data.piclist;
                            let picTotalCount = 0;
                            for (let i = 0; i < picList.length; i++) {
                                picTotalCount += picList[i].CollectionPicList.length;
                            }
                            viewModel.data = results[1].data;
                            viewModel.data.picTotalCount = picTotalCount;

                            if (isAsync == 0) {
                                res.render('detail/imgPreviewView', {
                                    title: '图集预览',
                                    viewModel: viewModel,
                                    addr: webConfig
                                });
                            } else {
                                res.json(results[1]);
                            }
                        } else {
                            errorHelper.error500(req, res);
                        }
                    }


                });


            }
        })
    },

    // 后台 图集预览 无分享 点赞 评论 收藏功能
    // preview: function (req, res, next) {
    //     cookieFilter(req, res, function (viewModel) {
    //         var imgId = req.query.id;
    //         var isAsync = req.query.isAsync || 0;
    //         var formData = {
    //             appid: 'web',
    //             code: 'GetOrgCollectionPicList',
    //             collectionid: imgId,
    //             order: 0 // 0升序；1降序
    //         };
    //         request.post({
    //                 url: url,
    //                 form: formData
    //             },
    //             function (err, response, body) {
    //                 if (!err && response.statusCode == 200) {
    //                     var data = JSON.parse(body);
    //                     // console.log(data.data)
    //                     if (data.code == 0) {
    //                         viewModel.data = data.data;
    //                         if (isAsync == 0) {
    //                             res.render('detail/previewView', {
    //                                 title: '图集预览',
    //                                 viewModel: viewModel,
    //                                 addr: webConfig
    //                             });
    //                         } else {
    //                             res.json(data);
    //                         }
    //                     } else {
    //                         res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
    //                     }
    //                 } else {
    //                     throw err;
    //                 }
    //             });
    //     })
    // },

    // 图书详情
    showBookDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            // 手机端访问
            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/book/detail/" + id : "";
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            }
            // pc端访问
            else {
                if (viewModel.user.name != null) {
                    var signature = jsEncryptHelper.encrypt(req.session.uid);
                    request({
                            url: webConfig.vipAddr + '/is.do',
                            method: 'post',
                            headers: {
                                "content-type": "application/json"
                            },
                            json: true,
                            body: {
                                "signature": signature,
                                "username": viewModel.user.name,
                                "ip": "127.0.0.1",
                            }
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    var resData = body;
                                    if (resData.errorcode == 1) {
                                        viewModel.uid = req.session.uid;
                                        viewModel.openId = req.session.openId;
                                        viewModel.isVip = resData.rows;
                                        res.render('detail/bookDetailView', {title: '图书详情', viewModel});
                                    } else {
                                        errorHelper.error500(req, res);
                                    }
                                } catch (e) {
                                    errorHelper.error500(req, res);
                                }
                            } else {
                                errorHelper.error400(req, res);
                            }
                        });
                } else {
                    viewModel.uid = req.session.uid;
                    viewModel.openId = req.session.openId;
                    res.render('detail/bookDetailView', {title: '图书详情', viewModel});
                }
            }
        })
    },
    // 期刊详情
    showPeriodDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('detail/periodDetailView', {title: '期刊详情', viewModel});
        })
    },
    // 单本期刊详情
    showSinglePeriodDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            // 手机端访问
            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/magazine/detail/" + id : "";
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            }
            // pc端访问
            else {
                if (viewModel.user.name != null) {
                    var signature = jsEncryptHelper.encrypt(req.session.uid);
                    request({
                            url: webConfig.vipAddr + '/is.do',
                            method: 'post',
                            headers: {
                                "content-type": "application/json"
                            },
                            json: true,
                            body: {
                                "signature": signature,
                                "username": viewModel.user.name,
                                "ip": "127.0.0.1",
                            }
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    var resData = body;
                                    if (resData.errorcode == 1) {
                                        viewModel.uid = req.session.uid;
                                        viewModel.openId = req.session.openId;
                                        viewModel.isVip = resData.rows;
                                        res.render('detail/singlePeriodDetailView', {title: '', viewModel});
                                    } else {
                                        errorHelper.error500(req, res);
                                    }
                                } catch (e) {
                                    errorHelper.error500(req, res);
                                }
                            } else {
                                errorHelper.error400(req, res);
                            }
                        });
                }
                else {
                    viewModel.uid = req.session.uid;
                    viewModel.openId = req.session.openId;
                    res.render('detail/singlePeriodDetailView', {title: '', viewModel});
                }
            }
        })
    },
    // 获取图书详情
    getBookDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            if (viewModel.user.name != null) {
                var signature = jsEncryptHelper.encrypt(req.session.uid);
                async.waterfall([
                    // 是否是会员
                    function (cb) {
                        request({
                                url: webConfig.vipAddr + '/is.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: {
                                    "signature": signature,
                                    "username": viewModel.user.name,
                                    "ip": "127.0.0.1",
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    // console.log('会员检测:', resData);
                                    cb(null, resData);
                                } else {
                                    cb(null, null);
                                }
                            });
                    },
                    // 图书详情
                    function (arg, cb) {
                        // console.log(arg);
                        var ismember = arg.rows == true ? 1 : 0;
                        var formData = {
                            appid: 'android',
                            code: 'getBookDetail',
                            username: viewModel.user.name,
                            id: id,
                            ismember: ismember,
                            recommendbooklimit: 7,
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    // console.log('图书详情:', resData);
                                    cb(null, resData);
                                } else {
                                    cb(null, null);
                                }
                            });
                    },
                ], function (err, results) {
                    if (err) {
                        errorHelper.error500(req, res);
                    }
                    else {
                        if (results) {
                            res.json(JSON.parse(results));
                        } else {
                            errorHelper.error500(req, res);
                        }
                    }
                });
            } else {
                var formData = {
                    appid: 'android',
                    code: 'getBookDetail',
                    username: viewModel.user.name,
                    id: id,
                    ismember: 0,
                    recommendbooklimit: 7,
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }
                        } else {
                            errorHelper.async.reqFailed(res);
                        }
                    });
            }
        })
    },
    //异步 获取图书人气榜
    getBookHotBank: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var formData = {
                appid: 'web',
                code: 'GetBookList',
                IsAPPSale: 0,
                offset: 0,
                limit: 6,
                sort: 'viewcount',
                order: 'desc'
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            if (resData.code == 0) {
                                res.json(resData);
                            } else {
                                // res.json('请检查PC图书人气榜！');
                                errorHelper.async.resFailed(res);
                            }
                        } catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err('无数据');
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },

    //异步 作品评论分页
    getCommentList: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            var pageNum = req.query.pageNum || 1;
            var limit = req.query.limit || 3;
            var offset = (pageNum - 1) * limit;
            var sort = req.query.sort == 'agreecount' ? 'agreecount' : 'id'; //AgreeCount 最热 ID 最新

            var formData = {
                appid: 'web',
                code: 'GetCommentList',
                currentuser: viewModel.user.name,
                offset,
                limit,
                sort,
                id,
                typeid: 2
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            // console.log(resData);
                            if (resData.code == 0) {
                                res.json(resData);
                            } else {
                                // res.json('请检查获取作品评论分页列表！');
                                errorHelper.async.resFailed(res);
                            }
                        } catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err('无数据');
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },

    //异步 获取单期期刊详情
    getLastPic: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let formData = {
                appid: 'web',
                code: 'getSysIndexSelectedTableList',
                pageindex: 1,
                pagesize: 1,
                typeid: 241,
                sort: 'rand()'
                // order: ''
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            // console.log(resData);
                            if (resData.code == 0) {
                                res.json(resData);
                            } else {
                                // res.json('获取最后一张图片接口错误');
                                errorHelper.async.resFailed(res);
                            }
                        } catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err;
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },

    //异步 获取单期期刊详情
    getSinglePeriodDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            if (typeof id != 'undefined' && id != null && id != '' && id.length > 0) {
                if (viewModel.user.name != null) {
                    var signature = jsEncryptHelper.encrypt(req.session.uid);
                    async.waterfall([
                        // 是否是会员
                        function (cb) {
                            request({
                                    url: webConfig.vipAddr + '/is.do',
                                    method: 'post',
                                    headers: {
                                        "content-type": "application/json"
                                    },
                                    json: true,
                                    body: {
                                        "signature": signature,
                                        "username": viewModel.user.name,
                                        "ip": "127.0.0.1",
                                    }
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = body;
                                        // console.log('会员检测:', resData);
                                        cb(null, resData);
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 期刊详情
                        function (arg, cb) {
                            // console.log(arg);
                            var ismember = arg.rows == true ? 1 : 0;
                            var formData = {
                                appid: 'web',
                                code: 'GetMagazineDetail',
                                username: viewModel.user.name,
                                thname: id,
                                ismember: ismember
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = body;
                                        // console.log('图书详情:', resData);
                                        cb(null, resData);
                                    } else {
                                        cb(null, null);
                                    }
                                });
                        },
                    ], function (err, results) {
                        if (err) {
                            errorHelper.error500(req, res);
                        }
                        else {
                            if (results) {
                                res.json(JSON.parse(results));
                            } else {
                                errorHelper.error500(req, res);
                            }
                        }
                    });
                }
                else {
                    var formData = {
                        appid: 'web',
                        code: 'GetMagazineDetail',
                        username: viewModel.user.name,
                        thname: id,
                        ismember: 0
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    var resData = JSON.parse(body);
                                    if (resData.code == 0) {
                                        res.json(resData);
                                    } else {
                                        errorHelper.async.resFailed(res);
                                    }
                                } catch (e) {
                                    errorHelper.async.resFailed(res);
                                }
                            } else {
                                errorHelper.async.reqFailed(res);
                            }
                        });
                }
            }
            else {
                errorHelper.async.resFailed(res, '获取单期期刊详情id不正确');
            }
        })
    },

    //异步 获取整本期刊所有年份
    getPeriodYear: function (req, res, next) {
        var id = req.params.id;
        var formData = {
            appid: 'web',
            code: 'getMagaYearListByCode',
            magacode: id
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查获取期刊详细信息！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw err('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },

    //异步 按年份获取期刊列表
    getPeriodListByYear: function (req, res, next) {
        var magacode = req.params.id;
        var year = req.query.year;
        var pageNum = req.query.pageNum || 1;
        var limit = parseInt(req.query.limit) || 100;
        var offset = (pageNum - 1) * limit;
        var formData = {
            appid: 'web',
            code: 'getMagaYearPeriodList',
            magacode,
            year,
            offset,
            limit
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查按年份获取期刊列表！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw err('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },

    //异步 获取期刊目录
    getPeriodCatalog: function (req, res, next) {
        var thname = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetMagaCatelog',
            dbcode: 'CJFUTOTAL,CJFVTOTAL,CJFTTOTAL',
            thname: thname,
            orderby: 0
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查获取期刊目录！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw err('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 文献搜索结果
    getLiteratureResult: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var album = req.query.album || 'D';
            var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 20;
            var fulltext = req.query.fulltext || null;
            var topic = req.query.topic || null;
            var title = req.query.title || null;
            var keyword = req.query.kd || null;
            var author = req.query.author || null;
            var workUnit = req.query.workuunit || null;
            var source = req.query.source || null;
            var fund = req.query.fund || null;
            var thname = req.query.thname;

            var formData = {
                appid: 'web',
                code: 'getKBaseArticlesByAlbum',
                album: album,
                order: order,
                pageIndex: pageIndex,
                pageSize: pageSize,
                fulltext: fulltext,
                topic: topic,
                title: title,
                keyword: keyword,
                author: author,
                workuunit: workUnit,
                source: source,
                fund: fund,
                thname: thname
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            if (resData.code == 0) {
                                res.json(resData);
                            } else {
                                // res.json('请检查文献结果页接口或查看请求参数是否正确！');
                                errorHelper.async.resFailed(res);
                            }
                        } catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err('无数据');
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },
    //异步 获取期刊全部栏目层次
    getPeriodColumn: function (req, res, next) {
        var thname = req.params.id;
        var pageIndex = req.query.pageNum || 1;
        var pageSize = req.query.pageSize || 10;
        var formData = {
            appid: 'web',
            code: 'GetLevelList',
            thname,
            pageIndex,
            pageSize
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查获取期刊全部栏目层次！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw err('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 按期刊栏目层次展示文献列表
    getLiteratureByColumn: function (req, res, next) {
        var thname = req.params.id;
        var pageIndex = req.query.pageNum || 1;
        var pageSize = req.query.pageSize || 10;
        var level = req.query.level;
        var formData = {
            appid: 'web',
            code: 'GetKBaseArticlesByLevel',
            thname,
            level,
            pageIndex,
            pageSize,
            order: 5
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查按期刊栏目层次展示文献列表！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw err('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 是否为会员
    // checkVip: function(req, res, next) {
    //     cookieFilter(req, res, function(viewModel) {
    //         var signature = jsEncryptHelper.encrypt(req.session.uid);
    //         request({
    //                 url: webConfig.vipAddr + '/is.do',
    //                 method: 'post',
    //                 headers: {
    //                     "content-type": "application/json"
    //                 },
    //                 json: true,
    //                 body: {
    //                     "signature": signature,
    //                     "username": viewModel.user.name,
    //                     "ip": "127.0.0.1",
    //                 }
    //             },
    //             function(err, response, body) {
    //                 if (!err && response.statusCode == 200) {
    //                     res.json(body);
    //                 } else {
    //                     // throw err;
    //                     errorHelper.async.reqFailed(res);
    //                 }
    //             });
    //     })
    // },
    //异步 是否已购买
    isPurchase: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            var ordertype = req.query.ordertype;
            var year = req.query.year || '';
            var period = req.query.period || '';
            var openId = req.session.openId;
            var signature = jsEncryptHelper.encrypt(req.session.uid);
            request({
                    url: webConfig.paymentAddr + '/commit.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "channel": "4",
                        "ordertype": ordertype, //ordertype 1：期刊单期；2：期刊全年；7：图书；
                        "code": id,
                        "year": year,
                        "period": period,
                        "openid": openId,
                        "action": "check",
                        "plateform": 1,
                        "identifier": "f8ff0494a76a7b1ea938a4bcd74147cd",
                        "secret": "3da7cf6c16a3ab87f6fa501f94b9b1a9",
                        "signature": signature
                    }
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        res.json(body);
                    } else {
                        // throw err;
                        errorHelper.async.reqFailed(res);
                    }
                });
        });
    },
};