var cookieFilter = require('../filters/cookieFilter');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var errorHelper = require('../helpers/errorHelper');
var bookCategory = require('../data/bookCategory');
var magaCategory = require('../data/magaCategory');
var errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');
var url = webConfig.serverAddr;

module.exports = {
    showHome(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/homeView', { title: '书刊商城 _知网文化', viewModel });
        })
    },
    showBooklist(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/booklistView', { title: '精选书单_知网文化', viewModel });
        })
    },
    showBooklistDetail(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            let booklistId = req.query.booklistId;
            if (typeof booklistId != 'undefined' && booklistId != null && booklistId != '' && booklistId.length > 0){
                let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/shopshelf/detail/" + booklistId : "";
                // mobile
                if (redirectUrl != '') {
                    res.redirect(redirectUrl);
                }
                else {
                    res.render('mall/booklistDetailView', { title: '', viewModel });
                }
            }
            else {
                errorHelper.error500(req,res,'书单id错误');
            }


        })
    },
    showRank(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/rankView', { title: '排行榜_知网文化', viewModel });
        })
    },
    showFree(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/freeView', { title: '限时免费_知网文化', viewModel });
        })
    },
    showBookHome(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/bookHomeView', { title: '图书频道_知网文化', viewModel });
        })
    },
    showMagaHome(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/magaHomeView', { title: '期刊频道_知网文化', viewModel });
        })
    },
    showCategory(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/categoryView', { title: '', viewModel });
        })
    },
    showSearchResult(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/searchResultView', { title: '书刊搜索_知网文化', viewModel });
        })
    },
    showReaderDownload(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('mall/readerDownloadView', { title: '阅读器下载_知网文化', viewModel });
        })
    },
    // 异步 获取书刊商城首页
    getMallIndex(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getMallIndex'
            };
            request.post({
                url: url,
                form: formData
            }, function(err, response, body) {
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
    // 异步 获取书单分类列表
    getBooklistCateGory(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var parentcode = req.query.parentcode;
            var formData = {
                appid: 'web',
                code: 'getShopShelfCategory',
                parentcode,
            };
            request.post({
                url: url,
                form: formData
            }, function(err, response, body) {
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
    // 异步 获取书单列表
    getMallBooklist(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var limit = req.query.limit;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var code = req.query.code || '';

            var formData = {
                appid: 'web',
                username: viewModel.user.name,
                code: 'getShopShelf',
                category: code,
                limit,
                offset
            };
            request.post({
                url: url,
                form: formData
            }, function(err, response, body) {
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
    // 异步 获取书单详情页
    getBooklistDetail(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.query.booklistId;
            // 手机端访问
            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/shopshelf/detail/" + id : "";
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            }
            // pc端访问
            else {
                var limit = req.query.limit;
                var pageNum = req.query.pageNum || 1;
                var offset = (pageNum - 1) * limit;
                var shelfid = req.query.booklistId || '';

                var formData = {
                    appid: 'web',
                    username: viewModel.user.name,
                    code: 'getShopShelfDetail',
                    shelfid,
                    limit,
                    offset
                };
                request.post({
                    url: url,
                    form: formData
                }, function(err, response, body) {
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
    // 异步 获取榜单列表
    getRankList(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getRankingList',
                type: '0' //1 榜单 0 书单
            };
            request.post({
                url: url,
                form: formData
            }, function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        res.json(resData);
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                } else {
                    errorHelper.async.reqFailed(res);
                }
            });
        })
    },
    // 异步 获取榜单详情内容列表
    getRankingDetail(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            let limit = req.query.limit || 10;
            let pageNum = Number.parseInt(req.query.pageNum);
            pageNum = Number.isSafeInteger(pageNum) && pageNum > 0 ? pageNum : 1;
            let offset = (pageNum - 1) * limit;
            let type = req.query.type || 'maga';
            let rankingcode = req.query.rankingcode;
            let formData = {
                appid: 'web',
                code: 'getRankingDetail',
                type,
                rankingcode,
                limit,
                offset
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
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
    // 异步 获取图书首页
    getMallBookIndex(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getMallBookForPC'
            };
            request.post({
                url: url,
                form: formData
            }, function(err, response, body) {
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
    // 异步 获取期刊首页
    getMallMagaIndex(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getMallJournalForPC'
            };
            request.post({
                url: url,
                form: formData
            }, function(err, response, body) {
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
    // 异步 获取图书期刊分类
    getCategory(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var type = req.query.type;
            if (type == 1) {
                res.json(magaCategory);
            } else {
                res.json(bookCategory);
            }
        })
    },
    // 异步 获取图书列表
    getCateBookList(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var limit = req.query.limit || 10;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var keyword = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.kd) ? req.query.kd : '';
            var category = req.query.category;
            var sort = req.query.sort || 'ViewCount'; // 热门ViewCount 最新 LastestUpdateTime
            var formData = {
                appid: 'web',
                code: 'getShopBookList',
                limit,
                offset,
                keyword,
                category,
                sort,
            };
            console.log(formData);
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
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
    // 异步 获取期刊列表
    getCateMagaList(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var limit = parseInt(req.query.limit) || 10;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var keyword = req.query.kd || '';
            var category = req.query.category;
            var sort = req.query.sort; // 热门不传 最新 LastestUpdateTime 
            var formData = {
                appid: 'web',
                code: 'getShopMagaList',
                limit,
                offset,
                keyword,
                category,
                sort,
            };
            console.log(formData);
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
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
};