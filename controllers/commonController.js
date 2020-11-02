const cookieFilter = require('../filters/cookieFilter');
const loginFilter = require('../filters/loginFilter');
const request = require('request');
const webConfig = require('../config/web.config');
const url = webConfig.serverAddr;
const multiparty = require('multiparty');
const formData = require('form-data');
const fs = require('fs');
const http = require('http');
const async = require('async');
const contentConfig = require('../config/content.config');
const errorHelper = require('../helpers/errorHelper');
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const redirectHelper = require('../helpers/redirectHelper');

module.exports = {
    //异步 添加收藏
    addCollect(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            var typeid = req.query.typeid || 0; //收藏类型0:作品 1:微刊 2:朗读 3:典言 4:期刊 5:图书 6文献
            var formData = {
                appid: 'web',
                code: 'GoCollect',
                username: viewModel.user.name,
                typeid: 0,
                foreignkeyid: id,
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        try{
                            var resData = JSON.parse(body);
                            if (resData.code == 0) {
                                res.json(resData);
                            } else {
                                // res.json('请检查收藏方法！');
                                errorHelper.async.resFailed(res);
                            }
                        }catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err('无数据');
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },
    //异步 取消收藏
    cancelCollect(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var id = req.params.id;
            var typeid = req.query.typeid || 0;
            var formData = {
                appid: 'web',
                code: 'GoCancleCollect',
                username: viewModel.user.name,
                typeid: 0,
                foreignkeyid: id,
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
                                // res.json('请检查取消收藏方法！');
                                errorHelper.async.resFailed(res);
                            }
                        }catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err('无数据');
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },
    //异步 评论提交
    commentSubmit: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let id = req.params.id;
            let typeid = parseInt(req.query.typeid);
            let content = req.query.content;
            let score = req.query.score || 0;
            let picinfo = req.query.picinfo || '';
            let formData = {
                appid: 'web',
                code: 'AddComment',
                username: viewModel.user.name,
                foreignkeyid: id,
                typeid, //0-知网文化图文评论，1-知网文化朗读评论，2-书评
                content,
                score,
                mediainfo: picinfo,
                picinfo:''
            };
            console.log('上传接口参数:',formData)
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
                                // res.json('请检查作品提交评论！');
                                errorHelper.async.resFailed(res);
                            }
                        }catch (e) {
                            errorHelper.async.resFailed(res);
                        }

                    } else {
                        // throw err('无数据');
                        errorHelper.async.reqFailed(res);
                    }
                });
        })
    },

    //异步 添加或者取消收藏
    collectOrNot(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                if(viewModel.user.isOrg == false){
                    let id = '';
                    let typeId = req.query.typeId || 0; //收藏类型0:作品 1:微刊 2:朗读 3:典言 4:期刊 5:图书 6文献
                    let foreignname = req.query.title || '';
                    if (typeId == 6) {
                        id = req.query.dbType + '#' + req.query.filename;
                    } else {
                        id = req.query.id;
                    }
                    let isCollected = req.query.isCollected;
                    let formData = {};
                    if (isCollected == 0) {
                        formData = {
                            appid: 'web',
                            code: 'GoCollect',
                            username: viewModel.user.name,
                            typeid: typeId,
                            foreignkeyid: id,
                            foreignname
                        };
                    } else {
                        formData = {
                            appid: 'web',
                            code: 'GoCancleCollect',
                            username: viewModel.user.name,
                            typeid: typeId,
                            foreignkeyid: id,
                            foreignname
                        };
                    }

                    console.log('收藏或者取消收藏', formData)
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            console.log(formData);
                            if (!err && response.statusCode == 200) {
                                try {
                                    var resData = JSON.parse(body);
                                    console.log('收藏或者取消收藏', resData);
                                    if (resData.code == 0) {
                                        res.json(resData);
                                    } else {
                                        // res.json('请检查收藏方法！');
                                        errorHelper.async.resFailed(res);
                                    }
                                }catch (e) {
                                    errorHelper.async.resFailed(res);
                                }

                            } else {
                                // throw err;
                                errorHelper.async.reqFailed(res);
                            }
                        });
                }
                else {
                    res.json({
                        code: -1,
                        msg: contentConfig.orgUserMsg
                    })
                }
            })
        })
    },

    //异步  点赞或者取消点赞
    praiseOrNot(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                if(viewModel.user.isOrg == false){
                    let typeId = req.query.typeId || 0; // 点赞类型 0:万选号作品 1:看点号作品评论 2 书评
                    let id = req.query.id;
                    let isPraised = req.query.isPraised;
                    var formData = {}
                    if (isPraised == 0) {
                        formData = {
                            appid: 'web',
                            code: 'LikesAgree',
                            username: viewModel.user.name,
                            typeid: typeId,
                            foreignkeyid: id,
                        };
                    } else {
                        formData = {
                            appid: 'web',
                            code: 'CancelAgree',
                            username: viewModel.user.name,
                            typeid: typeId,
                            foreignkeyid: id,
                        };
                    }
                    console.log('点赞或者取消点赞', formData)
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                try {
                                    var resData = JSON.parse(body);
                                    console.log('点赞或者取消点赞', resData);
                                    if (resData.code == 0) {
                                        res.json(resData);
                                    } else {
                                        res.json({
                                            code: -1,
                                            msg: resData.msg
                                        });
                                    }
                                }catch (e) {
                                    errorHelper.async.resFailed(res);
                                }

                            } else {
                                // throw err;
                                errorHelper.async.reqFailed(res);
                            }
                        });
                }
                else{
                    res.json({
                        code: -1,
                        msg: contentConfig.orgUserMsg
                    });
                }
            })
        })
    },

    //异步  判断用户是否收藏
    isCollected(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let typeId = req.query.typeId || 0;
                // 收藏类型0:作品 1:微刊 2:朗读 3:典言 4:期刊 5:图书 6:文献 7书单
                let id = req.query.id;
                let formData = {
                    appid: 'web',
                    code: 'IsCollect',
                    username: viewModel.user.name,
                    typeid: typeId,
                    foreignkeyid: id,
                };
                console.log('判断用户是否收藏参数', formData);
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                console.log('判断用户是否收藏', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                }
                                else {
                                    res.json(resData.msg);
                                }
                            }catch (e) {
                                errorHelper.async.resFailed(res);
                            }
                        } else {
                            // throw err;
                            errorHelper.async.reqFailed(res);
                        }
                    });
            })
        })
    },

    //异步  判断用户对评论是否点过赞
    isPraised(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let typeId = req.query.typeId || 0; // 点赞类型 0:万选号作品 1:看点号作品评论 2 书评
                let id = req.query.id;
                let formData = {
                    appid: 'web',
                    code: 'IsLikeAgree',
                    username: viewModel.user.name,
                    typeid: typeId, // 点赞类型0:万选号作品 1:看点号作品评论 2书评
                    foreignkeyid: id,
                };
                console.log('用户对评论是否点过赞参数', formData)
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                console.log('用户对评论是否点过赞返回', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    res.json('用户对评论是否点过赞接口');
                                }
                            }catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw err;
                            errorHelper.async.reqFailed(res);
                        }
                    });
            })
        })
    },

    //异步  上传图片
    // uploadImg(req, res, next) {
    //     cookieFilter(req, res, function (viewModel) {
    //         loginFilter(req, res, viewModel, function () {
    //             console.log('req.body', req.body);
    //
    //             // let fileList = req.body.form || [];
    //             // http://kdjk.cnki.net/resource/file/uploadPicMultipart
    //             let formData = {
    //                 appid: 'web',
    //                 code: 'uploadPicMultipart',
    //                 username: viewModel.user.name,
    //                 files: req.body
    //             };
    //             console.log('上传图片参数', formData)
    //             request.post({
    //                     url: webConfig.fileAddr,
    //                     form: {}
    //                 },
    //                 function (err, response, body) {
    //                     if (!err && response.statusCode == 200) {
    //                         var resData = JSON.parse(body);
    //                         console.log('上传图片返回', resData);
    //                         if (resData.code == 0) {
    //                             res.json(resData);
    //                         } else {
    //                             res.json('上传图片错误');
    //                         }
    //                     } else {
    //                         throw err;
    //                     }
    //                 });
    //         })
    //     })
    // },
    uploadImg: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let Response = res;
                let filePath = [];
                let form = new multiparty.Form();
                form.parse(req, function (err, fields, file) {
                    if (file.img.length > 9) {
                        file.img.length = 9;
                    }
                    for (let i = 0; i < file.img.length; i++) {
                        filePath.push(file.img[i].path);
                    }
                    // console.log('图片路径：', filePath);


                    let username = viewModel.user.name;


                    let functionArray = [];
                    for (let i = 0; i < filePath.length; i++) {
                        functionArray[i] = function (cb) {
                            let queryParam = new formData();
                            let headers = queryParam.getHeaders();
                            queryParam.append('username', username);
                            queryParam.append('file', fs.createReadStream(filePath[i]));
                            let options = {
                                method: 'post',
                                host: 'wanxuan.cnki.net',
                                path: '/resource/file/uploadPic',
                                headers: headers
                            };
                            let request = http.request(options, function (res) {
                                let resStr = '';
                                res.on('data', function (res) {
                                    // 数据流
                                    resStr += res;
                                });
                                res.on('end', () => {
                                    // Response.send(JSON.parse(resStr));
                                    cb(null, resStr);
                                    // return;
                                })
                            });
                            queryParam.pipe(request);
                        }
                    }
                    async.parallel(functionArray, function (err, results) {
                        if (err) {
                            // throw err;
                            errorHelper.async.resFailed(res);
                        }
                        else {
                            console.log('上传图片返回：', results);
                            res.json({
                                errorCode: 0,
                                errorMessage: '多图长传成功',
                                data: results
                            });
                        }
                    });
                })
            })
        })
    },

    //异步  判断用户对评论是否点过赞
    getOrderFeedback(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let order = req.query.order;
                if (order) {
                    res.json({
                        errorMessage: '成功',
                        errorCode: 1
                    });
                }

            })
        })
    },

    //异步  获取机构用户包库权限
    getOrgLibRight(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let formData = {
                    "signature": signature,
                    "username": viewModel.user.name
                };
                console.log('获取机构用户包库权限参数', formData)
                request.post({
                        url: webConfig.paymentAddr + '/institutionrignt.do',
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            try {
                                var resData = JSON.parse(body);
                                console.log('获取机构用户包库权限', resData);
                                if (resData.code == 0) {
                                    res.json(resData);
                                } else {
                                    res.json('用户对评论是否点过赞接口');
                                }
                            }catch (e) {
                                errorHelper.async.resFailed(res);
                            }

                        } else {
                            // throw err;
                            errorHelper.async.reqFailed(res);
                        }
                    });
            })
        })
    },

    //异步  提交反馈建议
    submitFeedback(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let content = req.body.content || '';
            let connect = req.body.connect || '';
            let source = req.body.source || '';
            let mediainfo = req.body.mediainfo || '';
            let formData = {
                appid: 'web',
                code: 'AddFeedBack',
                username: viewModel.user.name,
                content,
                connect,
                source: 'pc',
                mediainfo
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
                        }
                        else {
                            res.json(resData.msg);
                        }
                    }catch (e) {
                        errorHelper.async.resFailed(res);
                    }
                } else {
                    errorHelper.async.reqFailed(res);
                }
            });
        })
    },
};