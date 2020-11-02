const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const pagerHelper = require('../helpers/pagerHelper');
const prevNextPagerHelper = require('../helpers/prevNextPagerHelper');
const url = webConfig.serverAddr;
const libraryStaticData = require('../data/library/indexData');
const loginFilter = require('../filters/loginFilter');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');
let getClientIp = require('../utility/getClientIp');

module.exports = {
    // 文献搜索首页
    home: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('literature/literatureHomeView', {
                title: '大众精品期刊文献库_知网文化',
                viewModel: viewModel,
                addr: webConfig
            });
        })
    },
    // 搜索结果 高级搜索结果 单个库搜索结果
    literatureResult: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
            var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var field = req.query.field || null; // 筛选：ztcode：专题代码 year：年 author：作者代码，unit：机构代码 fund：基金代码 level：文献标识码 source 拼音刊名
            var fieldValue = req.query.fieldValue || null; //筛选的type对应的code
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var fulltext = req.query.fulltext || null;
            // var fulltext = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.fulltext) ? req.query.fulltext : null;
            var topic = req.query.topic || null;
            // var topic = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.topic) ? req.query.topic : null;
            var title = req.query.title || null;
            // var title = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.title) ? req.query.title : null;
            var keyword = req.query.kd || null;
            // var keyword = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.kd) ? req.query.kd : null;
            var author = req.query.ar || null;
            // var author = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.ar) ? req.query.ar : null;
            var workUnit = req.query.workuunit || null;
            // var workUnit = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.workUnit) ? req.query.workUnit : null;
            var source = req.query.source || null;
            // var source = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.source) ? req.query.source : null;
            var fund = req.query.fund || null;
            // var fund = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.fund) ? req.query.fund : null;
            var publishDate = req.query.publishdate || null; // 发表时间 两个时间用,（英文逗号）分割例如 2015,2019
            var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.kd || req.query.ar || req.query.workuunit || req.query.source || req.query.fund || null;
            // var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0]; // 第一个字段
            var isAdvancedSearch = req.query.isAdvancedSearch || 0; // 0普通搜索 1高级搜索
            var isAsync = req.query.isAsync || 0;

            var searchWordName = ''; // 比如搜全文 此处值为fulltext
            switch (searchWordValue) {
                case req.query.fulltext:
                    searchWordName = 'fulltext';
                    break;
                case req.query.topic:
                    searchWordName = 'topic';
                    break;
                case req.query.title:
                    searchWordName = 'title';
                    break;
                case req.query.kd:
                    searchWordName = 'kd';
                    break;
                case req.query.ar:
                    searchWordName = 'ar';
                    break;
                case req.query.workuunit:
                    searchWordName = 'workuunit';
                    break;
                case req.query.source:
                    searchWordName = 'source';
                    break;
                case req.query.fund:
                    searchWordName = 'fund';
                    break;
            }


            var dropdownList = {
                fulltext: '全文',
                topic: '主题',
                title: '篇名',
                kd: '关键词',
                ar: '作者',
                source: '来源',
                publishdate: '发表时间'
            };

            // 高级搜索 搜索词组
            var searchWordsStr = '';
            var newQuery = {};

            delete req.query.isAdvancedSearch;
            delete req.query.order;
            delete req.query.pageNum;

            var newQuery = req.query;

            //高级搜索 多个字段组合
            var queryStr = '';
            for (let obj in newQuery) {
                queryStr += '&' + obj + '=' + newQuery[obj];
            }
            queryStr = queryStr.substring(1);

            for (var item in newQuery) {
                searchWordsStr += dropdownList[item] + ':' + newQuery[item] + '; '
            }
            searchWordsStr = searchWordsStr.replace(',', '-'); // 处理时间 如1915-2019


            // 非机构用户
            if (viewModel.user.isOrg == false) {
                var formData = {
                    appid: 'web',
                    code: 'getKBaseArticlesByAlbum',
                    album: album,
                    order: order,
                    field: field,
                    fieldvalue: fieldValue,
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
                    publishdate: publishDate
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                console.log('列表：', resData.data.list)

                                if (resData.code == 0) {
                                    var options = {};
                                    // options[searchWordName] = searchWordValue;
                                    Object.assign(options, options, newQuery);
                                    options.order = order;
                                    options.isAdvancedSearch = isAdvancedSearch;
                                    // var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex, '/literature/literatureResult', options);
                                    // var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex, '/literature/literatureResult', options);
                                    var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex);
                                    var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex);
                                    viewModel.data = resData.data;
                                    viewModel.searchWordValue = searchWordValue;
                                    viewModel.searchWordName = searchWordName;
                                    viewModel.resultPage = resultPage;
                                    viewModel.prevNextPage = prevNextPage;
                                    viewModel.dropdownList = dropdownList;
                                    viewModel.isAdvancedSearch = isAdvancedSearch;
                                    viewModel.queryStr = queryStr;
                                    viewModel.params = {
                                        order: order,
                                        pageNum: pageIndex
                                    };
                                    viewModel.searchWordsStr = searchWordsStr;
                                    if (isAsync == 0) {
                                        res.render('literature/literatureResultView', {
                                            title: '文献搜索_知网文化',
                                            viewModel: viewModel,
                                            addr: webConfig
                                        });
                                    } else {
                                        res.json(resData);
                                    }

                                }
                                else {
                                    // console.log('请检查文献结果页接口或查看请求参数是否正确！')
                                    errorHelper.error500(req, res);
                                }
                            }
                            catch (e) {
                                errorHelper.error500(req, res);
                            }
                        } else {
                            // throw new Error('无数据');
                            errorHelper.error400(req, res);
                        }
                    });
            }
            // 机构用户
            else {
                async.parallel([
                    // 搜索结果
                    function (cb) {
                        var formData = {
                            appid: 'web',
                            code: 'getKBaseArticlesByAlbum',
                            album: album,
                            order: order,
                            field: field,
                            fieldvalue: fieldValue,
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
                            publishdate: publishDate
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
                    // 机构包库权限
                    function (cb) {
                        let signature = jsEncryptHelper.encrypt(req.session.uid);
                        let formData = {
                            "signature": signature,
                            "username": viewModel.user.name
                        };
                        console.log('获取机构用户包库权限参数', formData)
                        request({
                                url: webConfig.paymentAddr + '/institutionrignt.do',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                json: true,
                                body: formData,
                                method: 'post'
                            },
                            function (err, response, body) {
                                console.log('获取机构用户包库权限', body);
                                cb(null, body);
                            });
                    }
                ], function (err, results) {
                    if (results[0] && results[1]) {
                        try {
                            let resData = JSON.parse(results[0]);
                            // let resData1 = JSON.parse(results[1]);

                            if (resData.code == 0) {
                                // 获取机构账号包含的库名
                                viewModel.libRightStr = Object.keys(results[1].RightInfo).toString();
                                console.log('viewModel.libRightStr', viewModel.libRightStr);

                                var options = {};
                                // options[searchWordName] = searchWordValue;
                                Object.assign(options, options, newQuery);
                                options.order = order;
                                options.isAdvancedSearch = isAdvancedSearch;
                                // var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex, '/literature/literatureResult', options);
                                // var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex, '/literature/literatureResult', options);
                                var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex);
                                var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex);
                                viewModel.data = resData.data;
                                viewModel.searchWordValue = searchWordValue;
                                viewModel.searchWordName = searchWordName;
                                viewModel.resultPage = resultPage;
                                viewModel.prevNextPage = prevNextPage;
                                viewModel.dropdownList = dropdownList;
                                viewModel.isAdvancedSearch = isAdvancedSearch;
                                viewModel.queryStr = queryStr;
                                viewModel.params = {
                                    order: order,
                                    pageNum: pageIndex
                                };
                                viewModel.searchWordsStr = searchWordsStr;

                                if (isAsync == 0) {
                                    res.render('literature/literatureResultView', {
                                        title: '文献搜索_知网文化',
                                        viewModel: viewModel,
                                        addr: webConfig
                                    });
                                } else {
                                    res.json(resData);
                                }
                            }
                            else {
                                // console.log('请检查文献结果页接口或查看请求参数是否正确！');
                                errorHelper.error500(req, res, '未获取到搜索结果或包库权限获取数据');
                            }
                        }
                        catch (e) {
                            errorHelper.error500(req, res, '搜索结构活包库权限获取数据转换出现错误');
                        }
                    }
                    else {
                        errorHelper.error400(req, res, '搜索结果或包库权限获取出现错误');
                    }
                });
            }
        })
    },
    // 单个库搜索结果 高级搜索结果
    libraryResult: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
            var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var field = req.query.field || null; // 筛选：ztcode：专题代码 year：年 author：作者代码，unit：机构代码 fund：基金代码 level：文献标识码 source 拼音刊名
            var fieldValue = req.query.fieldValue || null; //筛选的type对应的code
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            // var fulltext = req.query.fulltext || null;
            var fulltext = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.fulltext) ? req.query.fulltext : null;
            // var topic = req.query.topic || null;
            var topic = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.topic) ? req.query.topic : null;
            // var title = req.query.title || null;
            var title = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.title) ? req.query.title : null;
            var keyword = req.query.kd || null;
            // var author = req.query.ar || null;
            var author = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.ar) ? req.query.ar : null;
            var workUnit = req.query.workuunit || null;
            var source = req.query.source || null;
            var fund = req.query.fund || null;
            var publishDate = req.query.publishdate || null; // 发表时间 两个时间用,（英文逗号）分割例如 2015,2019
            var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.kd || req.query.ar || req.query.workuunit || req.query.source || req.query.fund || null; // 比如搜历史，此处为值历史
            // var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0]; // 第一个字段
            var searchWordName = ''; // 比如搜全文 此处值为fulltext
            switch (searchWordValue) {
                case req.query.fulltext:
                    searchWordName = 'fulltext';
                    break;
                case req.query.topic:
                    searchWordName = 'topic';
                    break;
                case req.query.title:
                    searchWordName = 'title';
                    break;
                case req.query.kd:
                    searchWordName = 'keyword';
                    break;
                case req.query.ar:
                    searchWordName = 'author';
                    break;
                case req.query.workuunit:
                    searchWordName = 'workuunit';
                    break;
                case req.query.source:
                    searchWordName = 'source';
                    break;
                case req.query.fund:
                    searchWordName = 'fund';
                    break;
            }
            var dropdownList = {
                fulltext: '全文',
                topic: '主题',
                title: '篇名',
                kd: '关键词',
                ar: '作者',
                source: '来源',
                publishdate: '发表时间'
            };
            var isAdvancedSearch = req.query.isAdvancedSearch || 0; // 0普通搜索 1高级搜索
            var isAsync = req.query.isAsync || 0;
            var isLiterature = req.query.isLiterature || 0; // 区分单库文献和期刊搜索 0 文献 1 期刊
            var libraryType = '';
            var libName = '';
            if (album == 'V') {
                libraryType = 'cjfvtotal';
                libName = 'cjfv';
            }
            else if (album == 'U') {
                libraryType = 'cjfutotal';
                libName = 'cjfu';
            }
            else if (album == 'T') {
                libraryType = 'cjfttotal';
                libName = 'cjft';
            }
            var periodStaticData = libraryStaticData.period;

            //------------------------------------------------------------------------
            // 文献 高级搜索 搜索词组

            var searchWordsStr = '';
            var newQuery = {};

            delete req.query.isAdvancedSearch;
            delete req.query.order;
            delete req.query.pageNum;
            delete req.query.album;
            delete req.query.isLiterature;

            newQuery = req.query;

            //高级搜索 多个字段组合
            var queryStr = '';
            for (let obj in newQuery) {
                queryStr += '&' + obj + '=' + newQuery[obj];
            }
            queryStr = queryStr.substring(1);

            for (var item in newQuery) {
                searchWordsStr += dropdownList[item] + ':' + newQuery[item] + '; ';
            }
            searchWordsStr = searchWordsStr.replace(',', '-'); // 处理时间 如1915-2019

            // 非机构用户
            if (viewModel.user.isOrg == false) {
                var formData = {
                    appid: 'web',
                    code: 'getKBaseArticlesByAlbum',
                    album: album,
                    order: order,
                    field: field,
                    fieldvalue: fieldValue,
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
                    publishdate: publishDate
                };
                // console.log(formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                // console.log(resData.data.list)

                                if (resData.code == 0) {
                                    var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex);
                                    var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex);
                                    viewModel.data = resData.data;
                                    viewModel.album = album;

                                    viewModel.searchWordValue = searchWordValue;
                                    viewModel.searchWordName = searchWordName;
                                    viewModel.resultPage = resultPage;
                                    viewModel.prevNextPage = prevNextPage;
                                    viewModel.dropdownList = dropdownList;
                                    viewModel.isAdvancedSearch = isAdvancedSearch;
                                    viewModel.queryStr = queryStr;
                                    viewModel.params = {
                                        order: order,
                                        pageNum: pageIndex
                                    };
                                    viewModel.searchWordsStr = searchWordsStr;
                                    viewModel.libraryType = libraryType;
                                    viewModel.libraryStaticData = libraryStaticData;
                                    viewModel.periodStaticData = periodStaticData; // 导航分类数据
                                    viewModel.isLiterature = isLiterature;

                                    // 文献库综合搜索
                                    if (isAsync == 0) {
                                        res.render('literature/libraryResultView', {
                                            title: '文献搜索_知网文化',
                                            viewModel: viewModel,
                                            addr: webConfig
                                        });
                                    } else { // 单个库搜索
                                        res.json(resData);
                                    }

                                }
                                else {
                                    // console.log('请检查文献结果页接口或查看请求参数是否正确！');
                                    errorHelper.error500(req, res);
                                }
                            }
                            catch (e) {
                                errorHelper.error500(req, res);
                            }
                        }
                        else {
                            // throw new Error('无数据');
                            errorHelper.error400(req, res);
                        }
                    });
            }
            // 机构用户
            else {
                async.parallel([
                    // 搜索结果
                    function (cb) {
                        var formData = {
                            appid: 'web',
                            code: 'getKBaseArticlesByAlbum',
                            album: album,
                            order: order,
                            field: field,
                            fieldvalue: fieldValue,
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
                            publishdate: publishDate
                        };
                        // console.log(formData)
                        request.post({
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    cb(null, body);
                                }
                                else {
                                    cb(null, null);
                                }
                            });
                    },
                    // 机构包库权限
                    function (cb) {
                        let signature = jsEncryptHelper.encrypt(req.session.uid);
                        let formData = {
                            "signature": signature,
                            "username": viewModel.user.name
                        };
                        console.log('获取机构用户包库权限参数', formData)
                        request({
                                url: webConfig.paymentAddr + '/institutionrignt.do',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                json: true,
                                body: formData,
                                method: 'post'
                            },
                            function (err, response, body) {
                                console.log('获取机构用户包库权限', body);
                                cb(null, body);
                            });
                    }
                ], function (err, results) {
                    if (results[0] && results[1]) {
                        try {
                            let resData = JSON.parse(results[0]);
                            // let resData1 = JSON.parse(results[1]);

                            if (resData.code == 0) {
                                // 判断当前机构用户是否含有库权限
                                if (Object.keys(results[1].RightInfo).toString().indexOf(libName) != -1) {
                                    viewModel.libRight = 1;
                                }
                                else {
                                    viewModel.libRight = 0;
                                }
                                console.log(libName, 'viewModel.libRight', viewModel.libRight, 'viewmodel.user.isOrg', viewModel.user.isOrg, Object.keys(results[1].RightInfo).toString())

                                var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex);
                                var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex);
                                viewModel.data = resData.data;
                                viewModel.album = album;

                                viewModel.searchWordValue = searchWordValue;
                                viewModel.searchWordName = searchWordName;
                                viewModel.resultPage = resultPage;
                                viewModel.prevNextPage = prevNextPage;
                                viewModel.dropdownList = dropdownList;
                                viewModel.isAdvancedSearch = isAdvancedSearch;
                                viewModel.queryStr = queryStr;
                                viewModel.params = {
                                    order: order,
                                    pageNum: pageIndex
                                };
                                viewModel.searchWordsStr = searchWordsStr;
                                viewModel.libraryType = libraryType;
                                viewModel.libraryStaticData = libraryStaticData;
                                viewModel.periodStaticData = periodStaticData; // 导航分类数据
                                viewModel.isLiterature = isLiterature;

                                // 文献库综合搜索
                                if (isAsync == 0) {
                                    res.render('literature/libraryResultView', {
                                        title: '文献搜索_知网文化',
                                        viewModel: viewModel,
                                        addr: webConfig
                                    });
                                } else { // 单个库搜索
                                    res.json(resData);
                                }

                            }
                            else {
                                // console.log('请检查文献结果页接口或查看请求参数是否正确！');
                                errorHelper.error500(req, res, '未获取到搜索结果或包库权限获取数据');
                            }
                        }
                        catch (e) {
                            errorHelper.error500(req, res, '搜索结构活包库权限获取数据转换出现错误');
                        }
                    }
                    else {
                        // throw new Error('无数据');
                        errorHelper.error400(req, res, '搜索结果或包库权限获取出现错误');
                    }
                });
            }


        })
    },
    //异步 获取分类 作者 机构 来源 发表年度等
    getLiteratureSortList: function (req, res, next) {
        // var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0];
        var searchWordName = '';
        var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.kd || req.query.ar || req.query.workuunit || req.query.source || req.query.fund || null;
        var zjCode = req.query.zjCode || 'U,V,T';
        switch (searchWordValue) {
            case req.query.fulltext:
                searchWordName = 'fulltext';
                break;
            case req.query.topic:
                searchWordName = 'topic';
                break;
            case req.query.title:
                searchWordName = 'title';
                break;
            case req.query.kd:
                searchWordName = 'keyword';
                break;
            case req.query.ar:
                searchWordName = 'author';
                break;
            case req.query.workunit:
                searchWordName = 'workunit';
                break;
            case req.query.source:
                searchWordName = 'source';
                break;
            case req.query.fund:
                searchWordName = 'fund';
                break;
        }
        var formData = {
            appid: 'web',
            code: 'GetArticleFilter',
            zjcode: zjCode
        };
        formData[searchWordName] = searchWordValue;
        formData.filtertype = req.query.filterType;
        // console.log(formData)
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        console.log(data.data)
                        if (data.code == 0) {
                            res.json(data);
                        } else {
                            // res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                }
                else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 根据分类 作者 机构 来源 发表年度详细分类获取列表
    getLiteratureDetailSortList: function (req, res, next) {
        var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
        var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
        var field = req.query.field || null; // 筛选：ztcode：专题代码 year：年 author：作者代码，unit：机构代码 fund：基金代码 level：文献标识码 source 拼音刊名
        var fieldValue = req.query.fieldvalue || null; //筛选的type对应的code
        var pageIndex = req.query.pageNum || 1;
        var pageSize = req.query.pageSize || 10;
        var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.kd || req.query.ar || req.query.workuunit || req.query.source || req.query.fund || null;
        var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0];
        // var dropdownList = {
        //     fulltext: '全 文',
        //     topic: '主 题',
        //     title: '篇 名',
        //     keyword: '关键词',
        //     author: '作 者',
        //     source: '来 源'
        // };

        var formData = {
            appid: 'web',
            code: 'getKBaseArticlesByAlbum',
            album: album,
            order: order,
            field: field,
            fieldvalue: fieldValue,
            pageIndex: pageIndex,
            pageSize: pageSize
        };
        formData[searchWordName] = searchWordValue;
        // formData.filtertype = req.query.filterType;
        // console.log(formData)
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        // console.log(data.data.list)
                        if (data.code == 0) {
                            res.json(data);
                        } else {
                            // res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                }
                else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 根据关键字 获取相关联万选号
    getOrgListByKeyword: function (req, res, next) {
        var keyword = decodeURI(req.query.kd);
        var limit = req.query.limit;

        var formData = {
            appid: 'web',
            code: 'GetOrgList',
            keyword,
            order: 'DESC',
            offset: 0,
            limit,
            sort: 'ClickCount'
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        console.log('获取万选号数据', JSON.parse(body));
                        let data = JSON.parse(body);
                        if (data.code == 0) {
                            res.json(data.data);
                        } else {
                            // res.json('请检查获取万选号列表信息接口，或查看传参是否正确！');
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
    },
    // 文献库高级搜索
    advancedSearch: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('literature/advancedSearchView', {title: '文献搜索_知网文化', viewModel: viewModel, addr: webConfig});
        })
    },
    // 频道 高级搜索
    channelSearch: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var libraryType = req.query.dbName;
            var album = '';
            if (libraryType == 'cjfvtotal') {
                album = 'V';
            } else if (libraryType == 'cjfutotal') {
                album = 'U';
            } else if (libraryType == 'cjfttotal') {
                album = 'T';
            }
            viewModel.album = album;
            viewModel.libraryType = libraryType;
            viewModel.libraryStaticData = libraryStaticData;
            var periodStaticData = libraryStaticData.period;
            viewModel.periodStaticData = periodStaticData; // 导航分类数据
            res.render('literature/channelSearchView', {title: '文献搜索_知网文化', viewModel: viewModel, addr: webConfig});
        })
    },
    // 文献详情页
    literatureDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let filename = '';
            let dbType = '';
            // 参数fd最后一位为dbType值
            if (Object.keys(req.params).length > 0 && req.params.fd) {
                let fd = req.params.fd;
                filename = fd.substring(0, fd.length - 4);
                dbType = fd.substring(fd.length - 4);
            }
            else {
                filename = /^[a-zA-Z0-9]+$/.test(req.query.filename) ? req.query.filename : null;
                if (filename == null) {
                    res.status(404);
                    res.render('errorView', {
                        title: '知网文化'
                    });
                }
                dbType = req.query.dbType;
            }

            let libraryType = dbType.toLowerCase() + 'total';
            let periodStaticData = libraryStaticData.period;
            let signature = jsEncryptHelper.encrypt(req.session.uid);
            let formData = {
                appid: 'web',
                code: 'GetArticleInfo',
                filename: filename,
                dbtype: dbType
            };
            let redirectUrl = /Android|webOS|iPhone|iPod|BlackBerry|UCBrowser/i.test(req.headers['user-agent']) ? "https://zwwh.cnki.net/web/m/article/detail/" + filename : "";
            if (redirectUrl != '') {
                res.redirect(redirectUrl);
            }
            else {
                // 用户未登录，只查文献详情和相关数据
                if (viewModel.user.name == null) {
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
                                console.log('文献详情页：', data)
                                if (data.code == 0) {
                                    viewModel.libraryType = libraryType;
                                    viewModel.data = data.data;
                                    viewModel.libraryStaticData = libraryStaticData;
                                    viewModel.periodStaticData = periodStaticData; // 导航分类数据
                                    viewModel.filename = filename;
                                    viewModel.dbType = dbType;
                                    // console.log(viewModel.data.artilce);
                                    res.render('literature/literatureDetailView', {
                                        viewModel: viewModel,
                                        title: data.data.artilce.title + '_知网文化'
                                    });
                                } else if (data.code == -1) {
                                    // 删除的文献跳到下架
                                    res.render('offShelfView');
                                } else {
                                    // res.status(400); // Bad request
                                    // res.render('errorView', {
                                    //     title: '知网文化'
                                    // });
                                    // errorHelper.error500(req, res);
                                    errorHelper.error404(req, res);

                                }
                            }
                            else {
                                // throw err;
                                // errorHelper.error400(req, res, '文献详情页无法获取到数据');
                                redirectHelper(res, '/literature' + req.url);
                        }
                        });
                }
                // 用户登录，除查文献详情和相关数据，还需查文献是否可以直接下载
                else {
                    async.parallel([
                        // 文献详情
                        function (cb) {
                            request.post({
                                    url: url,
                                    form: {
                                        appid: 'web',
                                        code: 'GetArticleInfo',
                                        filename: filename,
                                        dbtype: dbType,
                                        username: viewModel.user.name
                                    }
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        try {
                                            let data = JSON.parse(body);
                                            console.log('文献详情数据：', data);
                                            if (data.code == 0) {
                                                cb(null, data);
                                            } else {
                                                // throw new Error('文献详情页数据返回错误');
                                                cb(null, null);
                                            }
                                        } catch (e) {
                                            cb(null, null);
                                        }
                                    }
                                    else {
                                        // throw err;
                                        cb(null, null);
                                    }
                                });
                        },
                        // 获取文献价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '1',
                                "code": filename,
                                "ordertype": 0,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                            };
                            // console.log('文献详情页-获取文献价格参数:', formData);
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
                                    console.log('文献详情页-获取文献价格返回:', body)
                                    if (!err && response.statusCode == 200) {
                                        try {
                                            let resData = body;
                                            cb(null, resData);
                                        } catch (e) {
                                            cb(null, null);
                                        }
                                    } else {
                                        // throw new Error('支付接口action:check，错误');
                                        cb(null, null);
                                    }
                                });
                        },
                        // 文献下载链接
                        function (cb) {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: 'literatureDownload',
                                ftype: 'pdf'
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        try {
                                            let resData = JSON.parse(body);
                                            console.log('文献下载地址返回：', resData);
                                            cb(null, resData);
                                        } catch (e) {
                                            cb(null, null);
                                        }

                                    } else {
                                        // throw err;
                                        cb(null, null);
                                    }
                                });
                        },

                    ], function (err, results) {
                        if (err) {
                            // throw err;
                            // errorHelper.error500(req, res);
                            redirectHelper(res, '/literature' + req.url);
                        }
                        else {
                            if (results[0] && results[1] && results[2]) {
                                viewModel.isVip = req.session.isVip;
                                viewModel.isOrg = req.session.isOrg;
                                viewModel.libraryType = libraryType;
                                viewModel.data = results[0].data;
                                // console.log('已登录文献详情'+results[0].code);
                                viewModel.libraryStaticData = libraryStaticData;
                                viewModel.periodStaticData = periodStaticData; // 导航分类数据
                                viewModel.filename = filename;
                                viewModel.freeDownload = 0;
                                viewModel.downloadUrl = results[2].data.downloadurl.substring(1, results[2].data.downloadurl.length - 1);
                                viewModel.dbType = dbType;
                                let isOrg = req.session.isOrg;
                                if (isOrg == true) {
                                    // 机构无权限
                                    if (results[1].ErrorCode == 401) {
                                        viewModel.freeDownload = -1;
                                    }
                                    // 机构有权限,直接下载
                                    else if (results[1].ErrorCode == 102) {
                                        viewModel.freeDownload = 1;
                                    }
                                    // 其他情况，提示ErrorMessage
                                    else {
                                        viewModel.freeDownload = -2;
                                        viewModel.orgInfo = results[1];
                                    }
                                }
                                else {
                                    // 已通过余额购买成功，可直接下载
                                    if (results[1].ErrorCode == 107) {
                                        viewModel.freeDownload = 1;
                                    }
                                }
                                if (results[0].code == -1) {
                                    // 删除的文献跳到已下架
                                    return res.render('offShelfView');
                                }
                                res.render('literature/literatureDetailView', {
                                    viewModel: viewModel,
                                    title: results[0].data.artilce.title + '_知网文化'
                                });
                            } else {
                                errorHelper.error500(req, res);
                            }
                        }
                    });

                }
            }

        })
    },
    // 文献下载页
    literatureDownload: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let filename = req.query.filename;
                // let title = req.query.title;
                // let year = req.query.year;
                // let period = req.query.period;
                // let pageCount = req.query.pageCount;
                // let source = req.query.source;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let libraryType = req.query.lt;
                let userIp = req.headers['x-forwarded-for'] ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    req.connection.socket.remoteAddress || '';
                if (userIp.split(',').length > 0) {
                    userIp = userIp.split(',')[0];
                }

                async.parallel([
                    // 账户余额
                    function (cb) {
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
                            },
                            function (err, response, body) {
                                console.log('用户余额查询：', body);
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    if (resData.errorcode == 1) {
                                        cb(null, resData.rows)
                                    } else {
                                        // console.log('未查询到账户余额信息！')
                                        cb(null, null);
                                    }
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 获取文献价格
                    function (cb) {
                        let formData = {
                            "signature": signature,
                            "channel": '1',
                            "code": filename,
                            "ordertype": 0,
                            "openid": req.session.openId,
                            "action": "check",
                            "identifier": appId,
                            "secret": secret,
                            "ip": userIp
                        };
                        console.log('获取文献价格参数:', formData);
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
                                console.log('获取文献价格返回:', body)
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    // console.log('check:', resData);
                                    cb(null, resData);
                                } else {
                                    // throw new Error('支付接口action:check，错误');
                                    cb(null, null);
                                }
                            });
                    },
                    // 文献详情
                    function (cb) {
                        request.post({
                                url: url,
                                form: {
                                    appid: 'web',
                                    code: 'GetArticleInfo',
                                    filename: filename,
                                    dbtype: libraryType.substring(0,4),
                                    username: viewModel.user.name
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    try {
                                        let data = JSON.parse(body);
                                        console.log('文献详情数据download：', data);
                                        if (data.code == 0) {
                                            cb(null, data);
                                        } else {
                                            // throw new Error('文献详情页数据返回错误');
                                            cb(null, null);
                                        }
                                    } catch (e) {
                                        cb(null, null);
                                    }
                                }
                                else {
                                    // throw err;
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
                            // viewModel.filename = filename;
                            viewModel.filename = results[2].data.artilce.fileName;
                            // viewModel.title = title;
                            viewModel.title = results[2].data.artilce.title;
                            // viewModel.year = year;
                            viewModel.year = results[2].data.artilce.year;
                            // viewModel.period = period;
                            viewModel.period = results[2].data.artilce.period;
                            // viewModel.pageCount = pageCount;
                            viewModel.pageCount = results[2].data.artilce.pageCount;
                            // viewModel.source = source;
                            viewModel.source = results[2].data.artilce.publishName;
                            viewModel.account = results[0];
                            viewModel.check = results[1];
                            viewModel.check.freeDownload = 0;
                            viewModel.libraryType = libraryType;
                            viewModel.libraryStaticData = libraryStaticData;
                            viewModel.periodStaticData = libraryStaticData.period;
                            viewModel.isVip = req.session.isVip;
                            viewModel.isOrg = req.session.isOrg;
                            let price = parseFloat(results[1].Price);
                            viewModel.check.Price = price;
                            if (results[1].ErrorCode == 1001 || results[1].ErrorCode == 102) {
                                // ErrorMessage: '已经有权限，为2013年之前的文献'
                                // 跳转至扣费页面，按钮改为免费下载
                                viewModel.sufficient = 1;
                                viewModel.check.freeDownload = 1;
                            } else {
                                viewModel.sufficient = 0;
                                // console.log('价格：', results[0].Money, price);
                                if (parseFloat(results[0].Money) >= price) {
                                    viewModel.sufficient = 1;
                                }
                            }
                            console.log('viewModel:', viewModel)
                            res.render('literature/literatureDownloadView', {viewModel: viewModel, title: '文献下载'});
                        }
                        else {
                            errorHelper.error500(req, res);
                        }
                    }

                });


            });
        })
    },
    // 文献立即下载
    download: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let userIp = getClientIp(req);
                let filename = req.query.filename;
                // let price = req.query.price;
                // let title = req.query.title;
                // let year = req.query.year;
                // let period = req.query.period;
                // let pageCount = req.query.pageCount;
                // let source = req.query.source;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                async.waterfall([
                    // 购买
                    function (cb) {
                        let formData = {
                            "signature": signature,
                            "channel": '1',
                            "code": filename,
                            "ordertype": 0,
                            "openid": req.session.openId,
                            "action": "pay",
                            "identifier": appId,
                            "secret": secret,
                            "ip": userIp
                        };
                        // console.log('参数:', formData)
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
                                    let resData = body;
                                    console.log('文献购买结果:', resData);
                                    cb(null, resData);
                                } else {
                                    // throw err;
                                    cb(null, null);
                                }
                            });
                    },
                    // 文献下载
                    function (arg, cb) {
                        if (arg.ErrorMessage == '购买成功' || arg.ErrorMessage == '用户有权限下载' || arg.ErrorCode == 1001 || arg.ErrorCode == 102) {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: 'literatureDownload',
                                ftype: 'pdf'
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = JSON.parse(body);
                                        console.log('下载：', resData);
                                        cb(null, resData);
                                    } else {
                                        // throw err;
                                        cb(null, null);
                                    }
                                });
                        }
                        else {
                            // throw new Error(arg.ErrorMessage)
                            cb(null, null);
                        }
                    },
                ], function (err, results) {
                    if (err) {
                        // throw err;
                        errorHelper.async.resFailed(res);
                    }else {
                        if (results) {
                            let url = results.data.downloadurl.substring(1, results.data.downloadurl.length - 1);

                            res.json(url);
                        }
                        else {
                            errorHelper.async.resFailed(res);
                        }
                    }

                });
            });
        })
    },

    //同步 异步 文艺、文化、科普库
    library: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var dbName = req.query.dbname || 'cjfutotal,cjtvtotal,cjfttotal'; // U:精品文化;V"精品文艺;T:精品科普
            var orderby = req.query.orderby || 3; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            // var ztCode = req.query.ztcode || null; //筛选的type对应的code
            var ztCode = /^[a-zA-Z0-9]+$/.test(req.query.ztcode) ? req.query.ztcode : null;
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var isAsync = req.query.isAsync || 0;
            var album = 'U,V,T';
            var libraryName = '';
            var periodStaticData = libraryStaticData.period;
            if (dbName == 'cjfutotal') {
                album = 'U';
                libraryName = '文化';
            } else if (dbName == 'cjfvtotal') {
                album = 'V';
                libraryName = '文艺作品';
            } else if (dbName == 'cjfttotal') {
                album = 'T';
                libraryName = '科普';
            }

            var formData = {
                appid: 'web',
                code: 'GetRecommendArticle',
                dbname: dbName,
                orderby: orderby,
                ztcode: ztCode,
                pageindex: pageIndex,
                pagesize: pageSize
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            // console.log(resData.data)

                            if (resData.code == 0) {
                                if (isAsync == 0) {
                                    viewModel.data = resData.data;
                                    viewModel.libraryType = dbName;
                                    viewModel.libraryStaticData = libraryStaticData; // 导航分类数据
                                    viewModel.periodStaticData = periodStaticData; // 导航分类数据

                                    viewModel.ztcode = ztCode;
                                    viewModel.album = album;
                                    res.render('literature/libraryView', {
                                        viewModel: viewModel,
                                        title: '中国精品' + libraryName + '期刊文献库' + '_知网文化'
                                    });
                                } else {
                                    res.json(resData);
                                }
                            }
                            else {
                                // console.log('请检查文献库接口！')
                                if (isAsync == 0) {
                                    errorHelper.error500(req, res);
                                } else {
                                    errorHelper.async.resFailed(res);
                                }
                            }
                        } catch (e) {
                            if (isAsync == 0) {
                                errorHelper.error500(req, res);
                            } else {
                                errorHelper.async.resFailed(res);
                            }
                        }

                    }
                    else {
                        // throw new Error('无数据');
                        if (isAsync == 0) {
                            errorHelper.error400(req, res);
                        } else {
                            errorHelper.async.reqFailed(res);
                        }
                    }
                });
        })
    },
    // 库频道
    channel: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            // var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
            var album = req.query.album == 'U' || req.query.album == 'V' || req.query.album == 'T' ? req.query.album : 'U,V,T';
            // var order = req.query.order || 3; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var order = req.query.order == 0 || req.query.order == 1 || req.query.order == 2 ? req.query.order : 3;
            // var subject = req.query.subject || null;
            var subject = /^[a-zA-Z0-9]+$/.test(req.query.subject) ? req.query.subject : null;
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var publishDate = req.query.publishdate || null;
            var dbName = req.query.dbname;
            var isAsync = req.query.isAsync || 0;
            var x = req.query.x || -1; // 一级分类位置
            var ztName = decodeURI(req.query.ztName);
            var isRecommended = req.query.isRecommended || 1; // 0：全部，1：精选
            if (ztName == 'undefined') {
                ztName = 0; // 作为标示在前端判断
            }
            var periodStaticData = libraryStaticData.period;
            var formData = {
                appid: 'web',
                code: 'GetKBaseArticlesBySubject',
                album: album,
                order: order,
                subject: subject,
                pageIndex: pageIndex,
                pageSize: pageSize,
                publishdate: publishDate,
                IsRecommend: isRecommended
            };
            console.log('频道页参数', formData);
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            console.log('频道页数据：', resData.data)
                            if (resData.code == 0) {
                                if (isAsync == 0) {
                                    viewModel.data = resData.data;
                                    viewModel.libraryType = dbName;
                                    viewModel.libraryStaticData = libraryStaticData; // 导航分类数据
                                    viewModel.position = {
                                        x: x
                                    };
                                    viewModel.album = album;
                                    viewModel.ztName = ztName;
                                    viewModel.ztCode = subject;
                                    viewModel.pageStr = pagerHelper(resData.data.total, 10, 5, pageIndex);
                                    viewModel.periodStaticData = periodStaticData; // 导航分类数据
                                    var title = '';
                                    if (viewModel.libraryType == 'cjfvtotal') {
                                        // 文艺库
                                        title = '文艺库';
                                    } else if (viewModel.libraryType == 'cjfutotal') {
                                        // 文化库
                                        title = '文化库';
                                    } else if (viewModel.libraryType == 'cjfttotal') {
                                        // 科普库
                                        title = '科普库';
                                    }
                                    res.render('literature/channelView', {
                                        viewModel: viewModel,
                                        title: title + '_知网文化'
                                    });
                                } else {
                                    res.json(resData);
                                }

                            }
                            else {
                                // console.log('请检查获取文献频道接口！')
                                if (isAsync == 0) {
                                    errorHelper.error500(req, res);
                                } else {
                                    errorHelper.async.resFailed(res);
                                }
                            }
                        }
                        catch (e) {
                            if (isAsync == 0) {
                                errorHelper.error500(req, res);
                            } else {
                                errorHelper.async.resFailed(res);
                            }
                        }
                    }
                    else {
                        // throw new Error('无数据');
                        if (isAsync == 0) {
                            errorHelper.error400(req, res);
                        } else {
                            errorHelper.async.reqFailed(res);
                        }
                    }
                });
        })
    },
    // 文艺、文化、科普期刊
    period: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            // var qkMark = req.query.qkMark || null;
            var qkMark = /^[a-zA-Z0-9]+$/.test(req.query.qkMark) && req.query.qkMark != undefined ? req.query.qkMark : null;
            // var qkMark = req.query.qkMark || null;
            var magaName = req.query.magaName || null;
            var issn = req.query.issn || null;
            var cn = req.query.cn || null;
            var cbd = req.query.cbd || null;
            var organizers = req.query.organizers || null;
            var orderby = req.query.orderby || 1; // 排序 0：相关度1：更新时间
            var pageNum = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 20;
            var dbCode = req.query.dbCode || 'U;V;T';
            var isAsync = req.query.isAsync || 0;
            var periodStaticData = libraryStaticData.period;
            var qkName = req.query.qkName || null;
            var libraryType = '';
            var isPeriodSearch = req.query.isPeriodSearch || 0; // 0 期刊页  1 单库期刊高级搜索
            var ArgsList = {
                magaName: '刊名',
                issn: 'ISSN',
                cn: 'CN',
                cbd: '出版地',
                organizers: '出版单位'
            };
            var pageTitle = '';

            if (isPeriodSearch == 1) {
                //------------------------------------------------------------------------
                // 期刊 高级搜索 搜索词组
                var searchWordsStr = '';
                var newQuery = {};

                delete req.query.isAdvancedSearch;
                delete req.query.orderby;
                delete req.query.pageSize;
                delete req.query.isPeriodSearch;
                delete req.query.dbCode;

                newQuery = req.query;

                //高级搜索 多个字段组合
                var queryStr = '';
                for (let obj in newQuery) {
                    queryStr += '&' + obj + '=' + newQuery[obj];
                }
                queryStr = queryStr.substring(1);

                for (var item in newQuery) {
                    searchWordsStr += ArgsList[item] + ':' + newQuery[item] + '; ';
                }
                searchWordsStr = searchWordsStr.replace(',', '-'); // 处理时间 如1915-2019
            }

            if (dbCode == 'V') {
                libraryType = 'cjfvtotal';
                pageTitle = '文艺库';
            } else if (dbCode == 'U') {
                libraryType = 'cjfutotal';
                pageTitle = '文化库';
            } else if (dbCode == 'T') {
                libraryType = 'cjfttotal';
                pageTitle = '科普库';
            }
            var formData = {
                appid: 'web',
                code: 'GetMagaInfoList',
                qkmark: qkMark,
                maganame: magaName,
                issn: issn,
                cn: cn,
                cbd: cbd,
                organizers: organizers,
                orderby: orderby,
                pageindex: pageNum,
                pagesize: pageSize,
                dbcode: dbCode
            };
            console.log('期刊参数：', formData)

            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            console.log('期刊：', resData.data);

                            if (resData.code == 0) {
                                if (isAsync == 0) {
                                    viewModel.pageStr = pagerHelper(resData.data.totalcount, 25, 5, pageNum);
                                    viewModel.prevNextPage = prevNextPagerHelper(resData.data.totalcount, 25, 5, pageNum);
                                    viewModel.data = resData.data;
                                    viewModel.periodStaticData = periodStaticData;
                                    viewModel.dbCode = dbCode;
                                    viewModel.qkMark = qkMark;
                                    viewModel.qkName = qkName;
                                    viewModel.libraryType = libraryType;
                                    viewModel.libraryStaticData = libraryStaticData;
                                    viewModel.queryStr = queryStr;
                                    viewModel.searchWordsStr = searchWordsStr;
                                    viewModel.pageNum = pageNum;
                                    viewModel.magaName = magaName;
                                    viewModel.searchWordValue = magaName;
                                    console.log(viewModel.data.magalist);
                                    if (isPeriodSearch == 0) {
                                        res.render('literature/periodView', {
                                            viewModel: viewModel,
                                            title: pageTitle + '_知网文化'
                                        });
                                    } else {
                                        res.render('literature/libraryPeriodResultView', {
                                            viewModel: viewModel,
                                            title: '文献搜索_知网文化'
                                        });
                                    }

                                } else {
                                    res.json(resData);
                                }
                            }
                            else {
                                // console.log('请检查获取期刊信息列表接口！');
                                // res.status(400);
                                // res.send('参数错误');
                                errorHelper.error500(req, res);
                            }
                        }
                        catch (e) {
                            errorHelper.error500(req, res);
                        }
                    }
                    else {
                        errorHelper.error400(req, res);
                    }
                });
        })
    },
    //异步 获取相似文献
    getSimilarLiterature: function (req, res, next) {
        // var filename = req.query.filename;
        var filename = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(req.query.filename) ? req.query.filename : null;
        // var dbname = req.query.dbname || 'cjtutotal,cjtvtotal,cjfttotal';

        var formData = {
            appid: 'web',
            code: 'GetSimilarArticlesList',
            filename: filename,
            count: 10
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        // console.log(data)
                        if (data.code == 0) {
                            res.json(data);
                        } else {
                            // res.json('请检查相似文献接口！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 获取文献图片
    getLiteraturePics: function (req, res, next) {

        var filename = /^[0-9a-zA-Z]*$/g.test(req.query.filename) ? req.query.filename : ''; // 字母和数字

        var formData = {
            fn: filename,
            db: 'CJFD',
            s: 0,
            type: 'XML'
        };
        console.log('获取文献图片参数:', formData);
        request.post({
                url: 'https://bianke.cnki.net/api/WebApi/GetArticleImgsByFn',
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        console.log('获取文献图片结果:', body);
                        var data = JSON.parse(body);

                        if (data.Code == 1) {
                            res.json(data);
                        } else {
                            res.json('请检查文献图片接口！');
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 获取非学术库文章和期刊总数
    getArticleAndMagaCount: function (req, res, next) {

        var dbCode = req.query.dbCode;

        var formData = {
            code: 'GetArticleAndMagaCount',
            appid: 'web',
            dbcode: dbCode
        };

        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        // console.log(data)
                        if (data.code == 0) {
                            res.json(data);
                        } else {
                            res.json('请检查获取非学术库文章和期刊总数接口！');
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 获取往期期刊
    getPastPeriod: function (req, res, next) {

        var thname = req.query.thName;

        var formData = {
            code: 'GetMagaPastPeriodList',
            appid: 'web',
            thname: thname
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var data = JSON.parse(body);
                        console.log('最新刊期：', data.data);
                        if (data.code == 0) {
                            res.json(data.data);
                        } else {
                            // res.json('请检查获取往期期刊接口！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 获取文献库推荐期刊数据 好刊推荐
    getRecommendPeriod: function (req, res, next) {

        var pageindex = req.query.pageIndex || 1;
        var pagesize = req.query.pageSize || 6;
        // var searchday = req.query.searchDay || 1;
        var typeid = req.query.typeId;

        var formData = {
            pageindex: pageindex,
            pagesize: pagesize,
            code: 'GetSysIndexSelectedTableList',
            appid: 'web',
            // searchday: searchday,
            typeid: typeid
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        // console.log(resData.data)
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查获取文献库推荐期刊数据！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 获取首页作品分页列表（只提推荐作品）大家都在看
    getRecommendWorks: function (req, res, next) {

        var offset = req.query.offset || 0;
        var limit = req.query.limit || 5;
        var sort = req.query.sort || 'id';
        var mediatype = req.query.mediatype || -1;

        var formData = {
            offset: offset,
            limit: limit,
            sort: sort,
            order: 'desc',
            code: 'GetCollectionList',
            appid: 'web',
            categorycode: '',
            mediatype: mediatype,
            isboutique: 1
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        // console.log(resData)
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            // res.json('请检查获取首页作品分页列表（只提推荐作品）！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 相关作品
    getRelatedWorks: function (req, res, next) {

        var offset = req.query.offset || 0;
        var limit = req.query.limit || 3;
        var sort = req.query.sort || 'id';
        var searchTitle = req.query.searchTitle || '';

        var formData = {
            offset: offset,
            limit: limit,
            sort: sort, // 	排除方式 默认id,viewcount 热门
            order: 'desc',
            code: 'GetSearchRelevantCollection',
            appid: 'web',
            // username: '',
            searchtitle: searchTitle
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        // console.log(JSON.parse(resData.collectionlist))
                        if (resData.code == 0) {
                            res.json(JSON.parse(resData.collectionlist));
                        } else {
                            // res.json('请检查获取文献库搜索右侧相关作品列表 ！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    // throw new Error('无数据');
                    errorHelper.async.reqFailed(res);
                }
            });
    },
    //异步 文献库检索页，精选微刊列表
    getSearchRelevantMicroBook: function (req, res, next) {

        var keyword = req.query.kd || null;
        var limit = req.query.limit || 3;

        var formData = {
            limit: limit,
            code: 'GetSearchRelevantMicroBook',
            appid: 'web',
            keyword: keyword
        };
        // console.log('精选微刊参数：', formData);
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    try {
                        var resData = JSON.parse(body);
                        console.log('精选微刊返回：', resData.data);
                        if (resData.code == 0) {
                            res.json(resData.data.list);
                        } else {
                            // res.json('请检查文献库检索页，相关微刊列表接口 ！');
                            errorHelper.async.resFailed(res);
                        }
                    } catch (e) {
                        errorHelper.async.resFailed(res);
                    }

                } else {
                    errorHelper.async.reqFailed(res);
                    // throw new Error('无数据');
                }
            });
    },

    // 异步 判断下载权限
    // 1、（无需判断账号类型）判断是否为文艺文化科普库文献，且是否为2013年以前的
    // （是，跳转免费下载中转页，免费下；否，往下执行）
    // 2、PC，判断是否为机构账号，
    // ① 是机构账号，有权限，直接免费下
    // ② 是机构账号，无权限，弹框提示：“贵单位没有订购该产品，请您与贵单位管理员联系订购；或退出当前机构账号，登录个人账号使用。”
    // 3、PC，个人账号，判断是否为会员，且是否超出了下载限制
    // ① 是会员，且没超出下载限制，直接免费下
    // ② 非会员，或者会员超出下载限制，跳转付费页面，付费下载
    getDownloadRight(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let userIp = getClientIp(req);
            // 未登录
            if (viewModel.user.name == null) {
                errorHelper.async.reqFailed(res, '用户未登录', {}, -1);
            }
            // 已登录
            else {
                let filename = req.query.fn;
                let isOrg = viewModel.user.isOrg;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let title = req.query.t;
                // 非机构用户
                if (isOrg == false) {
                    async.parallel([
                        // 获取文献价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '1',
                                "code": filename,
                                "ordertype": 0,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                                "ip": userIp
                            };
                            console.log('文献详情页-获取文献价格参数:', formData);
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
                                    console.log('文献详情页-获取文献价格返回:', body)
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
                        // 文献下载链接
                        function (cb) {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: title,
                                ftype: 'pdf'
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        try {
                                            let resData = JSON.parse(body);
                                            console.log('文献下载地址返回：', resData);
                                            cb(null, resData);
                                        } catch (e) {
                                            cb(null, null);
                                        }

                                    } else {
                                        // throw err;
                                        cb(null, null);
                                    }
                                });
                        },
                    ], function (err, results) {
                        if (err) {
                            errorHelper.async.resFailed(res, '获取文献价格或获取文件下载链接失败', {}, 0);
                        }
                        else {
                            if (results[0] && results[1]) {
                                try {
                                    // 已购107 会员免费 已有权限102 已确认 errorCode=1
                                    if (results[0].ErrorCode == 102 || results[0].ErrorCode == 107) {
                                        // 直接返回下载链接
                                        if (results[1].code == 0) {
                                            res.json({
                                                errorCode: 1,
                                                errorMessage: '已有权限',
                                                data: {
                                                    downloadUrl: results[1].data.downloadurl
                                                }
                                            })
                                        }
                                        else {
                                            errorHelper.async.resFailed(res, '未获取到下载链接', {}, 0);
                                        }
                                    }
                                    // 2013年以前 余额不足 余额充足 跳转到下载中转页面
                                    else if (results[0].ErrorCode == 1001 || results[0].ErrorCode == 104 || results[0].ErrorCode == 105) {
                                        res.json({
                                            errorCode: 4,
                                            errorMessage: '已经有权限，为2013年之前的文献'
                                        })
                                    }
                                    // 2013年以前 或超过下载量 跳转到下载中转页面
                                    else {
                                        res.json({
                                            errorCode: 0,
                                            errorMessage: results[0].ErrorMessage
                                        })
                                    }
                                }
                                catch (e) {
                                    errorHelper.async.resFailed(res, '数据转化错误', {}, 0);
                                }
                            }
                            else {
                                errorHelper.async.resFailed(res, '文献价格或者下载链接返回为空', {}, 0);
                            }
                        }

                    });
                }
                // 机构用户
                else {
                    async.parallel([
                        // 机构包库权限
                        function (cb) {
                            let signature = jsEncryptHelper.encrypt(req.session.uid);
                            let formData = {
                                "signature": signature,
                                "username": viewModel.user.name
                            };
                            // console.log('获取机构用户包库权限参数', formData)
                            request({
                                    url: webConfig.paymentAddr + '/institutionrignt.do',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    json: true,
                                    body: formData,
                                    method: 'post'
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        cb(null, body);
                                    }
                                    else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 获取文献价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '1',
                                "code": filename,
                                "ordertype": 0,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                                "ip": userIp
                            };
                            // console.log('文献详情页-获取文献价格参数:', formData);
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
                                        cb(null, body);
                                    }
                                    else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 文献下载链接
                        function (cb) {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: 'literatureDownload',
                                ftype: 'pdf'
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
                            errorHelper.async.resFailed(res, '获取机构权限或文献价格或下载链接失败', {}, 0)
                        }
                        else {
                            if (results[0] && results[1] && results[2]) {
                                try {
                                    let resData = results[0];
                                    let resData1 = results[1];
                                    let resData2 = JSON.parse(results[2]);
                                    console.log('机构权限：', resData);
                                    console.log('文献价格：', resData1);
                                    console.log('下载链接：', resData2);
                                    // 机构已包库
                                    if (resData1.ErrorCode == 102 || resData1.ErrorCode == 107) {
                                        // 直接返回下载链接
                                        if (resData2.code == 0) {
                                            res.json({
                                                errorCode: 1,
                                                errorMessage: '已有权限',
                                                data: {
                                                    downloadUrl: resData2.data.downloadurl
                                                }
                                            })
                                        }
                                        else {
                                            errorHelper.async.resFailed(res, '未获取到下载链接', {}, 0);
                                        }
                                    }
                                    // 2013年以前 跳转到免费下载中转页面
                                    else if (resData1.ErrorCode == 1001) {
                                        res.json({
                                            errorCode: 4,
                                            errorMessage: '已经有权限，为2013年之前的文献'
                                        })
                                    }
                                    // 文件涉密
                                    else if (resData1.ErrorCode == 401) {
                                        res.json({
                                            errorCode: 3,
                                            errorMessage: '贵单位没有订购该产品，请您与贵单位管理员联系订购；或退出当前机构账号，登录个人账号使用。'
                                        })
                                    }
                                    // 提示没有权限
                                    else {
                                        res.json({
                                            errorCode: 3,
                                            errorMessage: resData1.ErrorMessage
                                        })
                                    }
                                }
                                catch (e) {
                                    errorHelper.async.resFailed(res, '机构权限查询或价格获取或下载链接获取失败', {}, 0);
                                }
                            }
                            else {
                                errorHelper.async.resFailed(res, '机构权限查询或价格获取或下载链接获取数据为空', {}, 0);
                            }
                        }

                    });
                }
            }

        });


    },
    orgRightCheck(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            console.log('已成功')
            let userIp = getClientIp(req);
            // 未登录
            if (viewModel.user.name == null) {
                errorHelper.async.reqFailed(res, '用户未登录', {}, -1);
            }
            // 已登录
            else {
                let filename = req.query.fn;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let title = req.query.t;

                if (true) {
                    async.parallel([
                        // 获取文献价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '1',
                                "code": filename,
                                "ordertype": 0,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                                "ip": userIp
                            };
                            console.log('文献详情页-获取文献价格参数:', formData);
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
                                    console.log('文献详情页-获取文献价格返回:', body)
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
                        // 文献下载链接
                        function (cb) {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: title,
                                ftype: 'pdf'
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        try {
                                            let resData = JSON.parse(body);
                                            console.log('文献下载地址返回：', resData);
                                            cb(null, resData);
                                        } catch (e) {
                                            cb(null, null);
                                        }

                                    } else {
                                        // throw err;
                                        cb(null, null);
                                    }
                                });
                        },
                    ], function (err, results) {
                        if (err) {
                            errorHelper.async.resFailed(res, '获取文献价格或获取文件下载链接失败', {}, 0);
                        }
                        else {
                            if (results[0] && results[1]) {
                                try {
                                    // 已购107 会员免费 已有权限102 已确认 errorCode=1
                                    if (results[0].ErrorCode == 102 || results[0].ErrorCode == 107) {
                                        // 直接返回下载链接
                                        if (results[1].code == 0) {
                                            res.json({
                                                errorCode: 1,
                                                errorMessage: '已有权限',
                                                data: {
                                                    downloadUrl: results[1].data.downloadurl
                                                }
                                            })
                                        }
                                        else {
                                            errorHelper.async.resFailed(res, '未获取到下载链接', {}, 0);
                                        }
                                    }
                                    // 2013年以前 余额不足 余额充足 跳转到下载中转页面
                                    else if (results[0].ErrorCode == 1001 || results[0].ErrorCode == 104 || results[0].ErrorCode == 105) {
                                        res.json({
                                            errorCode: 4,
                                            errorMessage: '已经有权限，为2013年之前的文献'
                                        })
                                    }
                                    // 2013年以前 或超过下载量 跳转到下载中转页面
                                    else {
                                        res.json({
                                            errorCode: 0,
                                            errorMessage: results[0].ErrorMessage
                                        })
                                    }
                                }
                                catch (e) {
                                    errorHelper.async.resFailed(res, '数据转化错误', {}, 0);
                                }
                            }
                            else {
                                errorHelper.async.resFailed(res, '文献价格或者下载链接返回为空', {}, 0);
                            }
                        }

                    });
                }
                // 机构用户
                else {
                    async.parallel([
                        // 机构包库权限
                        function (cb) {
                            let signature = jsEncryptHelper.encrypt(req.session.uid);
                            let formData = {
                                "signature": signature,
                                "username": viewModel.user.name
                            };
                            // console.log('获取机构用户包库权限参数', formData)
                            request({
                                    url: webConfig.paymentAddr + '/institutionrignt.do',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    json: true,
                                    body: formData,
                                    method: 'post'
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        cb(null, body);
                                    }
                                    else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 获取文献价格
                        function (cb) {
                            let formData = {
                                "signature": signature,
                                "channel": '1',
                                "code": filename,
                                "ordertype": 0,
                                "openid": req.session.openId,
                                "action": "check",
                                "identifier": appId,
                                "secret": secret,
                                "ip": userIp
                            };
                            // console.log('文献详情页-获取文献价格参数:', formData);
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
                                        cb(null, body);
                                    }
                                    else {
                                        cb(null, null);
                                    }
                                });
                        },
                        // 文献下载链接
                        function (cb) {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: 'literatureDownload',
                                ftype: 'pdf'
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
                            errorHelper.async.resFailed(res, '获取机构权限或文献价格或下载链接失败', {}, 0)
                        }
                        else {
                            if (results[0] && results[1] && results[2]) {
                                try {
                                    let resData = results[0];
                                    let resData1 = results[1];
                                    let resData2 = JSON.parse(results[2]);
                                    console.log('机构权限：', resData);
                                    console.log('文献价格：', resData1);
                                    console.log('下载链接：', resData2);
                                    // 机构已包库
                                    if (resData1.ErrorCode == 102 || resData1.ErrorCode == 107) {
                                        // 直接返回下载链接
                                        if (resData2.code == 0) {
                                            res.json({
                                                errorCode: 1,
                                                errorMessage: '已有权限',
                                                data: {
                                                    downloadUrl: resData2.data.downloadurl
                                                }
                                            })
                                        }
                                        else {
                                            errorHelper.async.resFailed(res, '未获取到下载链接', {}, 0);
                                        }
                                    }
                                    // 2013年以前 跳转到免费下载中转页面
                                    else if (resData1.ErrorCode == 1001) {
                                        res.json({
                                            errorCode: 4,
                                            errorMessage: '已经有权限，为2013年之前的文献'
                                        })
                                    }
                                    // 文件涉密
                                    else if (resData1.ErrorCode == 401) {
                                        res.json({
                                            errorCode: 3,
                                            errorMessage: '贵单位没有订购该产品，请您与贵单位管理员联系订购；或退出当前机构账号，登录个人账号使用。'
                                        })
                                    }
                                    // 提示没有权限
                                    else {
                                        res.json({
                                            errorCode: 3,
                                            errorMessage: resData1.ErrorMessage
                                        })
                                    }
                                }
                                catch (e) {
                                    errorHelper.async.resFailed(res, '机构权限查询或价格获取或下载链接获取失败', {}, 0);
                                }
                            }
                            else {
                                errorHelper.async.resFailed(res, '机构权限查询或价格获取或下载链接获取数据为空', {}, 0);
                            }
                        }

                    });
                }
            }

        });


    }
};