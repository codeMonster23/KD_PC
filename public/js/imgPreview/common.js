var documentUrl = $("script").last().attr("src");
if (undefined != documentUrl) {
    var domain = documentUrl.replace(/js\/platForm\/common.js/, "");
    CreateLink(domain + "css/kui-dialog.css");
    CreateScript(domain + "js/layer-3.0.3/layer.min.js");
}
//关注
(function ($) {

    function callbackExistHtml(tagName, css1, css2) {
        return function (data) {
            if (data == undefined) {
                return;
            }
            if (data.errorCode == "E000") {
                tagName.removeClass(css1).addClass(css2);
                tagName.html("<span>已关注</span>&nbsp;&nbsp;取消");
            }
            else if (data.errorCode == "E001") {
                tagName.removeClass(css2).addClass(css1);
                tagName.html("<span>+</span>&nbsp;关注");
            }
        }
    }

    $.fn.koalaconcern = function (options) {
        var opts = $.extend({}, $.fn.koalaconcern.defaults, options);
        if (this.selector) {
            $(this).each(function () {
                var datacode = $(this).attr("data-code");
                var dataname = $(this).attr("data-name");
                if (opts.isShowCancel && datacode) {
                    var isExistApiUrl = opts.plateFormUrl + "/api/WebApi/IsExistConcern?jsoncallback=?";
                    var isExistJsonData = {Type: opts.concernType, ForeignKeyId: datacode}
                    $.post(isExistApiUrl, isExistJsonData, callbackExistHtml($(this), opts.oldClass, opts.newClass), "jsonp");
                }
            });

            this.unbind("click");
            this.click(function (e) {
                if ($(this)) {
                    var datacode = $(this).attr("data-code");
                    var dataname = $(this).attr("data-name");
                    if (datacode && dataname) {
                        var apiUrl = opts.plateFormUrl + "/api/WebApi/AddConcern?jsoncallback=?";
                        var isDel = 0;
                        if (opts.isShowCancel) {
                            isDel = 3;
                        }
                        var jsonData = {
                            Type: opts.concernType,
                            ForeignKeyId: datacode,
                            ForeignName: dataname,
                            IsDel: isDel
                        };
                        var objChild = $(e.currentTarget);
                        $.post(apiUrl, jsonData,
                            function (data) {
                                if (data == undefined) {
                                    layer.msg("未知错误");
                                    return;
                                }
                                if (data.errorCode == "E000") {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        opts.callBack(data.errorMessages, objChild);
                                    }
                                    if (opts.isShowCancel) {
                                        objChild.removeClass(opts.oldClass).addClass(opts.newClass);
                                        // objChild.html("<span>已关注</span>&nbsp;&nbsp;取消");

                                    }
                                    else {

                                    }
                                    layer.msg("关注成功");
                                }
                                else if (data.errorCode == "E001") {
                                    if (opts.isShowCancel) {
                                        if (parseInt(data.errorMessages) >= 0) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                        objChild.addClass(opts.oldClass).removeClass(opts.newClass);
                                        objChild.html("<span>+</span>&nbsp;关注");

                                    }
                                    else {

                                    }
                                    layer.msg("取消关注！");
                                }
                                else if (data.errorCode == "E002") {
                                    layer.msg("数据不正确");
                                }
                                else if (data.errorCode == "E003" || data.errorCode == "E0014") {
                                    layer.msg("尚未登录请先登录后添加关注");
                                    if (!opts.loginURL || opts.loginURL == '') {
                                        opts.loginURL = $('.toplink .pText').attr('href');
                                    }
                                    if (!opts.loginURL || opts.loginURL == '') {
                                        opts.loginURL = $('.topBanner .right a:first').attr('href');
                                    }
                                    replaceToUrl(opts.loginURL);

                                }

                            }, "jsonp");

                    }
                }
            })
        }
    };

    $.fn.koalaconcern.defaults = {
        plateFormUrl: "",
        isShowCancel: false,
        concernType: 1,
        loginURL: "",
        oldClass: "concern follow",
        newClass: "concern followed_qx",
        callBack: function () {
        }
    };

})(jQuery);

//订阅
(function ($) {
    function callbackExistHtml(tagName, css1, css2, isshow) {
        return function (data) {
            if (data == undefined) {
                return;
            }
            var tmpHtml = tagName.html();
            if (data.errorCode == "E000") {
                if (css1 != "" && css2 != "") {
                    tagName.removeClass(css1).addClass(css2);
                }

                if (isshow && tmpHtml.indexOf("已") < 0) {
                    tagName.html("已订阅");
                }
            }
            else if (data.errorCode == "E001") {
                if (css1 != "" && css2 != "") {
                    tagName.removeClass(css2).addClass(css1);
                }
                if (isshow && tmpHtml.indexOf("已") > 0) {
                    tagName.html(tmpHtml.replace("已", "+"));
                }
            }
        }
    }

    $.fn.koalasubscription = function (options) {
        var opts = $.extend({}, $.fn.koalasubscription.defaults, options);
        if (this.selector) {

            $(this).each(function () {
                var datacode = $(this).attr("data-code");
                var dataname = $(this).attr("data-name");
                if (datacode) {
                    var isExistApiUrl = opts.plateFormUrl + "/api/PulpitApi/IsExsitSubscription?jsoncallback=?";
                    var isExistJsonData = {Type: opts.subscriptionType, ForeignKeyId: datacode}
                    $.post(isExistApiUrl, isExistJsonData, callbackExistHtml($(this), opts.oldClass, opts.newClass, opts.isShowCancel), "jsonp");
                }
            });

            this.unbind("click");
            this.click(function (e) {
                if ($(this)) {
                    var datacode = $(this).attr("data-code");
                    var dataname = $(this).attr("data-name");
                    if (datacode && dataname) {
                        var apiUrl = opts.plateFormUrl + "/api/PulpitApi/AddSubscription?jsoncallback=?";
                        var jsonData = {
                            Type: opts.subscriptionType,
                            IsDel: opts.isDel,
                            ForeignKeyId: datacode,
                            ForeignName: dataname
                        }
                        var objChild = $(e.currentTarget);
                        $.post(apiUrl, jsonData,
                            function (data) {
                                if (data == undefined) {
                                    layer.msg("未知错误");
                                    return;
                                }
                                if (data.errorCode == "E000") {
                                    if (parseInt(data.errorMessages) > 0) {
                                        if (!opts.isShowCancel && opts.showCollectCount) {
                                            objChild.html("+订阅");

                                        }
                                        if (opts.isShowCancel && objChild.html().indexOf("已") < 0) {
                                            objChild.html("已订阅");

                                        }
                                        if (opts.iscallBackFirst) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                    }
                                    if (opts.oldClass != "" && opts.newClass != "") {
                                        objChild.removeClass(opts.oldClass).addClass(opts.newClass);
                                    }
                                    layer.msg("订阅成功！");
                                } else if (data.errorCode == "E001") {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        if (!opts.isShowCancel && opts.showCollectCount) {
                                            objChild.html("+订阅");
                                        }
                                        if (opts.isShowCancel && objChild.html().indexOf("已") >= 0) {
                                            objChild.html("+订阅");
                                        }
                                        if (opts.iscallBackFirst) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                    }
                                    if (opts.oldClass != "" && opts.newClass != "") {
                                        objChild.removeClass(opts.newClass).addClass(opts.oldClass);
                                    }
                                    layer.msg("取消订阅！");

                                } else if (data.errorCode == "E002") {
                                    layer.msg("数据不正确");
                                } else if (data.errorCode == "E003" || data.errorCode == "E0014") {
                                    layer.msg("尚未登录请先登录后再订阅");
                                    if (!opts.loginURL || opts.loginURL == '') {
                                        opts.loginURL = $('.toplink .pText').attr('href');
                                    }
                                    if (!opts.loginURL || opts.loginURL == '') {
                                        opts.loginURL = $('.topBanner .right a:first').attr('href');
                                    }
                                    replaceToUrl(opts.loginURL);
                                }

                            }, "jsonp");

                    }
                }
            });
        }
    };

    $.fn.koalasubscription.defaults = {
        plateFormUrl: "",
        subscriptionType: 0,
        loginURL: "",
        isShowCancel: true,
        isDel: 0,
        oldClass: "",
        newClass: "",
        showCollectCount: false,//是否显示收藏次数
        iscallBackFirst: false,
        callBack: function () {
        }
    };

})(jQuery);

//删除订阅


//收藏
(function ($) {
    function callbackExistHtml(tagName, css1, css2, isshow) {
        return function (data) {
            if (data == undefined) {
                return;
            }
            var tmpHtml = tagName.html();
            if (data.errorCode == "E000") {
                if (css1 != "" && css2 != "") {
                    tagName.removeClass(css1).addClass(css2);
                }

                if (isshow && tmpHtml.indexOf("已") < 0) {
                    tagName.html("已" + tmpHtml);
                }

            }
            else if (data.errorCode == "E001") {
                if (css1 != "" && css2 != "") {
                    tagName.removeClass(css2).addClass(css1);
                }
                if (isshow && tmpHtml.indexOf("已") > 0) {
                    tagName.html(tmpHtml.replace("已", ""));
                }

            }
        }
    }

    $.fn.koalacollect = function (options) {
        var opts = $.extend({}, $.fn.koalacollect.defaults, options);
        if (this.selector) {

            $(this).each(function () {
                var datacode = $(this).attr("data-code");
                var dataname = $(this).attr("data-name");
                if (datacode) {
                    var isExistApiUrl = opts.plateFormUrl + "/api/WebApi/IsExsitCollect?jsoncallback=?";
                    var isExistJsonData = {Type: opts.collectType, ForeignKeyId: datacode}
                    $.post(isExistApiUrl, isExistJsonData, callbackExistHtml($(this), opts.oldClass, opts.newClass, opts.isShowCancel), "jsonp");
                }
            });

            this.unbind("click");
            this.click(function (e) {
                if ($(this)) {
                    var datacode = $(this).attr("data-code");
                    var dataname = $(this).attr("data-name");
                    if (datacode && dataname) {
                        var apiUrl = opts.plateFormUrl + "/api/WebApi/AddCollect?jsoncallback=?";
                        var jsonData = {Type: opts.collectType, ForeignKeyId: datacode, ForeignName: dataname}
                        var objChild = $(e.currentTarget);
                        $.post(apiUrl, jsonData,
                            function (data) {
                                if (data == undefined) {
                                    layer.msg("未知错误");
                                    return;
                                }
                                if (data.errorCode == "E000") {
                                    if (parseInt(data.errorMessages) > 0) {
                                        if (!opts.isShowCancel && opts.showCollectCount) {
                                            objChild.html("收藏(" + data.errorMessages + ")");
                                        }
                                        if (opts.isShowCancel && objChild.html().indexOf("已") < 0) {
                                            objChild.html("已收藏");
                                        }
                                        if (opts.iscallBackFirst) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                    }
                                    if (opts.oldClass != "" && opts.newClass != "") {
                                        objChild.removeClass(opts.oldClass).addClass(opts.newClass);
                                    }
                                    layer.msg("收藏成功");

                                } else if (data.errorCode == "E001") {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        if (!opts.isShowCancel && opts.showCollectCount) {
                                            objChild.html("收藏(" + data.errorMessages + ")");
                                        }
                                        if (opts.isShowCancel && objChild.html().indexOf("已") >= 0) {
                                            objChild.html("收藏");
                                        }
                                        if (opts.iscallBackFirst) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                    }
                                    if (opts.oldClass != "" && opts.newClass != "") {
                                        objChild.removeClass(opts.newClass).addClass(opts.oldClass);
                                    }
                                    layer.msg("取消收藏");

                                } else if (data.errorCode == "E002") {
                                    layer.msg("数据不正确");
                                } else if (data.errorCode == "E003" || data.errorCode == "E0014") {
                                    // layer.msg("尚未登录请先登录后再收藏");
                                    layer.msg('尚未登录请先登录后再收藏');
                                    if (!opts.loginURL || opts.loginURL == '') {
                                        opts.loginURL = $('.toplink .pText').attr('href');
                                    }
                                    if (!opts.loginURL || opts.loginURL == '') {
                                        opts.loginURL = $('.topBanner .right a:first').attr('href');
                                    }
                                    replaceToUrl(opts.loginURL);
                                }

                            }, "jsonp");

                    }
                }
            });
        }
    };

    $.fn.koalacollect.defaults = {
        plateFormUrl: "",
        collectType: 0,
        loginURL: "",
        isShowCancel: true,
        oldClass: "",
        newClass: "",
        showCollectCount: false,//是否显示收藏次数
        iscallBackFirst: false,
        callBack: function () {
        }
    };

})(jQuery);

//删除收藏
function delCollect(datacode, plateFormUrl, hideTag, callbackFun) {
    if (datacode) {
        var apiUrl = plateFormUrl + "/api/WebApi/DelCollect?jsoncallback=?";
        var jsonData = {id: datacode}
        $.post(apiUrl, jsonData,
            function (data) {
                if (data == undefined) {
                    layer.msg("未知错误");
                    return;
                }
                if (data.errorCode == "E000") {
                    layer.msg("删除成功");
                    if (hideTag != undefined) {
                        hideTag.hide(2000);
                    }
                    if (callbackFun) {
                        callbackFun();
                    }
                }
                else if (data.errorCode == "E001") {
                    layer.msg("已经删除");
                }
                else if (data.errorCode == "E002") {
                    layer.msg("数据不正确");
                }
                else if (data.errorCode == "E003" || data.errorCode == "E0014") {
                    layer.msg("尚未登录，请先登录");
                }

            }, "jsonp");

    }
}


//粉丝
(function ($) {

    function callbackExistHtml(tagName, css1, css2) {
        return function (data) {
            if (data == undefined) {
                return;
            }
            if (data.errorCode == "E000") {
                tagName.removeClass(css1).addClass(css2);
                tagName.html("已关注");
            }
            else if (data.errorCode == "E001") {
                tagName.removeClass(css2).addClass(css1);
                tagName.html("+关注");
            }
        }
    }

    $.fn.koalafans = function (options) {
        var opts = $.extend({}, $.fn.koalafans.defaults, options);
        if (this.selector) {
            $(this).each(function () {
                if (opts.isShowCancel && $(this).attr("data-code")) {
                    var isExistApiUrl = opts.plateFormUrl + "/api/WebApi/IsExistFans?jsoncallback=?";
                    var isExistJsonData = {ToUserId: $(this).attr("data-code")};
                    $.post(isExistApiUrl, isExistJsonData, callbackExistHtml($(this), opts.oldClass, opts.newClass), "jsonp");
                }
            });
            this.unbind("click");
            this.click(function (e) {
                if ($(this)) {
                    var datacode = $(this).attr("data-code");
                    if (datacode) {
                        var apiUrl = opts.plateFormUrl + "/api/WebApi/AddFans?jsoncallback=?";
                        var updateType = 0;
                        if (opts.isShowCancel) {
                            updateType = 1;
                        }
                        var jsonData = {ToUserId: datacode, UpdateType: updateType};
                        $.post(apiUrl, jsonData, function (data) {

                            var objChild = $(e.currentTarget);
                            if (data == undefined) {
                                layer.msg("未知错误");
                                return;
                            }
                            if (data.errorCode == "E000") {
                                if (parseInt(data.errorMessages) >= 0) {
                                    opts.callBack(data.errorMessages, objChild);
                                }
                                if (opts.isShowCancel) {
                                    //objChild.removeClass(opts.oldClass).addClass(opts.newClass);
                                    objChild.html("已关注");

                                }
                                else {

                                }
                                layer.msg("关注成功");
                            }
                            else if (data.errorCode == "E001") {
                                if (opts.isShowCancel) {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        opts.callBack(data.errorMessages, objChild);
                                    }
                                    //objChild.addClass(opts.oldClass).removeClass(opts.newClass);
                                    objChild.html("+关注");
                                    layer.msg("取消关注");
                                }
                                else {
                                    layer.msg("已经关注");
                                }
                            }
                            else if (data.errorCode == "E002") {
                                layer.msg("这是你自己，不用添加关注");
                            }
                            else if (data.errorCode == "E003" || data.errorCode == "E0014") {
                                layer.msg("尚未登录请先登录后添加关注");
                                if (!opts.loginURL || opts.loginURL == '') {
                                    opts.loginURL = $('.toplink .pText').attr('href');
                                }
                                if (!opts.loginURL || opts.loginURL == '') {
                                    opts.loginURL = $('.topBanner .right a:first').attr('href');
                                }
                                if (opts.loginURL && opts.loginURL != undefined && opts.loginURL != "") {
                                    replaceToUrl(opts.loginURL);
                                }
                            }

                        }, "jsonp");

                    }
                }
            })


        }
    };

    $.fn.koalafans.defaults = {
        plateFormUrl: "",
        isShowCancel: false,
        fansType: 0,
        loginURL: "",
        oldClass: "fans follow",
        newClass: "fans followed_qx",
        callBack: function () {
        }
    };

})(jQuery);

//点赞
(function ($) {
    function callbackExistHtml(tagName, css1, css2, isshow) {
        return function (data) {
            if (data == undefined) {
                return;
            }
            var tmpHtml = tagName.html();
            if (data.errorCode == "E000") {
                if (css1 != "" && css2 != "") {
                    tagName.removeClass(css1).addClass(css2);
                }

                if (isshow && tmpHtml.indexOf("已") < 0) {
                    tagName.html("已" + tmpHtml);
                }
            }
            else if (data.errorCode == "E001") {
                if (css1 != "" && css2 != "") {
                    tagName.removeClass(css2).addClass(css1);
                }
                if (isshow && tmpHtml.indexOf("已") > 0) {
                    tagName.html(tmpHtml.replace("已", ""));
                }
            }
        }
    }

    $.fn.koalaagree = function (options) {
        var opts = $.extend({}, $.fn.koalaagree.defaults, options);
        if (this.selector) {
            $(this).each(function () {
                var datacode = $(this).attr("data-code");
                var dataname = $(this).attr("data-name");
                if (datacode) {
                    var isExistApiUrl = opts.plateFormUrl + "/api/WebApi/IsExistAgreeIP?jsoncallback=?";
                    var isExistJsonData = {Type: opts.agreeType, ForeignKeyId: datacode}
                    $.post(isExistApiUrl, isExistJsonData, callbackExistHtml($(this), opts.oldClass, opts.newClass, opts.isShowCancel), "jsonp");
                }
            });
            this.unbind("click");
            this.click(function (e) {
                if ($(this)) {
                    var datacode = $(this).attr("data-code");
                    var dataname = $(this).attr("data-name");
                    if (datacode && dataname) {
                        var apiUrl = opts.plateFormUrl + "/api/WebApi/AddAgreeIP?jsoncallback=?";
                        var jsonData = {Type: opts.agreeType, ForeignKeyId: datacode, ForeignName: dataname}
                        var objChild = $(e.currentTarget);
                        $.post(apiUrl, jsonData,
                            function (data) {
                                if (data == undefined) {
                                    opts.isWap ? layer.msg("未知错误") : layer.msg("未知错误");
                                    return;
                                }
                                if (data.errorCode == "E000") {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        if (opts.isShowCancel) {
                                            objChild.html("已赞(" + data.errorMessages + ")");
                                        }
                                        else if (opts.iscallBackFirst) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                        else {
                                            objChild.html(data.errorMessages);
                                        }

                                    }
                                    if (opts.oldClass != "" && opts.newClass != "") {
                                        objChild.removeClass(opts.oldClass).addClass(opts.newClass);
                                    }
                                    layer.msg("点赞成功");
                                }
                                else if (data.errorCode == "E001") {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        if (opts.isShowCancel) {
                                            objChild.html("赞(" + data.errorMessages + ")");
                                        }
                                        else if (opts.iscallBackFirst) {
                                            opts.callBack(data.errorMessages, objChild);
                                        }
                                        else {
                                            objChild.html(data.errorMessages);
                                        }

                                    }
                                    if (opts.oldClass != "" && opts.newClass != "") {
                                        objChild.removeClass(opts.newClass).addClass(opts.oldClass);
                                    }
                                    layer.msg("取消点赞");
                                }
                                else if (data.errorCode == "E002") {
                                    opts.isWap ? layer.msg("数据不正确") : layer.msg("数据不正确");
                                }
                                else if (data.errorCode == "E003" || data.errorCode == "E0014") {
                                    //opts.isWap ? layer.msg("请登录后点赞") : layer.msg("尚未登录请先登录后点赞");
                                    //if (!opts.loginURL || opts.loginURL == '') {
                                    //    opts.loginURL = $('.toplink a:first').attr('href');
                                    //}
                                    //if (!opts.loginURL || opts.loginURL == '') {
                                    //    opts.loginURL = $('.topBanner .right a:first').attr('href');
                                    //}
                                    //replaceToUrl(opts.loginURL);

                                    opts.isWap ? layer.msg("数据不正确") : layer.msg("数据不正确");
                                }

                            }, "json");

                    }
                }
            })
        }
    };

    $.fn.koalaagree.defaults = {
        agreeTagName: "",
        plateFormUrl: "",
        isShowCancel: true,
        agreeType: 0,
        loginURL: "",
        oldClass: "",
        newClass: "",
        iscallBackFirst: false,
        isWap: false,
        callBack: function () {
        }
    };

})(jQuery);

//评分
(function ($) {
    $.fn.koalascore = function (options) {
        var opts = $.extend({}, $.fn.koalascore.defaults, options);
        if (this.selector) {
            if (opts.scoreTagName == "") {
                opts.scoreTagName = "#" + $(this).id;
            }
            //评分，是否已评过分数,是否允许评分
            var RatyReadOnly = true;
            if ($(opts.scoreTagName).attr("data-allowscore") == 1) {
                RatyReadOnly = false;
            }

            var datacode = $(this).attr("data-code");
            var dataname = $(this).attr("data-name");
            $('#fivestar').raty({
                cancelOff: true,
                cancelOn: true,
                hintList: ['1分', '2分', '3分', '4分', '5分'],
                readOnly: RatyReadOnly,
                start: opts.start,
                path: "",
                number: 5,
                starWidth: opts.starWidth,
                starOn: opts.starOn,// ,
                starOff: opts.starOff,//
                onClick: function (score, evt) {
                    //TODO 此处提交评分至服务器
                    //console.log("onClick-score=" + score);
                    var jsondata = {
                        "OperationType": opts.operationType,
                        "ScoreType": opts.scoreType,
                        "ForeignKeyID": datacode,
                        "Score": score,
                        "ForeignName": dataname
                    };
                    $(opts.scoreTagName).attr("data-score", score);
                    $("#spanUserScore").html(score);
                    var datapost = $(opts.scoreTagName).attr("data-post");
                    datapost = isNaN(datapost) ? 1 : 0;
                    if ($(opts.scoreTagName).attr("data-allowscore") == 1 && datapost == 1) {
                        $.post(opts.plateFormUrl + "/api/WebApi/AddScore", jsondata, function (data) {
                            //console.log("onClick-score-post-result=" + data.errorCode);
                            opts.callBack(data.errorMessages, 0);
                        });
                    }
                },
                showHalf: true,
                starHalf: opts.starHalf
            });


            //if ($(this).attr("data-code")) {
            //    var isExistApiUrl = opts.plateFormUrl + "/api/WebApi/AddScore";
            //    var isExistJsonData = { Type: opts.agreeType, ForeignKeyId: $(this).attr("data-code") }
            //    $.post(isExistApiUrl, isExistJsonData,
            //                    function (data) {
            //                        if (data == undefined) {
            //                            return;
            //                        }
            //                        if (data.errorCode == "E000") {
            //                            var agreeTName = $(opts.agreeTagName).html();
            //                            $(opts.agreeTagName).html("取消" + agreeTName);
            //                        }
            //                    }, "json");
            //}
        }
    };

    $.fn.koalascore.defaults = {
        starOn: "",
        starOff: "",
        starHalf: "",
        start: 3,
        scoreTagName: "",
        plateFormUrl: "",
        operationType: 1,
        scoreType: 1,
        callBack: function () {
        }
    };

})(jQuery);


//投票
(function ($) {
    $.fn.koalavote = function (options) {
        var opts = $.extend({}, $.fn.koalavote.defaults, options);
        if (this.selector) {
            this.unbind("click");
            this.click(function (e) {
                if ($(this)) {
                    var datacode = $(this).attr("data-code");
                    var dataname = $(this).attr("data-name");
                    if (datacode && dataname) {
                        var apiUrl = opts.plateFormUrl + "/api/WebApi/AddVote?jsoncallback=?";
                        var jsonData = {ContestId: datacode}
                        var objChild = $(e.currentTarget);
                        $.post(apiUrl, jsonData,
                            function (data) {
                                if (data == undefined) {
                                    layer.msg("未知错误");
                                    return;
                                }
                                if (data.errorCode == "E000") {
                                    if (parseInt(data.errorMessages) >= 0) {
                                        opts.callBack(data.errorMessages, objChild);
                                    }
                                    //CreatePop4("<div class=\"success\"></div>");
                                }
                                else if (data.errorCode == "E001") {

                                    //CreatePop4("<div class=\"fail\"></div>");
                                }
                                else if (data.errorCode == "E002") {
                                    layer.msg("数据不正确");
                                }

                            }, "json");
                    }
                }
            })
        }
    };

    $.fn.koalavote.defaults = {
        plateFormUrl: "",
        callBack: function () {
        }
    };

})(jQuery);


/******/
var iframeLayer;

function Alert(plateFormUrl, tag, tmpcollectionid) {
    var tmpParameter = "";
    if (tmpcollectionid != undefined) {
        tmpParameter = "cid=" + tmpcollectionid + "&";
    }
    iframeLayer = $.layer({
        type: 2,
        title: false,
        border: [0],
        closeBtn: false,
        area: ['530px', '410px'],
        iframe: {
            src: plateFormUrl + '/dialog/success/' + tag + "?" + tmpParameter + "url=" + encodeURIComponent(window.location),
            scrolling: 'no'
        }
    })
}

function closeLayer(url) {
    if (undefined != iframeLayer && null != iframeLayer) {
        layer.close(iframeLayer);
        iframeLayer = null;
    }
    if (undefined != url && null != url && url != '' && url.length > 0) {
        window.location = decodeURIComponent(url);
    }
}


function CreateLink(file) {
    head = document.getElementsByTagName('head').item(0);
    var new_element;
    new_element = document.createElement("link");
    new_element.setAttribute("type", "text/css");
    new_element.setAttribute("rel", "stylesheet");
    new_element.setAttribute("href", file);
    void (head.appendChild(new_element));
}

function CreateScript(file) {
    head = document.getElementsByTagName('head').item(0);
    var new_element;
    new_element = document.createElement("script");
    new_element.setAttribute("type", "text/javascript");
    new_element.setAttribute("src", file);
    // head.appendChild(new_element);
}

var winLayer2;

var winLayer3;


var winLayer4;

/******/

//设置倒计时页面重定向时间
function replaceToUrl(gourl) {
    setTimeout("window.location.href='" + gourl + "'", 1000);//1000为1秒钟,设置为isecond秒钟。
}