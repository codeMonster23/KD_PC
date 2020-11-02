var maxBindNum = 2;

function setDownloadTag(isAllow) {
    $(".tabcont").off("click",".button_bg_download");
    //    if (!cnkibrowser.msie && !cnkibrowser.firefox)
    //    {
    //        $(".button_bg_download").click(function ()
    //        {
    //            alert("下载功能只在IE或火狐浏览器下支持！");
    //            return false;
    //        });
    //        $(".button_bg_download").attr("href", "#");
    //        return;
    //    }
    if (isAllow == undefined)
        return;
    $(".tabcont").off("click",".button_bg_download");
    if (isAllow) {
        $(".tabcont").on("click",".button_bg_download",function () {
            return true;
        });
    } else {
        //如果电脑没有获得授权
        $(".tabcont").on("click",".button_bg_download",function () {
            layer.open({
                title: ['温馨提示'],
                content: '这台电脑尚未授权，您要给予授权吗？<br/>阅读下载的书刊，您必须先授权这台电脑，每个账号最多可以同时授权' + maxBindNum + '台电脑。',
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    RegisterMachine(drmUserName, drmSvrIp);
                },
                btn2: function (index, layero) {},
                cancel: function () {}
            });
            return false;
        });
        //$(".button_bg_download").attr("href", "#");
    }
}

function RegisterMachine(UserName, SvrIP) {
    var ret = 0;
    try {
        if (!cnkibrowser.msie && !cnkibrowser.firefox)
            ret = SysInfoAx.RegistryMachine1("http://" + SvrIP + "/DRMMngr/request/CertHandler.ashx", UserName, true, "ttkn");
        else
            ret = document.SysInfoAx.RegistryMachine1("http://" + SvrIP + "/DRMMngr/request/CertHandler.ashx", UserName, true, "ttkn");
        var trecount = getregistercount;
        var srecount = "";
        var srecount2 = "";
        if (trecount == 0) {
            srecount = "此电脑已得到授权，您可以下载阅读书刊啦！\n您最多可以同时对两台电脑进行授权。包括此电脑您已授权了一台";
            srecount2 = "此电脑已得到授权，您可以下载阅读书刊啦！\n您最多可以同时对两台电脑进行授权。包括此电脑您已授权了一台";
        } else {
            srecount = "此电脑已得到授权，您可以下载阅读书刊啦！\n您最多可以同时对两台电脑进行授权。包括此电脑您已授权了两台";
            srecount2 = "此电脑已得到授权，您可以下载阅读书刊啦！\n您最多可以同时对两台电脑进行授权。包括此电脑您已授权了一台";
        }
        if (ret == 0) {
            ShowUnRegInfo();
            layer.open({
                title: '绑定授权成功',
                content: '您可以在本机下载、阅读、复制或打印书刊'
            });
            //alert(srecount);
        } else if (ret == 11) {
            ShowUnRegInfo();
            layer.open({
                title: '绑定授权成功',
                content: '您可以在本机下载、阅读、复制或打印书刊'
            });
            //alert(srecount2); 
        } else if (ret == 14) {
            layer.open({
                title: '温馨提示',
                content: '您已授权' + maxBindNum + '台电脑下载阅读书刊，如果您需要在本台电脑进行下载阅读，请先取消其他电脑的授权。'
            });
            //alert("您已授权两台电脑下载阅读书刊，如需在本电脑下载阅读，请先取消原有电脑的授权");
        } else {
            ShowRegInfo();
            var msg = getDrmBindMsg(ret, 1);
            showTigMsg(ret, msg);
            //alert("授权失败--" + msg);
        }
    } catch (ee) {
        if (!cnkibrowser.msie && !cnkibrowser.firefox)
            ret = 1001;
        else
            ret = 1000;
        var msg = getDrmBindMsg(ret, 0);
        showTigMsg(ret, msg);
        //alert("绑定授权失败\n" + msg);
    }
}

function UnRegisterMachine(UserName, SvrIP) {
    layer.open({
        title: ['温馨提示'],
        content: '您确定要取消对此电脑的授权？将不能执行书刊下载阅读操作！',
        btn: ['确定', '取消'],
        yes: function (index, layero) {
            try {
                if (!cnkibrowser.msie && !cnkibrowser.firefox)
                    ret = SysInfoAx.RegistryMachine1("http://" + SvrIP + "/DRMMngr/request/CertHandler.ashx", UserName, false, "ttkn");
                else
                    ret = document.SysInfoAx.RegistryMachine1("http://" + SvrIP + "/DRMMngr/request/CertHandler.ashx", UserName, false, "ttkn");
                //alert(ret);
                if (ret == 0 || ret == 10) {
                    var alertContent = (ret == 0) ? "您已成功取消对这台电脑的授权。" : "该电脑还未授权";
                    ShowRegInfo();
                    //alert(alertContent);
                    layer.open({
                        title: '取消绑定授权成功',
                        content: alertContent
                    });
                } else {
                    ShowUnRegInfo();
                    var msg = getDrmBindMsg(ret, 0);
                    showTigMsg(ret, msg);
                    //alert("取消授权失败--" + msg);
                }
            } catch (ee) {
                if (!cnkibrowser.msie && !cnkibrowser.firefox)
                    ret = 1001;
                else
                    ret = 1000;
                var msg = getDrmBindMsg(ret, 0);
                showTigMsg(ret, msg);
                //alert("取消授权失败\n" + msg);
            }
        },
        btn2: function (index, layero) {},
        cancel: function () {}
    });
}

function ShowRegInfo() {
    setDownloadTag(false);
    $(".remind").show();
    $(".registermachinejs").html('本电脑尚未获得下载阅读书刊的授权，您可以');
    $(".registermachinejs2").html('(您最多可同时授权2台电脑)');
    $(".registermachinejsbtn").html('授权给本电脑').removeClass("remind_button_canel").addClass("remind_button");
    $(".registermachinejsbtn").unbind('click');
    $(".registermachinejsbtn").click(function () {
        RegisterMachine(drmUserName, drmSvrIp)
    });
    //document.getElementById("registermachinejsbtn").onclick = function reg1() { RegisterMachine(drmUserName, drmSvrIp) };
}

function ShowUnRegInfo() {
    setDownloadTag(true);
    $(".remind").show();
    $(".registermachinejs").html('本电脑已获得下载阅读书刊的授权，您可以');
    $(".registermachinejs2").html('');
    $(".registermachinejsbtn").html('取消授权').removeClass("remind_button").addClass("remind_button_canel");
    $(".registermachinejsbtn").unbind('click');
    $(".registermachinejsbtn").click(function () {
        UnRegisterMachine(drmUserName, drmSvrIp)
    });
    //document.getElementById("registermachinejsbtn").onclick = function unreg1() { UnRegisterMachine(drmUserName, drmSvrIp) };
}

function ShowOutAllowRegInfo() {
    setDownloadTag(false);
    $(".remind").show();
    $(".registermachinejs").html('您已授权两台电脑下载阅读书刊，如需在本电脑下载阅读，请先取消原有电脑的授权');
    $(".registermachinejs2").html('');
    $(".registermachinejsbtn").hide();
}

function Query(UserName, SvrIP, showAlert) {
    showAlert = showAlert == undefined ? false : showAlert;
    var tmpCount = iTotalOrderCount;
    var ret = 0;
    if (tmpCount == 0) {
        $(".remind").show();
        ret = 1002;
    } else {
        try {
            //http://192.168.20.141:8050/DRMMngr/request/CertHandler.ashx
            if (!cnkibrowser.msie && !cnkibrowser.firefox)
                ret = SysInfoAx.RegistryMachine1("http://" + SvrIP + "/DRMMngr/request/CertHandler.ashx?pn=ttkn&q=1", UserName, true, "ttkn");
            else
                ret = document.SysInfoAx.RegistryMachine1("http://" + SvrIP + "/DRMMngr/request/CertHandler.ashx?pn=ttkn&q=1", UserName, true, "ttkn");
            //alert(ret);
            //at 2014-12-01经过测试ret=0时也注册成功
            if (ret == 0 || ret == 11) {
                ShowUnRegInfo();
            } else {
                ShowRegInfo();
            }
        } catch (ee) {
            $(".remind").show();
            if (!cnkibrowser.msie && !cnkibrowser.firefox)
                ret = 1001;
            else
                ret = 1000;
            ShowRegInfo();
            var msg = getDrmBindMsg(ret, 0);
            if (showAlert) {
                showTigMsg(ret, msg);
            }
        }
    }
    return ret;
}

function showTigMsg(code, msg) {
    if (code == 1000 || code == 1) {
        layer.open({
            title: ['温馨提示'],
            content: msg,
            btn: ['下载阅读器', '取消'],
            yes: function (index, layero) {
                if (document.getElementById("aDrmCajViewerDownload") != null) {
                    document.getElementById("aDrmCajViewerDownload").click();
                }
            },
            btn2: function (index, layero) {},
            cancel: function () {}
        });
    } else if (code == 2 || code == 3) {
        //DownDrm.createNew().dialog2("温馨提示", msg, "查看如何启动服务项", function () {
        //    if (document.getElementById("aDrmHelpAnswer") != null) {
        //        document.getElementById("aDrmHelpAnswer").click();
        //    }
        //});
        layer.open({
            title: '温馨提示',
            content:msg
        });
    } else {
        layer.open({
            title: '温馨提示',
            content: msg
        });
    }
}

function getDrmBindMsg(code, type) {
    //code:返回代码; type:操作类别 0:解绑,1:绑定
    //var msg = "请您检查是否已经正确安装CAJ阅读器和绑定授权控件，并且启动了CAJ Service Host服务项。";
    var msg = "此电脑尚未安装CAJViewer阅读器，请先下载安装阅读器后刷新本页面即完成授权！";
    switch (code) {
        case 0:
            if (type == 1)
                msg = "绑定授权成功";
            else
                msg = "解除绑定授权成功";
        case 1:
            //msg = "请您检查是否已经正确安装CAJ阅读器和绑定授权控件";
            msg = "此电脑尚未安装CAJViewer阅读器，请先下载安装阅读器后刷新本页面再进行授权！";
            break;
        case 2:
        case 3:
            //msg = "请检查是否启动了CAJ Service Host服务项";
            msg = "此电脑的CAJ Service Host服务项启动异常，请重新启动后刷新页面再进行授权！";
            break;
        case 4:
            msg = "网络连接问题,请检查http://malldrm.cnki.net是否访问正常";
            break;
        case 5:
        case 6:
        case 7:
            msg = "授权服务器访问异常";
            break;
        case 8:
            msg = "访问信息异常";
            break;
        case 9:
            msg = "授权服务器响应异常";
            break;
        case 10:
            if (type == 0)
                msg = "解除绑定授权成功";
            else
                msg = "该计算机还没有绑定授权";
            break;
        case 11:
            if (type == 1)
                msg = "已经绑定授权成功";
            else
                msg = "超出绑定授权界限";
            break;
        case 12:
            msg = "密钥写出到系统时出错";
            break;
        case 13:
            msg = "写出到系统目录出错";
            break;
        case 14:
            msg = "您已授权" + maxBindNum + "台电脑下载阅读文集，如果您需要在本台电脑进行下载阅读，请先取消其他电脑的授权。";
            break;
        case 15:
            msg = "写入到授权系统出错";
            break;
        case 16:
            msg = "用户校验出错";
            break;
        case 1001:
            msg = "请使用IE浏览器进行授权设置和下载，暂不支持Chrome、Safari、Opera等浏览器<br/>如果您使用的是搜狗、QQ等浏览器请使用IE兼容模式进行授权设置和下载";
            break;
    }
    return msg + "_" + code;
}

function downloadMagaSpace(downloadUrl) {
    var errorId = Query(uname, svrip);
    if (errorId == 11) {
        if (downloadUrl != "") {
            window.open(downloadUrl);
        }
    } else if (errorId == 10) {
            layer.open({
                title: ['温馨提示'],
                content: '这台电脑尚未授权，您要给予授权吗？<br/>阅读下载的书刊，您必须先授权这台电脑，每个账号最多可以同时授权' + maxBindNum + '台电脑。',
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    RegisterMachine(drmUserName, drmSvrIp);
                },
                btn2: function (index, layero) {},
                cancel: function () {}
            });
    } else if (errorId == 1000) {
        //        if (cnkibrowser.msie)//IE
        //        {
        //**window.open("RegisterMachine.aspx");
        // window.showModalDialog("RegisterMachine.aspx", null, "dialogWidth:760px;dialogHeight:200px;status:no;help:no");
        //        }
        //        else
        //        {
        //            alert("下载只在IE浏览器下支持！");
        //        }
        layer.open({
            title: '温馨提示',
            content:'授权遇到问题，请与管理员联系'
        });
    } else {

        layer.open({
            title: '温馨提示',
            content:'授权遇到问题，请与管理员联系'
        });
    }
}

var cnkibrowser = {};

function userBrowser() {
    var userAgent = navigator.userAgent,
        rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
        rFirefox = /(firefox)\/([\w.]+)/,
        rOpera = /(opera).+version|(opr)\/([\w.]+)/,
        //rOpera = /(opera).+version\/([\w.]+)/,
        rChrome = /(chrome)\/([\w.]+)/,
        rSafari = /version\/([\w.]+).*(safari)/;
    var ua = userAgent.toLowerCase();

    var version = "0";
    var match = rMsie.exec(ua);
    if (match != null) {
        cnkibrowser.msie = true;
        cnkibrowser.name = "msie";
        version = match[2] || "0";
    }
    match = rFirefox.exec(ua);
    if (match != null) {
        cnkibrowser.firefox = true;
        cnkibrowser.name = match[1] || "firefox";
        version = match[2] || "0";
    }
    match = rChrome.exec(ua);
    if (match != null) {
        cnkibrowser.chrome = true;
        cnkibrowser.name = match[1] || "chrome";
        version = match[2] || "0";
    }
    match = rOpera.exec(ua);
    if (match != null) {
        cnkibrowser.opera = true;
        cnkibrowser.name = match[1] || "opera";
        version = match[2] || "0";
        if (match.length > 3) {
            version = match[3] || "0";
        }
    }
    match = rSafari.exec(ua);
    if (match != null) {
        cnkibrowser.safari = true;
        cnkibrowser.name = match[1] || "safari";
        version = match[2] || "0";
    }
    var num = parseInt(version);
    cnkibrowser.version = isNaN(num) ? 0 : num;
}