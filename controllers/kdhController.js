const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const pagerHelper = require('../helpers/pagerHelper');
const url = webConfig.serverAddr;
const contentConfig = require('../config/content.config');
const errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');

module.exports = {
    // 同步 异步 万选号首页
    home(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let orgid = req.query.orgid;
            if (typeof orgid != 'undefined' && orgid != null && orgid != '' && orgid.length > 0) {
                let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/org/" + orgid : "";
                if (redirectUrl != '') {
                    res.redirect(redirectUrl);
                }
                else {
                    async.parallel([
                        // 万选号基本信息
                        function (cb) {
                            var formData = {
                                appid: 'web',
                                code: 'GetOrgBaseInfo',
                                orgid: orgid,
                                username: viewModel.user.name
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
                        // 万选号首页信息
                        function (cb) {
                            var formData = {
                                appid: 'web',
                                code: 'OrgHomePageForWeb',
                                orgid: orgid,
                                username: viewModel.user.name
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
                        // 万选号首页图书
                        function (cb) {
                            var formData = {
                                appid: 'web',
                                code: 'GetOrgJournalBookList',
                                orgid: orgid,
                                offset: 0,
                                limit: 5,
                                sort: 'addtime',
                                typeid: 2
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
                        // 首页banner图
                        function (cb) {
                            var formData = {
                                appid: 'web',
                                code: 'GetBannerListByOrgId',
                                orgid: orgid,
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
                    ], function (err, results) {
                        if (err) {
                            errorHelper.error404(req, res);
                        }
                        else {
                            let resData1, resData2, resData3, resData4;
                            try {
                                resData1 = JSON.parse(results[0]);
                                resData2 = JSON.parse(results[1]);
                                resData3 = JSON.parse(results[2]);
                                resData4 = JSON.parse(results[3]);
                            } catch (e) {
                                errorHelper.error404(req, res, '数据格式错误');
                            }
                            if (resData1.code == 0 && resData2.code == 0 && resData3.code == 0 && resData4.code == 0) {
                                let kdhIndexInfo = resData2.data;
                                let collectionlist = resData2.data.collectionlist;
                                // console.log('resData1', resData1)
                                // console.log('resData2', resData2)
                                // console.log('resData3', resData3)
                                // console.log('resData4', resData4)
                                let listimgtxt, listaudio, listvideo, listpic;
                                if (collectionlist && collectionlist.length > 0) {
                                    listimgtxt = collectionlist.filter(item => item.mediatype === 1);
                                    listaudio = collectionlist.filter(item => item.mediatype === 2);
                                    listvideo = collectionlist.filter(item => item.mediatype === 3);
                                    listpic = collectionlist.filter(item => item.mediatype === 4);
                                }
                                else {
                                    listimgtxt = listaudio = listvideo = listpic = null;
                                }
                                console.log('kdhIndexInfo',kdhIndexInfo)
                                viewModel.data = {
                                    kdhBaseInfo: resData1.data,
                                    kdhIndexInfo,
                                    listimgtxt,
                                    listaudio,
                                    listvideo,
                                    listpic,
                                    bookInfo: resData3.data,
                                    bannerList: resData4.data
                                };
                                res.render('kdh/kdhHomeView', {
                                    title: '万选号',
                                    viewModel: viewModel
                                });
                            }
                            else {
                                errorHelper.error500(req, res, '万选号id错误');
                            }
                        }
                    });
                }

            }
            else {
                errorHelper.error500(req, res, '万选号id错误');
            }

        })
    },
    // 同步 异步 万选号作品页    
    works(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var orgid = req.query.orgid;
            var limit = req.query.limit || 10;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            // var sort = req.query.sort || 'SubmitTime'; //SubmitTime 最新，viewcount 最热
            var sort = req.query.sort == 'SubmitTime' || req.query.sort == 'viewcount' ? req.query.sort : 'SubmitTime'; //SubmitTime 最新，viewcount 最热
            var orgcateid = req.query.orgcateid || '-1';
            var kd = req.query.kd || '';
            var mediatype = req.query.mediatype || -1; //全部作品-1 作品类型 1-图文；2-音频；3-视频；4-图集
            var isAsync = req.query.isAsync || 0;
            async.parallel([
                // 万选号基本信息
                function (cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgBaseInfo',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                // try {
                                //     cb(null, body);
                                // } catch (e) {
                                //     cb(null, null);
                                // }
                                cb(null, body);
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 万选号首页信息
                function (cb) {
                    var formData = {
                        appid: 'web',
                        code: 'OrgHomePage',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                // try {
                                //     cb(null, body);
                                // } catch (e) {
                                //     cb(null, null);
                                // }
                                cb(null, body);
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 万选号作品列表
                function (cb) {
                    var formData = {
                        username: viewModel.user.name,
                        appid: 'web',
                        code: 'GetOrgCollectionListByOrgId',
                        orgid,
                        offset,
                        limit,
                        sort,
                        orgcateid,
                        keyword:kd,
                        mediatype
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
            ], function (err, results) {
                if (err) {
                    // throw err;
                    errorHelper.error500(req, res);
                }else {
                    if (results[0] && results[1] && results[2]) {
                        var kdhIndexInfo = '';
                        if (JSON.parse(results[1])) {
                            kdhIndexInfo = JSON.parse(results[1]).data;
                        }
                        // var { collectionlist } = kdhIndexInfo;  // 测试报错 TypeError: Cannot destructure property `collectionlist` of 'undefined' or 'null'.
                        var collectionlist = [];
                        if (kdhIndexInfo && kdhIndexInfo.collectionlist) {
                            collectionlist = kdhIndexInfo.collectionlist;
                        }
                        if (collectionlist && collectionlist.length > 0) {
                            var listimgtxt = collectionlist.filter(item => item.mediatype === 1);
                            var listaudio = collectionlist.filter(item => item.mediatype === 2);
                            var listvideo = collectionlist.filter(item => item.mediatype === 3);
                            var listpic = collectionlist.filter(item => item.mediatype === 4);
                            var pageStr = pagerHelper(JSON.parse(results[1]).data.total, limit, 5, pageNum);
                            viewModel.data = {
                                kdhBaseInfo: JSON.parse(results[0]).data,
                                kdhIndexInfo: kdhIndexInfo,
                                listimgtxt,
                                listaudio,
                                listvideo,
                                listpic,
                                mediatype,
                                pageStr
                            };
                        }


                        if (isAsync == 0) {
                            res.render('kdh/kdhWorksView', {
                                title: '',
                                viewModel: viewModel
                            });
                        } else {
                            res.json(JSON.parse(results[2]));
                        }
                    } else {
                        errorHelper.error500(req, res);
                    }
                }


            });
        })
    },
    // 同步 异步 万选号微刊页        
    microbook(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var orgid = req.query.orgid;
            var kd = req.query.kd || '';
            // SubmitTime 最新，viewcount 最热
            var sort = req.query.sort == 'SubmitTime' || req.query.sort == 'viewcount' ? req.query.sort : 'SubmitTime';
            var limit = 8;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var isAsync = req.query.isAsync || 0;

            async.parallel([
                // 万选号基本信息
                function (cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgBaseInfo',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                // try {
                                //     cb(null, body);
                                // } catch (e) {
                                //     cb(null, null);
                                // }
                                cb(null, body);
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 微刊
                function (cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgMircBookListByOrgId',
                        orgid: orgid,
                        offset: offset,
                        limit: limit,
                        sort: sort,
                        keyword: kd
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                // try {
                                //     cb(null, body);
                                // } catch (e) {
                                //     cb(null, null);
                                // }
                                cb(null, body);
                            } else {
                                cb(null, null);
                            }
                        });
                },
            ], function (err, results) {
                if (err) {
                    // throw err;
                    errorHelper.error500(req, res);
                }else {
                    if (results[0] && results[1]) {
                        let pageStr = '';
                        if (JSON.parse(results[1]).data && JSON.parse(results[1]).data.total && JSON.parse(results[1]).data.total > 0) {
                            pageStr = pagerHelper(JSON.parse(results[1]).data.total, limit, 5, pageNum);
                        }

                        viewModel.data = {
                            kdhBaseInfo: JSON.parse(results[0]).data,
                            microbookData: JSON.parse(results[1]).data,
                            sort,
                            kd,
                            pageStr
                        };

                        if (isAsync == 0) {
                            res.render('kdh/kdhMicrobookView', {
                                title: '',
                                viewModel: viewModel
                            });
                        } else {
                            res.json(JSON.parse(results[1]));
                        }
                    } else {
                        errorHelper.error500(req, res);
                    }
                }


            });
        })
    },
    // 同步 万选号书店页            
    showBookshop(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var orgid = req.query.orgid;
            var otype = req.query.otype;
            var formData = {
                appid: 'web',
                code: 'GetOrgBaseInfo',
                orgid: orgid,
                username: viewModel.user.name
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
                                viewModel.data = {
                                    kdhBaseInfo: resData.data,
                                    otype: otype
                                };
                                res.render('kdh/kdhBookshopView', {
                                    title: '',
                                    viewModel: viewModel
                                });
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
        })
    },
    // 异步 获取书店页期刊和图书列表
    getPeriodAndBook(req, res, next) {
        var orgid = req.query.orgid;
        var pageNum = req.query.pageNum || 1;
        var limit = req.query.limit;
        var offset = (pageNum - 1) * limit;
        var sort = req.query.sort == 'viewcount' || req.query.sort == 'addtime' ? req.query.sort : 'addtime';
        // var sort = req.query.sort || 'addtime';
        var typeid = req.query.typeid || 1;
        var cateid = req.query.cateid || 0;

        var formData = {
            appid: 'web',
            code: 'GetOrgJournalBookList',
            orgid: orgid,
            offset: offset,
            limit: limit,
            sort: sort,
            typeid: typeid,
            journalcount: 10,
            cateid: cateid
        };
        console.log('获取书店页期刊和图书列表参数', formData);
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
    },
    // 异步 获取作品页分类
    getWorksCategory(req, res, next) {
        var orgid = req.query.orgid;
        var formData = {
            appid: 'web',
            code: 'GetOrgCategoryList',
            orgid: orgid
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
    },
    // 异步 获取万选号基本信息
    getBaseInfo(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var orgid = req.query.orgid;
            var formData = {
                appid: 'web',
                code: 'GetOrgBaseInfo',
                orgid: orgid,
                username: viewModel.user.name
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
        })
    },
    // 异步 关注或者取消关注
    addOrCancelConcern(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            if (viewModel.user.isOrg == false) {
                var orgid = req.query.orgid;
                var otype = req.query.otype;
                var typeid = req.query.typeid || 0;
                var isConcerned = req.query.isConcerned;
                var formData = {
                    appid: 'web',
                    code: 'AddConcern',
                    username: viewModel.user.name,
                    typeid,
                    foreignkeyid: orgid,
                    otype: isConcerned, //0关注 1取消关注
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
            } else {
                res.json({
                    code: -1,
                    msg: contentConfig.orgUserMsg
                });
            }

        })
    },

    // 异步 关注或者取消关注万选号(wjw add 2020.3.17)
    addOrCancelOrg(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            if (viewModel.user.isOrg == false) {
                var orgid = req.query.orgid;
                var otype = req.query.otype;
                var formData = {
                    appid: 'web',
                    code: 'AddConcern',
                    username: viewModel.user.name,
                    typeid: 0,
                    foreignkeyid: orgid,
                    otype: otype,
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
            } else {
                res.json({
                    code: -1,
                    msg: contentConfig.orgUserMsg
                });
            }
        })
    },
    // 异步 获取期刊年信息列表
    getPeriodYear(req, res, next) {
        var magacode = req.query.magacode;
        var formData = {
            appid: 'web',
            code: 'GetMagaYearListByCode',
            magacode: magacode
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
    },
    // 异步 获取书店图书分类
    getBookCategory(req, res, next) {
        var orgid = req.query.orgid;
        var formData = {
            appid: 'web',
            code: 'GetCateOrgBook',
            orgid: orgid
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
    },

};