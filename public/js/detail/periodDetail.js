var url = decodeURI(location.href);
var magaCode = url.substr(url.lastIndexOf('/') + 1, 4);
var anchor = url.substr(url.lastIndexOf('#') + 1);

var paramYear = parseInt($.kd.getparams("year")) || '';
var periodInfo = $('#periodInfo');
var periodicalYears = $('#periodicalYears');
var periodicalItems = $('#periodicalItems');
var periodicalPages = $('#periodicalPages');
var columnsPages = $('#columnsPages');
var literaturePages = $('#literaturePages');
$("#tab1").click(function() {
    $(this).addClass("periodical-tab-select");
    $("#tab2").removeClass("periodical-tab-select");
    $("#tab1-body").css('display', 'block');
    $("#tab2-body").css('display', 'none');
})
$("#tab2").click(function() {
    $(this).addClass("periodical-tab-select");
    $("#tab1").removeClass("periodical-tab-select");
    $("#tab1-body").css('display', 'none');
    $("#tab2-body").css('display', 'block');
    getPeriodColumn();
})

var tabsOffsetTop = $('.periodical-tabs').offset().top;
$(window).scrollTop(5000);

// if(anchor=='more'){
// }
getperiodDetail();
// 期刊
function getperiodDetail() {
    var url = '/detail/getSinglePeriodDetail/' + magaCode + '201901';
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var data = response.data;
                $('title').html(data.name + '_期刊_知网文化');
                $('.breadcrumb .title').html(data.name);
                periodInfo.find('.periodical-book img').attr('src', 'http://c61.cnki.net/CJFD/big/' + data.code + '.jpg');
                periodInfo.find('.periodical-title').html(data.name);
                periodInfo.find('.periodical-time').html(data.title);
                $('#eName').html(data.eName);
                $('#organizers').html(data.organizers);
                $('#issn').html(data.issn);
                $('#cycle').html(data.magaPrice.periodname);
                $('#cn').html(data.cN || '--');
                $('#publishPlace').html(data.cbd403);
                $('#yfdh').html(data.yf104 || '--');
                $('#lang').html(data.yz502);
                $('#createTime').html(data.ck401 + '年');
                if (data.inclusionStartYear && data.inclusionEndYear) {
                    $('#inclusionYear').html(data.inclusionStartYear + '-' + data.inclusionEndYear + '年');
                } else {
                    $('#inclusionYear').html('--');
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
        }
    });
}
getPeriodYear();
getPeriodListByYear();
// 整本期刊所有年份
function getPeriodYear() {
    var url = '/detail/getPeriodYear/' + magaCode;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                if (paramYear == '') {
                    var str = '<a href="javascript:;" class="periodical-year periodical-year-select">全部</a>';
                } else {
                    var str = '';
                }
                $.each(list, function(index, item) {
                    if (paramYear == item.year) {
                        str += '<a href="javascript:;" data-year="' + item.year + '" class="periodical-year periodical-year-select">' + item.year + '年</a>';
                    } else {
                        str += '<a href="javascript:;" data-year="' + item.year + '" class="periodical-year">' + item.year + '年</a>';
                    }
                });
                periodicalYears.html(str);
            }
        }
    });
}

// 获取刊期列表
function getPeriodListByYear(year, pageNum) {
    var year = year || '';
    var pageNum = pageNum || 1;
    var limit = 12;
    var url = '/detail/getPeriodListByYear/' + magaCode;
    $.ajax({
        type: "GET",
        url: url,
        data: {
            year: year,
            pageNum: pageNum,
            limit: limit,
        },
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var total = response.data.total;
                var str = '';
                if (list && list.length == 0) {
                    periodicalItems.html('暂无数据');
                    periodicalPages.html('');
                    return;
                }
                $.each(list, function(index, item) {
                    var src = 'http://c61.cnki.net/CJFD/big/' + item.code + '.jpg';
                    str += '<a class="periodical-item" title="' + item.year + '年第' + item.period + '期" href="/detail/singlePeriodDetail/' + item.thname + '" target="_blank"><div class="periodical-img"><img src="' + item.coverpic + '" onerror="javascript:this.src=&apos;' + src + '&apos; ;this.onerror=null;"></div><div class="periodical-item-title">' + item.year + '年第' + item.period + '期</div></a>';
                });
                periodicalItems.html(str);
                var pageStr = $.kd.outputPager(total, limit, 5, pageNum);
                periodicalPages.html(pageStr);
            }
        }
    });
}
periodicalYears.on('click', 'a', function() {
    $(this).addClass('periodical-year-select').siblings().removeClass('periodical-year-select');
    var year = $(this).attr('data-year');
    getPeriodListByYear(year);
});
// 期刊页码
periodicalPages.on('click', 'a', function() {
    var year = $('.periodical-year-select').attr('data-year');
    var pageNum = $(this).attr('data-page');
    getPeriodListByYear(year, pageNum);
});

// 获取栏目
function getPeriodColumn(pageNum) {
    var pageNum = pageNum || 1;
    var url = '/detail/getPeriodColumn/' + magaCode + '?pageNum=' + pageNum;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var total = response.data.total;
                var str = '';
                if (list && list.length == 0) {
                    columnsPages.html('');
                    return;
                }
                $.each(list, function(index, item) {
                    if (index == 0) {
                        str += '<a href="javascript:;" class="column column-select">' + item + '</a>';
                    } else {
                        str += '<a href="javascript:;" class="column">' + item + '</a>';
                    }

                });
                $('.columns-number strong').html(total);
                $('.columns').html(str);
                var pageStr = $.kd.yyoutputPager(total, 5, 3, pageNum);
                columnsPages.html(pageStr);
                var level = $('.column-select').html();
                getLiteratureByColumn(level);
            }
        }
    });
}
// 栏目页码
columnsPages.on('click', 'a', function() {
    var pageNum = $(this).attr('data-page');
    getPeriodColumn(pageNum);
});
// 栏目点击
$(".columns").on('click', 'a', function() {
    $(this).addClass("column-select").siblings().removeClass('column-select');
    var level = $('.column-select').html();
    getLiteratureByColumn(level);
});
// 按栏目获取文献列表
function getLiteratureByColumn(level, pageNum) {
    var pageNum = pageNum || 1;
    $('.column-right-title').html(level);
    var url = encodeURI('/detail/getLiteratureByColumn/' + magaCode + '?level=' + level + '&pageNum=' + pageNum);
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var list = response.data.list;
                var total = response.data.total;
                var str = '';
                $.each(list, function(index, item) {
                    str += '<div class="column-right-item  clearfix">' +
                        '<a href="/literature/literatureDetail?filename=' + item.FileName + '&dbType=' + item.DBName.substring(0, 4) + '" target="_blank" class="column-right-content"><span>' + item.Title + '</span></a>' +
                        '<div class="column-right-time">' + item.Year + '年' + item.Period + '期</div>' +
                        '<div class="column-right-author">' + item.Author + '</div>' +
                        '</div>';

                });
                $('.column-right-numbers strong').html(total);
                $('.column-right-itmes').html(str);
                var pageStr = $.kd.outputPager(total, 10, 5, pageNum);
                literaturePages.html(pageStr);
            }
        }
    });
}
// 文献页码
literaturePages.on('click', 'a', function() {
    var level = $('.column-select').html();
    var pageNum = $(this).attr('data-page');
    getLiteratureByColumn(level, pageNum);
});

$(".periodical-share").click(function() {
    if ($(".periodical-share-more").is(":visible")) {
        $(".periodical-share-more").hide();
    } else {
        $(".periodical-share-more").show();
    }
});