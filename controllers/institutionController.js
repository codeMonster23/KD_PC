var cookieFilter = require('../filters/cookieFilter');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var worksCategory = require('../data/category');
var errorHelper = require('../helpers/errorHelper');
var url = webConfig.serverAddr;
const redirectHelper = require('../helpers/redirectHelper');

module.exports = {
    // 同步 机构首页
    home: function(req, res, next) {
        var institutionid = req.params.institutionid;
        cookieFilter(req, res, function(viewModel) {
            async.parallel([
                // 机构基本信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetInstitutionBaseInfo',
                        institutionid: institutionid
                    };
                    console.log(formData);
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 机构作品
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetInstitutionCollectionList',
                        institutionid: institutionid,
                        limit: 9,
                        offset: 0,
                        isboutique: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 机构万选号
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetInstitutuinOrgList',
                        institutionid: institutionid,
                        limit: 7,
                        offset: 0,
                        isboutique: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 首页数据
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'getInstitutionIndexSelectedData'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 文艺库精彩好文
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendArticle',
                        ztcode: '',
                        dbname: 'cjfvtotal',
                        pageindex: 1,
                        pagesize: 7,
                        orderby: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 文化库精彩好文
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendArticle',
                        ztcode: '',
                        dbname: 'cjfutotal',
                        pageindex: 1,
                        pagesize: 7,
                        orderby: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 科普库精彩好文
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendArticle',
                        ztcode: '',
                        dbname: 'cjfttotal',
                        pageindex: 1,
                        pagesize: 7,
                        orderby: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 文艺库最新期刊
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetMagaInfoList',
                        qkmark: '',
                        maganame: '',
                        issn: '',
                        cn: '',
                        cbd: '',
                        organizers: '',
                        orderby: 1,
                        pageindex: 1,
                        pagesize: 4,
                        dbcode: 'V'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 文化库最新期刊
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetMagaInfoList',
                        qkmark: '',
                        maganame: '',
                        issn: '',
                        cn: '',
                        cbd: '',
                        organizers: '',
                        orderby: 1,
                        pageindex: 1,
                        pagesize: 4,
                        dbcode: 'U'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 科普库最新期刊
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetMagaInfoList',
                        qkmark: '',
                        maganame: '',
                        issn: '',
                        cn: '',
                        cbd: '',
                        organizers: '',
                        orderby: 1,
                        pageindex: 1,
                        pagesize: 4,
                        dbcode: 'T'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
            ], function(err, results) {
                if (err) {
                    // throw err;
                    errorHelper.error500(req, res);
                }else {
                    if (results[0] && results[1] && results[2] && results[3] && results[4] && results[5] && results[6] && results[7] && results[8] && results[9]) {
                        viewModel.data = {
                            orgBaseInfo: JSON.parse(results[0]).data,
                            worksList: JSON.parse(results[1]).data,
                            kdhList: JSON.parse(results[2]).data,
                            orgIndexData: JSON.parse(results[3]).data,
                            VNRecommendArticle: JSON.parse(results[4]).data,
                            UNRecommendArticle: JSON.parse(results[5]).data,
                            TNRecommendArticle: JSON.parse(results[6]).data,
                            VNLastedPeriod: JSON.parse(results[7]).data,
                            UNLastedPeriod: JSON.parse(results[8]).data,
                            TNLastedPeriod: JSON.parse(results[9]).data,
                            institutionid: institutionid
                        };
                        res.render('org/homeView', { title: '机构首页', viewModel: viewModel });
                    } else {
                        errorHelper.error500(req, res);
                    }
                }

            });
        })
    },
    // 同步 机构微刊页    
    microBook: function(req, res, next) {
        var institutionid = req.params.institutionid;
        var pageNum = req.query.pageNum || 1;
        var sort = req.query.sort || 'updatetime';
        var displayNum = 8; // 一页显示的数量
        var limit = req.query.limit || 8;
        cookieFilter(req, res, function(viewModel) {
            async.parallel([
                // 机构基本信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetInstitutionBaseInfo',
                        institutionid: institutionid
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 微刊页数据
                function(cb) {
                    var formData = {
                        offset: (pageNum - 1) * displayNum,
                        limit: limit,
                        sort: sort, // id最新, viewcount最热
                        code: 'GetInstitutionAndFreeMicroBookList',
                        institutionid: institutionid,
                        appid: 'web'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },

            ], function(err, results) {
                if (results[0] && results[1]) {
                    var pageStr = pagerHelper(JSON.parse(results[1]).data.microbooklist.total, displayNum, 5, pageNum);
                    viewModel.data = {
                        orgBaseInfo: JSON.parse(results[0]).data,
                        microBooks: JSON.parse(results[1]).data.microbooklist.list,
                        pageStr: pageStr,
                        institutionid: institutionid
                    };

                    res.render('org/microBookView', {
                        title: '机构微刊',
                        viewModel: viewModel,
                        serverAddr: webConfig.serverAddr,
                        sort: sort,
                    });
                } else {
                    errorHelper.error500(req, res);
                }
            });
        })
    },
    // 同步 机构作品页        
    works: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var institutionid = req.params.institutionid;
            viewModel.category = worksCategory;
            var sort = req.query.sort || 'updatetime';
            var mediatype = req.query.mediatype || -1;
            var classifyId = req.query.classifyId || null; // 分类
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * 7;
            var positionX = req.query.positionX || -1; // positionX、positionY、positionZ为菜单显示位置
            var positionY = req.query.positionY || -1;
            var positionZ = req.query.positionZ || -1;
            async.parallel([
                // 机构基本信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetInstitutionBaseInfo',
                        institutionid: institutionid
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },
                // 作品
                function(cb) {
                    var formData = {
                        offset: offset,
                        limit: 7,
                        sort: sort,
                        order: 'desc',
                        code: 'GetInstitutionAndFreeCollectionList',
                        appid: 'web',
                        id: institutionid,
                        categorycode: classifyId,
                        mediatype: mediatype
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, body);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                },

            ], function(err, results) {
                if (results[0] && results[1]) {
                    // 作品数据
                    var worksData = JSON.parse(results[1]).data.collectionlist;

                    // 页码
                    var worksPageStr = pagerHelper(worksData.total, 7, 5, pageNum);

                    // 菜单位置
                    viewModel.menuPosition = {
                        x: positionX,
                        y: positionY,
                        z: positionZ
                    };

                    // 通过position获取菜单名字
                    var navName = {
                        XName: 0,
                        YName: 0
                    };
                    if (positionX >= 0) {
                        navName.XName = worksCategory[positionX].name;
                        if (positionY >= 0) {
                            navName.YName = worksCategory[positionX].childlist[positionY].name;
                        }
                    }

                    // 生成三级菜单
                    viewModel.thirdList = [];
                    if (positionX >= 0 && positionY >= 0) {
                        var thirdList = worksCategory[positionX].childlist[positionY].childlist; // 三级菜单列表
                        if (thirdList.length > 0) {
                            for (var i = 0; i < thirdList.length; i++) {
                                var obj = { val: thirdList[i].name, code: thirdList[i].code };
                                viewModel.thirdList.push(obj);
                            }
                            // 添加数组项 主题 全部
                            viewModel.thirdList.unshift({ val: '全部', code: thirdList[0].code.substring(0, 3) });
                            viewModel.thirdList.unshift({ val: '主题', code: thirdList[0].code.substring(0, 3) });
                        }
                    }
                    // mediatype对象数组
                    viewModel.mediatypeList = [{ val: '类型', code: -1 }, { val: '全部', code: -1 }, {
                        val: '图文',
                        code: 1
                    }, { val: '音频', code: 2 }, { val: '视频', code: 3 }, { val: '图集', code: 4 }];

                    viewModel.navName = navName;
                    viewModel.data = {
                        orgBaseInfo: JSON.parse(results[0]).data,
                        works: worksData,
                        classifyId: classifyId,
                        mediatype: parseInt(mediatype),
                        sort: sort,
                        worksPageStr: worksPageStr,
                        institutionid: institutionid
                    };
                    res.render('org/worksView', { title: '机构作品', viewModel: viewModel });
                } else {
                    errorHelper.error500(req, res);
                }
            });

        })
    }
};