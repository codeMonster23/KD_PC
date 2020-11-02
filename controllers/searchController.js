var cookieFilter = require('../filters/cookieFilter');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var errorHelper = require('../helpers/errorHelper');
var worksCategory = require('../data/category');
var errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');
var url = webConfig.serverAddr;

module.exports = {
    showHome(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            res.render('search/searchHomeView', {title: '综合搜索_知网文化', viewModel, kd});
        })
    },
    showWorks(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            var mediatype = req.query.mediatype || 9;
            let worksCateArr = [];
            worksCateArr.push({
                "code": '',
                "name": '全部'
            })
            worksCategory.forEach(item => {
                const {code, name} = item;
                worksCateArr.push({
                    "code": code,
                    "name": name
                })
            });
            res.render('search/searchWorksView', {title: '作品搜索_知网文化', viewModel, kd, mediatype, worksCateArr});
        })
    },
    showMicrobook(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            res.render('search/searchMicrobookView', {title: '微刊搜索_知网文化', viewModel, kd});
        })
    },
    showPeriod(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            res.render('search/searchPeriodView', {title: '期刊搜索_知网文化', viewModel, kd});
        })
    },
    showBook(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            res.render('search/searchBookView', {title: '图书搜索_知网文化', viewModel, kd});
        })
    },
    showKdh(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            res.render('search/searchKdhView', {title: '万选号搜索_知网文化', viewModel, kd});
        })
    },
    showLiterature(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var kd = req.query.kd;
            res.render('search/searchLiteratureView', {title: '综合搜索_知网文化', viewModel, kd});
        })
    },
    // 异步 获取检索结果
    getSearchResult(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var pageNum = req.query.pageNum || 1;
            var limit = req.query.limit || 10;
            var offset = (pageNum - 1) * limit;
            var type = parseInt(req.query.type) || 0; //0 全部 1 微刊 2好文 3音频 4视频 5图集 6万选号 7期刊 8 图书
            var order = 'desc' || '';
            var sort = req.query.sort == 'id' ? 'id' : 'viewcount'; //默认id,viewcount 热门
            if (type == 8) {
                sort = req.query.sort || '';
            }
            if (type == 7) {
                sort = req.query.sort;
            }
            if (type == 6) {
                sort = order = '';
            }
            var reg = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]u4e00-\u9fa5_a-zA-Z0-9]/im;
            var kd = reg.test(req.query.kd) ? req.query.kd : '';
            console.log('kd是否为真', reg.test(req.query.kd));
            var categorycode = req.query.categorycode || '';

            var formData = {
                appid: 'web',
                code: 'multiplesearchpc',
                username: viewModel.user.name,
                offset,
                limit,
                sort,
                type,
                keyword: kd,
                order: order,
                categorycode
            };
            console.log(formData);
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body) || body;
                            console.log(resData);
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