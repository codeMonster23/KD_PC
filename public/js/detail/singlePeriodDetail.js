var url = decodeURI(location.href);
var thname = url.substr(url.lastIndexOf('/') + 1, 10);
var magaCode = thname.substr(0, 4);
var magaYear = thname.substr(4, 4);
var magaPeriod = thname.substr(8, 2);
var periodImg = $('#periodImg');
var periodInfo = $('#periodInfo');
var bookRecommendList = $('#bookRecommendList');
var periodYear = $('#periodYear');
var periodMonth = $('#periodMonth');
var username = $('#username').val();
var isVip = $('#isVip').val();
var isOrg = $('#isOrg').val();


getPeriodYear(magaYear);
getPeriodListByYear(magaYear, magaPeriod);
getPeriodCatalog(thname);
getSinglePeriodDetail(thname);

// 期刊
function getSinglePeriodDetail(thname) {
    var url = '/detail/getSinglePeriodDetail/' + thname;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var data = response.data;
                console.log(data);
                createDetailDom(data);
                createPeriodRecommendDom(data.recommend);
                $('title').html(data.name + '杂志-'+data.year+'年第'+data.period+'期—知网文化');
                $('#periodicalTitle').val(data.name);
            } else {
                //下架
                window.location.href = '/offShelf';
            }
        }
    });
}

function createDetailDom(data) {
    // 在线阅读-------------------
    var readOnline = $('.read-online');
    var uid = readOnline.attr('data-uid');
    var openId = readOnline.attr('data-openid');
    if (uid != '' && openId != '') {
        readOnline.attr('href', 'http://zwwh.cnki.net/onlineread/culture/index?sourceid=10&fName=' + data.thName + '&uid=' + readOnline.attr('data-uid') + '&openid=' + readOnline.attr('data-openid'));
    } else {
        readOnline.removeAttr('target');
        readOnline.attr('href', '/temp/userCenter/login');
    }
    // 在线阅读-------------------

    $('.catalog-tab:eq(1)').attr('href', '/detail/periodDetail/' + magaCode+'#more');
    $('.periodical-collect').attr('data-is-collected', data.iscollect);
    if (data.iscollect && data.iscollect == 1) {
        $('.periodical-collect').addClass('collected');
    }
    $('.breadcrumb .title').html(data.name);
    periodImg.attr('src', data.coverpic);
    periodInfo.attr({ 'data-id': data.thName, 'data-isread': data.isread,'data-libcode': data.subLibraryMarkCode});
    $('.periodical-title').html(data.name);
    $('.periodical-time').html(data.title);
    $('.organizers').html(data.organizers);
    $('.issn').html(data.issn);
    $('.cycle').html(data.magaPrice.periodname);
    $('.cn').html(data.cN || '--');
    $('.lang').html(data.yz502);
    $('.createTime').html(data.ck401 + '年');
    $('.yearprice .periodcount').html(data.magaPrice.periodcount); //  全年总期数
    $('.singleprice .nowprice i').html(data.magaPrice.price); //单期价格
    $('.yearprice .nowprice i').html(data.magaPrice.yearprice); // 整刊优惠价
    $('.yearprice .oldprice').show().find('i').html(parseFloat(data.magaPrice.periodcount*data.magaPrice.price).toFixed(2)); // 按单期买全年价
    $('.yearprice .unitprice i').html(Math.round(data.magaPrice.yearprice / data.magaPrice.periodcount * 100) / 100); // 整刊单期价格
    
    // 停售期刊
    if (data.isread == 3) {
        $('#periodInfo,.single-order,#downloadBtn,#downloadBtn-org').hide();
        $('.stopSellPeriodical').show();
        if (isOrg !== 'true') {
            $('.read-online').hide();
        }else{
            $('.read-online').addClass('read-online-org');
        }
    }

    // 会员及促销活动
    // 倒计时
    function countDown(startTime, endTime, target) {
        var times = (endTime - startTime) / 1000;
        $(target).show();
        setInterval(function() {
            var countdown = $(target).find('.countdown');
            var d = parseInt(times / 60 / 60 / 24);
            d = d < 10 ? '0' + d : d;
            countdown.find('.day').html(d);
            var h = parseInt(times / 60 / 60 % 24);
            h = h < 10 ? '0' + h : h;
            countdown.find('.hour').html(h);
            var m = parseInt(times / 60 % 60);
            m = m < 10 ? '0' + m : m;
            countdown.find('.minute').html(m);
            var s = parseInt(times % 60);
            s = s < 10 ? '0' + s : s;
            countdown.find('.second').html(s);
            times = times - 1;
        }, 1000)
    }
    var shopprice = data.shopprice;
    if(shopprice){
        // 未登录
        if (username == '' || username == 'undefined' || isVip == 'false') {
            if (shopprice.isfree == 1) {
                // 免费价  currenttime freeendtime  freestarttime      
                countDown(shopprice.currenttime, shopprice.freeendtime, '.periodical-activity-free');
                return; // 免费则不显示会员优惠
            }
            if (shopprice.memberisfree == 1) {
                $('.periodical-vip-tip').show().find('.text').html('开通VIP会员，本期免费在线阅读');
            }

            if (shopprice.memberisdiscount == 1) {
                $('.periodical-vip-tip').show().find('.discount').html(shopprice.memberdiscount * 10);
            }
        };
        if (isVip == 'true') {
            if (shopprice.memberisfree == 0 && shopprice.memberisdiscount == 0) {
                if (shopprice.isfree == 1) {
                    countDown(shopprice.currenttime, shopprice.freeendtime, '.periodical-activity-free');
                }
            }
            if (shopprice.memberisfree == 1) {
                // 会员免费                  
                $('.periodical-vip-read').show();
            }
            if (shopprice.memberisdiscount == 1) {
                if (shopprice.isfree == 1) {
                    countDown(shopprice.currenttime, shopprice.freeendtime, '.periodical-activity-free');
                } else {
                    // 会员折扣
                    $('.vip-icon').css('display', 'inline-block'); // 尊享图标
                    $('.singleprice .nowprice i').html(shopprice.memberdiscountprice); // 单期现价
                    $('.singleprice .oldprice i').html(data.magaPrice.price); // 单期原价
                    $('.yearprice .nowprice i').html(shopprice.memberyeardiscountprice); // 整刊价格
                    $('.yearprice .oldprice i').html(data.magaPrice.yearprice); // 整刊价格
                    $('.yearprice .unitprice i').html(Math.round(shopprice.memberyeardiscountprice / data.magaPrice.periodcount * 100) / 100); // 整刊单期价格
                    $('.oldprice').show();
                }
            }
        }
    }
   


    // 分享
    var shareText = '期刊《' + data.name + '》来购买吧！';
    var SetShareUrl = window.location.href;
    // 注意要记得设置onBeforeClick事件， 用于获取动态的文章ID
    window._bd_share_config = {
        common: {
            onBeforeClick: SetShareUrl,
            bdText: shareText,
            bdUrl: SetShareUrl,
        },
        share: [{
            'bdSize': 24
        }]
    };

    with (document) 0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = '/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5)];
    
}
// 推荐阅读
function createPeriodRecommendDom(list) {
    if (list && list.length > 0) {
        var periodRecommendStr = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var organizers = item.organizers ? item.organizers : '';
            var btnStr = '';
            if (item.bdhxf == 1) {
                btnStr += '<span class="sidebar-item-btn sidebar-btn-hexin">核心</span>';
            }
            if (item.isyx == 1) {
                btnStr += '<span class="sidebar-item-btn sidebar-btn-yx">优先</span>';
            }
            var src = 'http://c61.cnki.net/CJFD/big/' + item.code + '.jpg';
            periodRecommendStr += '<div class="single-sidebar-item clearfix"><a href="/detail/singlePeriodDetail/' + item.code + item.lastestyear + item.lastestperiod + '" target="_blank"><img src="' + item.coverpic + '" onerror="javascript:this.src=&apos;' + src + '&apos; ;this.onerror=null;" width="88" height="119"></a><div class="single-sidebar-main"><div class="sidebar-item-title"><a href="/detail/singlePeriodDetail/' + item.code + item.lastestyear + item.lastestperiod + '" target="_blank">' + item.name + '</a></div><div class="sidebar-item-intro">' + organizers + '</div><div class="sidebar-item-btns">' + btnStr + '</div></div></div>';

        }
        bookRecommendList.html(periodRecommendStr);
    }
}

// 整本期刊所有年份
function getPeriodYear(year) {
    var url = '/detail/getPeriodYear/' + magaCode;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var str = '';
                $.each(list, function(index, item) {
                    str += '<option value="' + item.year + '">' + item.year + '年</option>';
                });
                periodYear.html(str);
                periodYear.val(year);


            }
        }
    });
}

var flag = false;

// 获取该年份下的所有期数
function getPeriodListByYear(year, period) {
    var url = '/detail/getPeriodListByYear/' + magaCode + '?year=' + year;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var str = '';
                if (list.length == 0) {
                    str = '<option>暂无数据</option>';
                    return;
                }
                $.each(list, function(index, item) {
                    str += '<option value="' + item.period + '">' + item.period + '期</option>';
                });
                periodMonth.html(str);
                if (period) {
                    periodMonth.val(period);
                }
                if (flag) {
                    getPeriodCatalog(magaCode + year + list[0].period);
                    getSinglePeriodDetail(magaCode + year + list[0].period);
                }
            }
        }
    });
}

// 获取期刊目录
var isall = false;

function getPeriodCatalog(thname) {
    var html = "";
    var url = '/detail/getPeriodCatalog/' + thname;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                renderCatalog(list);
            }
        }
    });
}

//刊内搜索文献结果
function getLiteratureResult(pageNum) {
    var pageNum = pageNum || 1;
    var type = $('.catalog-input-type').val();
    var keyword = $('.catalog-input-search').val();
    var url = encodeURI('/detail/getLiteratureResult?thname=' + thname + '&' + type + '=' + keyword + '&pageNum=' + pageNum);
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                renderCatalog(list, keyword);
            }
        }
    });
}

function renderCatalog(list, keyword) {
    if (list.length <= 0) {
        $("#catelog").html('暂无数据');
        $(".catalog-more").hide();
    } else {
        var sectionindex = 0;
        var map = {},
            result = [];
        $.each(list, function(index, item) {
            if (!map[item.Level]) {
                result.push({
                    Level: item.Level,
                    data: [item]
                });
                map[item.Level] = item;
            } else {
                for (var j = 0; j < result.length; j++) {
                    var dj = result[j];
                    if (dj.Level == item.Level) {
                        dj.data.push(item);
                        break;
                    }
                }
            }

        });
        var icount = 1;
        var html = '';
        for (var i = 0; i < result.length; i++) {
            if (result[i].Level != "" && result[i].Level != null) {
                icount++;
                html += '<li class="catalog-item">' + result[i].Level + '</li>';
            }
            for (var j = 0; j < result[i].data.length; j++) {
                icount++;
                var author = result[i].data[j].Author || '--';
                var pages = result[i].data[j].Page || '--';
                var filename = result[i].data[j].FileName;
                var articleStatus = result[i].data[j].ArticleStatus;
                var articleStatusTitle = result[i].data[j].ArticleStatusTitle;
                // 文献出版状态 1 已勘误 2撤回 3未勘误 4撤稿 5全文替换 6关注 7取消关注 8 撤稿不留原文 
                var status = '';
                if(articleStatus&&articleStatus != 1&&articleStatus != 3&&articleStatus != 5&&articleStatus != 7){
                    status =  '<span class="article-status">'+ articleStatusTitle +'</span>';
                }
                // if (filename.indexOf('~#@') != -1 && filename.indexOf('@#~') != -1) {
                //     filename = filename.replace(/~#@/g, '');
                //     filename = filename.replace(/@#~/g, '');
                // }
                html += '<li class="catalog-subitem clearfix"><a href="" data-filename="'+filename+'" target="_blank"><span class="catalog-subitem-title">' + $.kd.keywordStyleRed(result[i].data[j].Title, '~#@', '@#~', keyword) + '</span>'+ status +'<span class="catalog-subitem-author">' + author + '</span></a></li>';
                if (icount == 21) {
                    html += "<a href=\"javascript:;\" class=\"catalog-more\" id=\"more\">查看更多<img src=\"/images/bookstore/bookstore11.png\"></a>";
                    html += "<div id=\"hiddensecion\" style=\"display:none\">";
                }
            }
            // if (icount == 21) {
            //     html += "<a href=\"javascript:;\" class=\"catalog-more\" id=\"more\">查看更多<img src=\"/images/bookstore/bookstore11.png\"></a>";
            //     html += "<div id=\"hiddensecion\">";
            // }

        }
        if (icount > 21) {
            html += "</div>";
            html += "<a href=\"javascript:;\" class=\"catalog-more\" id=\"nomore\" style=\"display:none\">收起目录<img src=\"/images/bookstore/bookstore19.png\"></a>";
        }
        $("#catelog").html(html);
        bind();
        // 单篇文献点击
        $('.catalog-subitem a').click(function(e) {
            var isread = periodInfo.attr('data-isread');
            var filename = $(this).attr('data-filename');
            var libcode = periodInfo.attr('data-libcode');
            if (libcode.indexOf('V')!=-1 || libcode.indexOf('U')!=-1 || libcode.indexOf('T')!=-1) {
                libcode = libcode.split(';');
                for (var i = 0; i < libcode.length; i++) {
                    var item = libcode[i];
                    if(item =='V' || item=='U' || item=='T'){
                        libcode = item;
                        break;
                    }
                }
                $(this).attr('href', '/literature/literatureDetail?filename=' + filename + '&dbType=CJF' + libcode);
            } else {
                $(this).removeAttr('target');
                $(this).attr('href', 'javascript:;');

                if (isread != 3) {
                    layer.msg('订购本刊后您即可阅读！');
                }
            }
        });
    }
}

// 目录展开收起
function bind() {
    $('.catalog-more').click(function() {
        if (isall == false) {
            isall = true;
            $("#more").hide();
            $("#nomore").show();
            $("#hiddensecion").show();
        } else {
            isall = false;
            $("#nomore").hide();
            $("#more").show();
            $("#hiddensecion").hide();
        }
    });
}

// 年切换
periodYear.on('change', function() {
    flag = true;
    var year = $(this).val();
    getPeriodListByYear(year);
});
// 刊期切换
periodMonth.on('change', function() {
    var year = periodYear.val();
    var period = $(this).val();
    getPeriodCatalog(magaCode + year + period);
    getSinglePeriodDetail(magaCode + year + period);
});

// 搜索
var searchBtn = $('#literatureSearchBtn');
searchBtn.on('click', function() {
    var keyword = $(this).siblings('input').val();
    if (keyword.trim().length == 0) {
        getPeriodCatalog(thname);
        return;
    }
    getLiteratureResult();
});
// 点击收藏
$('.periodical-collect').click(function() {
    if (username != 'undefined' && username.length > 0) {
        var $this = $(this);
        var id = periodInfo.attr('data-id');
        var title = $('#periodicalTitle').val();
        var index = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        var isCollected = $(this).attr('data-is-collected');
        if (parseInt(isCollected) == 0) {
            getCollectedData(1,4,id,title,index);
        }else{
            // 取消收藏
            collectOrNot(id, 4, isCollected, index, $(this), title);
        }
    } else {
        // layer.msg('请先登录！')
        var collectionPopLayer = layer.open({
            title: ['', 'height:0; border-top:3px solid #ee8d6d'],
            type: 1,
            area: ['274px', '180px'], //宽高
            content: $('.collectionPopWrap').html(),
        });
        $('.b2').click(function(){
            layer.close(collectionPopLayer);
        })
        
    }
});

// 收藏或者取消收藏方法
function collectOrNot(id, typeId, isCollected, index, pointer, title) {
    var url = encodeURI('/common/collectOrNot?id=' + id + '&typeId=' + typeId + '&isCollected=' + isCollected + '&title=' + title);

    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        success: function(response) {
            layer.close(index);
            if (response.code == 0) {
                pointer.toggleClass('collected');
                if (response.data.status == 1) {
                    pointer.attr('data-is-collected', '1');
                    layer.msg('收藏成功！');
                } else if (response.data.status == 0) {
                    pointer.attr('data-is-collected', '0');
                    layer.msg('取消收藏成功！');
                }
            } else if (response.code == -1) {
                layer.msg(response.msg)
            } else {
                console.log('请检查收藏或者取消收藏方法接口！')
            }
        },
        error: function(error) {
            //请求出错处理
            console.log(error);
        }
    });
}
// 获取收藏数据
function getCollectedData(pageNum, typeId,foreignkeyId,foreignName,index) {
    var url = encodeURI('/pc/singleCollected?pageNum=' + pageNum+'&type=-1');
    $.ajax({
        url: url,
        dataType: "json",
        type: "GET",
        success: function (response) {
            layer.close(index);
            if (response.code == 0) {
                layer.open({
                    type: 2,
                    title: ['添加到收藏夹', 'height: 42px; line-height: 42px; padding-left: 15px; color: #ffffff; font-size: 16px; font-weight: normal;background-color: #E64A3C; color:#fff;'],
                    shade: 0.8,
                    area: ['430px', '540px'],
                    content:  '/pc/transfer?typeId='+typeId+'&foreignkeyId='+foreignkeyId+'&foreignName='+foreignName+'&isPersonalCenter=0'
                });
            }
        }
    });
}
// 下载
$('#downloadBtn').click(function() {
    var periodId = periodInfo.attr('data-id');
    var periodCode = periodId.substr(0, 4);
    var orderInput = $('.order-inputs input[name=order]');
    var orderInputChecked = orderInput.filter(':checked');
    var ordertype = parseInt(orderInputChecked.attr('data-type'));
    var year = $('.periodical-time').html().substr(0, 4);
    var title = $('.periodical-title').html();
    var period = '';
    if (orderInput.eq(0).is(':checked')) {
        period = $('.periodical-time').html().substr(5, 2);
    }
    if (username == '' || username == 'undefined') {
        location.href = '/temp/userCenter/login';
        return;
    }
    var url = '/detail/isPurchase/' + periodCode + '?ordertype=' + ordertype + '&year=' + year + '&period=' + period;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            var isPurchase = response.HasRight;
            if (isPurchase) {
                // 跳到我的已购期刊列表
                location.href = encodeURI('/pc/purchased?typeId=2');
            } else {
                layer.open({
                    type: 1,
                    skin: 'layer1',
                    title: ['温馨提示'],
                    closeBtn: 1,
                    area: ['472px', '262px'],
                    shadeClose: true,
                    resize: false,
                    btn: ['确定'],
                    btnAlign: 'c',
                    content: '<p>您尚未订购《' + title + '》<br>请先购买再下载!</p>'
                });
            }
        }
    });

});
// 订阅
$('#orderBtn').click(function() {
    var periodId = periodInfo.attr('data-id');
    var periodCode = periodId.substr(0, 4);
    var orderInput = $('.order-inputs input[name=order]');
    var orderInputChecked = orderInput.filter(':checked');
    var ordertype = parseInt(orderInputChecked.attr('data-type'));
    var year = $('.periodical-time').html().substr(0, 4);
    var title = $('.periodical-title').html();
    var price = orderInputChecked.parent().find('.nowprice i').html();
    var coverPic = periodImg.attr('src');
    var period = '';
    if (orderInput.eq(0).is(':checked')) {
        period = $('.periodical-time').html().substr(5, 2);
    }

    if (username == '' || username == 'undefined') {
        location.href = '/temp/userCenter/login';
        return;
    }

    var isOrg = $(this).attr('data-isOrg');
    if (isOrg == 'true') {
        // layer.msg('当前为机构账号，不支持此操作，请登录个人账号购买');
        layer.open({
            type: 1,
            skin: 'layer2',
            title: ['温馨提示'],
            area: ['512px', '208px'],
            btn: ['登录个人账号','取消'],
            btnAlign: 'c',
            content: '当前为机构账号，不支持订阅书刊，请注册个人账号订阅！',
            yes: function (index, layero) {
                window.location.href = '/temp/userCenter/login';
                layer.close(index); 
            }
        })
        return;
    }
    var url = '/detail/isPurchase/' + periodCode + '?ordertype=' + ordertype + '&year=' + year + '&period=' + period;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            var isPurchase = response.HasRight;
            if (isPurchase) {
                // 跳到我的已购期刊列表
                location.href = encodeURI('/pc/purchased?typeId=2');
            } else {
                location.href = encodeURI('/payment/checkout?code=' + periodCode + '&year=' + year + '&period=' + period + '&title=' + title + '&ordertype=' + ordertype + '&coverPic=' + coverPic + '&price=' + price);
            }
        }
    });

});

$(".periodical-share").click(function() {
    if ($(".periodical-share-more").is(":visible")) {
        $(".periodical-share-more").hide();
    } else {
        $(".periodical-share-more").show();
    }
});