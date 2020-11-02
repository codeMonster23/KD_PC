const cookieFilter = require('../filters/cookieFilter');
const loginFilter = require('../filters/loginFilter');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const pagerHelper = require('../helpers/pagerHelper');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const url = webConfig.serverAddr;
const errorHelper = require('../helpers/errorHelper');
const redirectHelper = require('../helpers/redirectHelper');
const malldrm = require('../service/malldrm');

module.exports = {
    //我的已购 同步 异步
    purchased: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let type = req.query.type || 17;
                let rows = req.query.rows || 12;
                let pageNum = req.query.pageNum || 1;
                let isAsync = req.query.isAsync || 0;

                var formData = {
                    username: viewModel.user.name,
                    type: type,
                    rows: rows,
                    page: pageNum,
                    appid: 'web',
                    code: 'GetPurchasedProductsFromDb'
                };


                console.log(formData);
                console.log('已购参数', formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                if (resData.code == 0) {
                                    console.log('已购：', resData.data);
                                    if (isAsync == 0) {
                                        viewModel.data = resData.data;
                                        let pageStr = pagerHelper(resData.data.total, 12, 5, pageNum);
                                        viewModel.pageStr = pageStr;
                                        viewModel.uid = req.session.uid;
                                        viewModel.openId = req.session.openId;
                                        //授权使用信息
                                        viewModel.drm = { isIE: malldrm.getUserIsIE(req), svrip: webConfig.drmRegMachineSvrIP };
                                        res.render('personalCenter/purchasedView', { title: '我的已购_知网文化', viewModel: viewModel });
                                    } else {
                                        res.json(resData);
                                    }
                                } else {
                                    res.json(resData.msg);
                                }
                            } catch (e) {
                                errorHelper.error500(req, res);
                            }

                        } else {
                            // throw new Error('已购接口错误');
                            errorHelper.error400(req, res);
                        }
                    });


            });
        })
    },

    //我的收藏
    collected: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                const limit = 20;
                let isAsync = req.query.isAsync || 0;
                let pageNum = req.query.pageNum || 1;
                let offset = (pageNum - 1) * limit;
                let isList = req.query.isList || 0; // 0为大图模式，1为列表模式
                let formData = {
                    code: 'GetUserCollect',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: offset,
                    limit: limit
                };
                // 获取我的收藏所有数据
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('我的收藏', resData.data);
                                if (resData.code == 0) {
                                    if (isAsync == 0) {
                                        // let pageStr = pagerHelper(resData.data.total, 12, 5, pageNum);
                                        viewModel.data = resData.data;
                                        // viewModel.pageStr = pageStr;
                                        viewModel.isList = isList;
                                        res.render('personalCenter/collectedView', { title: '我的收藏_知网文化', viewModel: viewModel });
                                    } else {
                                        res.json(resData);
                                    }

                                } else {
                                    // throw new Error(resData.msg);
                                    // res.json('我的收藏接口数据返回错误');
                                    errorHelper.error500(req, res);
                                }
                            } catch (e) {
                                errorHelper.error500(req, res);
                            }

                        } else {
                            // throw new Error('我的收藏接口错误');
                            errorHelper.error400(req, res);
                        }
                    });

            });
        })
    },

    //我的收藏夹详情分类数据
    folderCollected: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                const limit = 20;
                let pageNum = req.query.pageNum || 1;
                let offset = (pageNum - 1) * limit;
                let type = req.query.type;
                let groupId = req.query.groupId;
                let formData = {
                    code: 'GetMyCollect',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: offset,
                    limit: limit,
                    groupid: groupId,
                    type: type
                };
                console.log('我的收藏夹详情分类数据参数',formData);
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('我的收藏夹详情分类数据', resData.data);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    // res.json('我的收藏接口数据返回错误');
                                    errorHelper.error500(req, res);
                                }
                            } catch (e) {
                                errorHelper.error500(req, res);
                            }

                        } else {
                            // throw new Error('我的收藏夹详情分类数据接口错误');
                            errorHelper.error400(req, res);
                        }
                    });

            });
        })
    },

    //收藏夹详情页
    folderDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                const limit = 20;
                let isAsync = req.query.isAsync || 0;
                let pageNum = req.query.pageNum || 1;
                let offset = (pageNum - 1) * limit;
                let groupId = req.query.groupId;
                // let name = req.query.name;
                let formData = {
                    code: 'GetUserCollectDetail',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: offset,
                    limit: 20,
                    groupid: groupId
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('收藏夹详情', resData.data);
                                if (isAsync == 0) {
                                    if (resData.code == 0) {
                                        viewModel.data = resData.data;
                                        viewModel.groupId = groupId;
                                        res.render('personalCenter/folderDetailView', {
                                            title: '我的收藏_知网文化',
                                            viewModel: viewModel
                                        });

                                    } else {
                                        throw new Error(resData.msg);
                                    }
                                } else {
                                    res.json(resData);
                                }
                            } catch (e) {
                                errorHelper.error500(req, res);
                            }
                        } else {
                            // throw new Error('收藏夹详情');
                            errorHelper.error400(req, res);
                        }
                    });

            });
        })
    },

    //异步 我的收藏 单个收藏
    singleCollected: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                const limit = 20;
                // let isAsync = req.query.isAsync || 0;
                let pageNum = req.query.pageNum || 1;
                let offset = (pageNum - 1) * limit;
                let type = req.query.type;
                let formData = {
                    code: 'GetUserCollectByTypeId',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: offset,
                    limit: limit,
                    typeid: type
                };

                // 获取我的收藏单个类型数据
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('我的收藏type', type, resData.data.list);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('我的收藏接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },
    //异步 获取收藏的作品、微刊、文献等的数量
    collectedCounts: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {

                let formData = {
                    code: 'GetUserCollectTypeCount',
                    appid: 'web',
                    username: viewModel.user.name
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('收藏总数据', resData.list);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('收藏总数据接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },
    //异步 获取已购的作品、微刊、文献等的数量
    purchasedCounts: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {

                let formData = {
                    code: 'GetPurchasedProductsCountFromDb',
                    appid: 'web',
                    username: viewModel.user.name
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log(resData)
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('已购总数据接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },
    //异步 修改收藏夹名称
    modifyFolderName: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let groupId = req.query.groupId;
                let title = req.query.title;
                let formData = {
                    code: 'updateCollectGroup',
                    appid: 'web',
                    username: viewModel.user.name,
                    groupid: groupId,
                    title: title
                };

                console.log(formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('修改收藏夹名', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('修改收藏夹名接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },

    //异步 删除收藏夹
    deleteFolder: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let groupId = req.query.groupId;
                let formData = {
                    code: 'DeleteCollectGroup',
                    appid: 'web',
                    username: viewModel.user.name,
                    groupids: groupId
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('删除收藏夹', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('删除收藏夹接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },

    //异步 删除收藏文件
    deleteDoc: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let collectIds = req.query.collectIds;
                let formData = {
                    code: 'DeleteCollect',
                    appid: 'web',
                    username: viewModel.user.name,
                    collectids: collectIds
                };
                console.log('删除收藏文件参数：', formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('删除收藏文件', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    res.json(resData.msg);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('删除收藏文件接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },
    //异步 直接收藏到收藏夹
    addToFolder: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let typeId = req.query.typeId;
                let foreignkeyId = req.query.foreignkeyId;
                let foreignName = req.query.foreignName;
                let groupId = req.query.groupId;
                let formData = {
                    code: 'GoCollectToGroup',
                    appid: 'web',
                    username: viewModel.user.name,
                    typeid: typeId,
                    foreignkeyid: foreignkeyId,
                    foreignname: foreignName,
                    groupid: groupId
                };
                console.log(formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('添加至收藏夹', resData);
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

            });
        })
    },
    //异步 转移至收藏夹
    moveToFolder: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let groupId = req.query.groupId;
                let collectId = req.query.collectId;
                let formData = {
                    code: 'AddCollectGroup',
                    appid: 'web',
                    username: viewModel.user.name,
                    groupid: groupId,
                    collectids: collectId
                };
                console.log(formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('转移至收藏夹', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('转移至收藏夹接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },

    //异步 获取所有收藏夹
    getCollectedFolders: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let formData = {
                    code: 'GetCollectGroupList',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: 0,
                    // limit: 0,
                    // collectlimit: 0,
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('获取所有收藏夹', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('获取所有收藏夹接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });
            });
        })
    },

    // 获取所有收藏夹
    transfer: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let formData = {
                    code: 'GetCollectGroupList',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: 0,
                    // limit: 0,
                    // collectlimit: 0,
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('获取所有收藏夹', resData);
                                if (resData.code == 0) {
                                    viewModel.data = resData.data.list;
                                    viewModel.id = req.query.id;
                                    viewModel.isList = req.query.isList;
                                    viewModel.typeId = req.query.typeId;
                                    viewModel.foreignkeyId = req.query.foreignkeyId;
                                    viewModel.foreignName = req.query.foreignName;
                                    viewModel.isPersonalCenter = req.query.isPersonalCenter;
                                    res.render('personalCenter/transferView', { title: '', viewModel: viewModel });
                                } else {
                                    // throw new Error(resData.msg);
                                    errorHelper.async.resFailed(res);
                                }
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw new Error('获取所有收藏夹接口错误');
                            errorHelper.async.reqFailed(res);
                        }
                    });
            });
        })
    },

    // 新建收藏夹
    createFolder: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let name = req.query.name;
                let formData = {
                    code: 'CreateCollectGroup',
                    appid: 'web',
                    title: name,
                    username: viewModel.user.name
                };

                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log('新建收藏夹', resData);
                                res.json(resData);
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }
                        } else {
                            // throw new Error('请检查新建收藏夹接口');
                            errorHelper.async.reqFailed(res);
                        }
                    });

            });
        })
    },

    //收藏夹详情
    collectedDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('personalCenter/collectedDetailView', { title: '我的收藏_知网文化', viewModel: viewModel });
        })
    },
    //我的关注
    followed: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                let isAsync = req.query.isAsync || 0;
                let pageNum = req.query.pageNum || 1;
                let offset = (pageNum - 1) * 8;
                // let type = req.query.type || 17; // 1-期刊；5-图书；17-作品；18-微刊；9-文献
                let formData = {
                    username: viewModel.user.name,
                    appid: 'web',
                    code: 'ConcernlistPC',
                    offset: offset,
                    limit: 8,
                    sort: 'c.addtime',
                    order: 'desc'
                };
                console.log(formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                console.log('我的关注：', resData.data);
                                if (resData.code == 0) {
                                    viewModel.data = resData.data;
                                    viewModel.pageStr = pagerHelper(resData.data.total, 10, 5, pageNum);
                                    if (isAsync == 0) {
                                        res.render('personalCenter/followView', { title: '我的关注_知网文化', viewModel: viewModel });
                                    } else {
                                        res.json(resData);
                                    }
                                } else {
                                    res.json(resData.msg);
                                }
                            } catch (e) {
                                if (isAsync == 0) {
                                    errorHelper.error500(req, res);
                                } else {
                                    errorHelper.async.resFailed(res);
                                }
                            }
                        } else {
                            // throw new Error('我关注的万选号接口错误');
                            if (isAsync == 0) {
                                errorHelper.error400(req, res);
                            } else {
                                errorHelper.async.reqFailed(res);
                            }
                        }
                    });


            });
        })
    },
    //异步 获取允许授权电脑数量
    getUserSysInfoCount: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                var username = viewModel.user.name;
                malldrm.getUserSysInfoCount(username, "ttkn").then((data) => {
                    errorHelper.async.success(res, data);
                }).catch((err) => {
                    errorHelper.async.resFailed(res);
                });
            });
        })
    },
    // 浏览历史
    showHistory: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            loginFilter(req, res, viewModel, function() {
                res.render('personalCenter/historyView', { title: '我的足迹_知网文化', viewModel: viewModel });
            });
        })
    },
    // 异步 获取浏览历史数据
    getHistory: function(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let starttime = req.query.starttime;
                let endtime = req.query.endtime;
                let pageNum = req.query.pageNum || 1;
                let limit = 12;
                let offset = (pageNum - 1) * limit;
                let formData = {
                    username: viewModel.user.name,
                    appid: 'web',
                    code: 'UserLogList',
                    offset: offset,
                    limit: limit,
                    type: '',
                    starttime,
                    endtime
                };
                console.log(formData);
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                console.log(resData);
                                res.json(resData);
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            errorHelper.async.reqFailed(res);
                        }
                    });
            });
        });
    },
    // 异步 删除浏览历史数据
    delHistory: function(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let ids = req.query.ids || '';
                let formData = {
                    appid: 'web',
                    code: 'removerLog',
                    username: viewModel.user.name,
                    ids
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                let resData = JSON.parse(body);
                                res.json(resData);
                            } catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            errorHelper.async.reqFailed(res);
                        }
                    });
            });
        });
    },
};