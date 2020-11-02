const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const pagerHelper = require('../helpers/pagerHelper');
const worksCategory = require('../data/category');
const url = webConfig.serverAddr;
const errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');

module.exports = {
    home: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'GetSysIndexSelectedData',
            };
            console.log(req.url)
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            let resData = JSON.parse(body);
                            // console.log('首页数据',resData.data);
                            if (resData.code == 0) {
                                viewModel.data = resData.data;
                                res.render('homeView', { title: '知网文化 - 精致你的时光', viewModel: viewModel });
                            } else {
                                // res.json(resData);
                                errorHelper.error500(req, res);
                            }
                        } catch (e) {
                            errorHelper.error500(req, res);
                        }
                    } else {
                        // throw err;
                        // errorHelper.error400(req, res);
                        redirectHelper(res, '/literature' + req.url);
                    }
                });
        })
    },
    newhome: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('newhomeView', { title: '知网文化 - 精致你的时光', viewModel: viewModel });
        })
    },
    getHomeData: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getSysIndexForPC'
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
                            // res.json('请检查pc首页！');
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
    discovery: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            async.parallel([
                // 作品推荐
                function(cb) {
                    var formData = {
                        offset: 0,
                        limit: 15,
                        sort: 'id',
                        order: 'desc',
                        code: 'GetCollectionList',
                        appid: 'web',
                        username: viewModel.user.name,
                        categorycode: '',
                        mediatype: -1,
                        isboutique: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                // throw err;
                                cb(null, null);
                            }
                        });
                },
                // 微刊精选
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendMircBookByMicBookId',
                        id: 6
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                // throw err;
                                cb(null, null);
                            }
                        });
                },
                // 万选号
                function(cb) {
                    var formData = {
                        username: 'wsk10073',
                        appid: 'web',
                        code: 'GetOrgList',
                        keyword: '',
                        offset: 0,
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                var organizationList = JSON.parse(body).data.rows;
                                organizationList.sort(function(obj1, obj2) {
                                    var num1 = obj1.collectioncount;
                                    var num2 = obj2.collectioncount;
                                    if (num1 > num2) {
                                        return -1;
                                    } else if (num1 == num2) {
                                        return 0;
                                    } else {
                                        return 1;
                                    }
                                });
                                cb(null, organizationList);
                            } else {
                                // throw err;
                                cb(null, null);
                            }
                        });
                }
            ], function(err, results) {
                if (err) {
                    // throw err;
                    errorHelper.error500(req, res);
                }else {
                    if (results[0] && results[1] && results[2]) {
                        try {
                            viewModel.data = {
                                selectedWorks: JSON.parse(results[0]).data.collectionlist.collectionlist,
                                microBooks: JSON.parse(results[1]).data.mircbooklist,
                                organizationList: results[2]
                            };
                            // console.log(viewModel.data.microBooks)
                            res.render('discoveryView', { title: '发现', viewModel: viewModel });
                        } catch (e) {
                            errorHelper.error500(req, res);
                        }
                    } else {
                        errorHelper.error500(req, res);
                    }
                }

            });
        })
    },

    //异步 发现 加载更多作品
    discoveryMore: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            let categorycode = req.body.categorycode || '';
            let mediatype = req.body.mediatype || -1;
            let offset = req.body.offset || 0;
            let limit = req.body.count || 10;
            let isBoutique = req.body.isBoutique || 1;
            let sort = req.body.sort || 'id';
            let formData = {
                offset: offset,
                limit: limit,
                sort: sort,
                order: 'desc',
                code: 'GetCollectionList',
                appid: 'web',
                username: viewModel.user.name,
                categorycode: categorycode,
                mediatype: mediatype,
                isboutique: isBoutique
            };
            console.log('发现、加载更多作品参数', formData);
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            console.log('发现 加载更多作品', JSON.parse(body))
                            let resData = JSON.parse(body);
                            if (resData.code == 0) {
                                res.json({ list: resData.data.collectionlist.collectionlist });
                            } else {
                                // res.json({
                                //     errorCode: -1,
                                //     errorMessage: '失败'
                                // })
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
        });

    },
    // 微刊页 异步获取关联微刊
    microBook: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            // let pageNum = req.query.pageNum || 1;
            let pageNum = Number.parseInt(req.query.pageNum);
            pageNum = Number.isSafeInteger(pageNum) && pageNum > 0 ? pageNum : 1;
            let sort = req.query.sort == 'viewcount' ? 'viewcount' : 'id'; // viewcount or id
            let displayNum = 8; // 一页显示的数量
            let limit = req.query.limit || 8;
            let keyword = req.query.kd || null;
            let isAsync = req.query.async || false; // 判断是否异步
            let isBoutique = req.query.isBoutique || 0;
            let categoryCode = req.query.categoryCode || '';
            let categoryName = '';
            switch (categoryCode) {
                case '':
                    categoryName = '全部';
                    break;
                case 'A':
                    categoryName = '文学';
                    break;
                case 'B':
                    categoryName = '艺术';
                    break;
                case 'C':
                    categoryName = '人文历史';
                    break;
                case 'D':
                    categoryName = '思想文化';
                    break;
                case 'E':
                    categoryName = '成功励志';
                    break;
                case 'F':
                    categoryName = '生活休闲';
                    break;
                case 'G':
                    categoryName = '健康养生';
                    break;
                case 'H':
                    categoryName = '校园/职场';
                    break;
                case 'I':
                    categoryName = '财富创业';
                    break;
                case 'J':
                    categoryName = '孕产育儿';
                    break;
                case 'K':
                    categoryName = '常识科普';
                    break;
                case 'L':
                    categoryName = 'IT互联网';
                    break;
                case 'M':
                    categoryName = '政法军事';
                    break;
            }

            let formData = {
                offset: (pageNum - 1) * displayNum,
                limit: limit,
                sort: sort, // id最新, viewcount最热
                order: 'desc',
                code: 'GetMircBookList',
                appid: 'web',
                keyword: keyword,
                isboutique: isBoutique,
                categorycode: categoryCode
            };
            console.log('微刊页参数', formData)
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            var resData = JSON.parse(body);
                            console.log('微刊页数据：', resData.data)
                            if (resData.code == 0) {
                                var pageStr = pagerHelper(resData.data.total, displayNum, 5, pageNum);
                                viewModel.data = {
                                    microBooks: resData.data.rows,
                                    pageStr: pageStr
                                };
                                if (isAsync) {
                                    res.json(resData.data);
                                } else {
                                    res.render('microBookView', {
                                        title: '微刊_知网文化',
                                        viewModel: viewModel,
                                        serverAddr: webConfig.serverAddr,
                                        sort: sort,
                                        categoryCode: categoryCode,
                                        categoryName: categoryName
                                    });
                                }
                            } else {
                                // console.log('请检查获取微刊分页列表接口！');
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
    works: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            viewModel.category = worksCategory;
            var sort = req.query.sort === 'viewcount' ? 'viewcount' : 'id';
            // var mediatype = req.query.mediatype || -1;
            var mediatype = (req.query.mediatype >= -1 && req.query.mediatype <= 4) ? req.query.mediatype : -1;
            var classifyId = req.query.classifyId || null; // 分类
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * 7;
            // positionX、positionY、positionZ为菜单显示位置
            var positionX = req.query.positionX || -1;
            var positionY = req.query.positionY || -1;
            var positionZ = req.query.positionZ || -1;

            async.parallel([
                // 作品
                function(cb) {
                    var formData = {
                        offset: offset,
                        limit: 7,
                        sort: sort,
                        order: 'desc',
                        code: 'GetCollectionList',
                        appid: 'web',
                        username: viewModel.user.name,
                        categorycode: classifyId,
                        mediatype: mediatype
                    };
                    console.log('作品参数：', formData);
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, JSON.parse(body));
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                // throw err;
                                cb(null, null);
                            }
                        });
                },
                // 微刊 轮播图
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendMircBookByCollectionPlatformCateId',
                        limit: 5,
                        platformCateId: classifyId ? classifyId.substring(0, 1) : null
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    cb(null, JSON.parse(body).data.list);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                // throw err;
                                cb(null, null);
                            }
                        });
                },
                // 万选号
                function(cb) {
                    var formData = {
                        limit: 3,
                        platformCateId: classifyId ? classifyId.substring(0, 1) : '',
                        code: 'GetRecommendOrgByCollectionPlatformCateId',
                        appid: 'web'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    var organizationList = JSON.parse(body).data.list;
                                    cb(null, organizationList);
                                } catch (e) {
                                    cb(null, null);
                                }
                            } else {
                                cb(null, null);
                            }
                        });
                }
            ], function(err, results) {
                if (err) {
                    // throw err;
                    // errorHelper.error500(req, res);
                    redirectHelper(res, req.url);
                }
                else{
                    if (results[0] && results[1] && results[2]) {
                        try {
                            // 作品数据
                            console.log('作品：', results[0]);
                            var worksData = results[0].data.collectionlist;

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
                                works: worksData,
                                worksPageStr: worksPageStr,
                                microBooks: results[1],
                                organizationList: results[2],
                                classifyId: classifyId,
                                mediatype: parseInt(mediatype),
                                sort: sort
                            };
                            // console.log(viewModel.data)
                            var pageTitle = '';
                            if (viewModel.navName.XName != 0) {
                                if (viewModel.navName.YName != 0) {
                                    pageTitle = viewModel.navName.YName + '-' + viewModel.navName.XName + '_知网文化';
                                } else {
                                    pageTitle = viewModel.navName.XName + '_知网文化';
                                }
                            } else {
                                pageTitle = '全部作品_知网文化';
                            }
                            // switch (parseInt(mediatype)) {
                            //     case 1:
                            //         pageTitle = '图文作品_知网文化';
                            //         break;
                            //     case 2:
                            //         pageTitle = '音频作品_知网文化';
                            //         break;
                            //     case 3:
                            //         pageTitle = '视频作品_知网文化';
                            //         break;
                            //     case 4:
                            //         pageTitle = '图集作品_知网文化';
                            //         break;
                            //     default:
                            //         pageTitle = '全部作品';
                            // }

                            // console.log(viewModel.data.microBooks)
                            res.render('worksView', {
                                title: pageTitle,
                                viewModel: viewModel,
                                serverAddr: webConfig.serverAddr
                            });
                        } catch (e) {
                            errorHelper.error500(req, res);
                        }
                    } else {
                        errorHelper.error500(req, res);
                    }
                }

            });
        })
    },
    kdh: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            let pageNum = Number.parseInt(req.query.pageNum);
            pageNum = Number.isSafeInteger(pageNum) && pageNum > 0 ? pageNum : 1;
            let sort = req.query.sort == 'ClickCount' ? 'ClickCount' : 'UpdateTime'; // ClickCount or UpdateTime
            let formData = {
                username: viewModel.user.name,
                appid: 'web',
                code: 'GetOrgList',
                offset: (pageNum - 1) * 16,
                limit: 16,
                sort: sort,
                order: 'DESC'
            };
            console.log('看典号参数：', formData)
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try {
                            let orgInfo = JSON.parse(body);
                            console.log('看典号返回数据', orgInfo);
                            if (orgInfo.code == 0) {
                                let kdhPageStr = pagerHelper(orgInfo.data.total, 16, 5, pageNum, '/kdh', { sort: sort });
                                viewModel.data = {
                                    org: orgInfo,
                                    pageNum: pageNum,
                                    kdhPageStr: kdhPageStr,
                                    sort: sort
                                };
                                res.render('kdhView', {
                                    title: '万选号_知网文化',
                                    viewModel: viewModel,
                                    imgServerAddr: webConfig.imgServerAddr
                                });
                            } else {
                                errorHelper.error500(req, res);
                            }
                        } catch (e) {
                            errorHelper.error500(req, res);
                        }
                    } else {
                        // throw err;
                        errorHelper.error400(req, res);
                    }
                });
        })
    },

    // app推荐页面
    appdownload:function(req,res,next){
        cookieFilter(req, res, function(viewModel) {
            res.render('appDownloadView',{ title: '知网文化app下载', viewModel });
        })
    },
    // 内容下架
    showOffShelf(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('offShelfView', { title: '知网文化', viewModel });
        })
    },
    // 关于我们
    showAboutus(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('aboutusView', {title: '关于我们_知网文化', viewModel});
        })
    },
    //异步 获取精选推荐作品和微刊
    getRecommendList(req, res, next) {
        var type = req.query.type || 0; //0作品 1微刊
        if (type == 0) {
            var formData = {
                appid: 'web',
                code: 'GetCollectionList',
                offset: 0,
                limit: '8',
                isboutique: '2'
            };
        } else if (type == 1) {
            var formData = {
                appid: 'web',
                code: 'GetMircBookList',
                offset: 0,
                limit: '8',
                isboutique: '2'
            };
        }
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
                            // res.json('请检查精选作品和微刊接口！');
                            errorHelper.error500(req, res);
                        }
                    } catch (e) {
                        errorHelper.error500(req, res);
                    }
                } else {
                    // throw err('无数据');
                    errorHelper.error400(req, res);
                }
            });
    },

};