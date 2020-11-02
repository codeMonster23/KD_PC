// 'use strict';

var url = decodeURI(location.href);
var id = url.substr(url.lastIndexOf('/') + 1);
var bookImg = $('#book-img').find('.book-image');
var bookInfo = $('#bookInfo');
var bookDes = $('#bookDes');
var recommendWord = $('#recommendWord');
var authorDes = $('#authorDes');
var catalog = $('#catalog');
var bookRecommendList = $('#slide').find('.imageList');
var toggleBtn = $('.book-detail-more');
var bookCommentList = $('#bookCommentList');
var bookHotBankList = $('#bookHotBankList');
var loadingMore = $('#loadingMore');
var commentBtn = $('#commentBtn');
var commentInput = $('#commentInput');
var username = $('#username').val();
var isVip = $('#isVip').val();
var isOrg = $('#isOrg').val();
var bookTitle = '';
var phoneNumInput = $('#bindPhoneNum');
var sendCaptcha = $('#sendCaptcha');
var isRegistered = 1;
var repeatTime = 60; // 短信重发时间间隔
var captcha = $('#captcha');

getBookHotBank();
getCommentList();
getBookDetail();

function getBookDetail() {
    var url = '/detail/getBookDetail/' + id;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var bookrecommend = response.data.bookrecommend;
                var bookinfo = response.data.bookinfo;
                createBookInfoDom(response.data);
                createBookRecommendDom(bookrecommend);
            } else {
                //图书下架
                window.location.href = '/offShelf';
            }
        }
    });
}

// 图书信息
function createBookInfoDom(data) {
    var bookinfo = data.bookinfo;
    var title = bookinfo.title;
    var code = bookinfo.sku;
    var shopprice = data.shopprice;
    var authorStr = '';

    // 在线阅读-------------------
    var readOnline = $('.read-online');
    var uid = readOnline.attr('data-uid');
    var openId = readOnline.attr('data-openid');
    if (uid != '' && openId != '') {
        readOnline.attr('href', 'http://zwwh.cnki.net/onlineread/culture/index?sourceid=20&fName=' + code + '&uid=' + readOnline.attr('data-uid') + '&openid=' + readOnline.attr('data-openid'));
    } else {
        readOnline.removeAttr('target');
        readOnline.attr('href', '/temp/userCenter/login');
    }
    // 在线阅读-------------------

    bookInfo.attr('data-id', bookinfo.sku);
    bookImg.attr('src', bookinfo.coverpic);
    bookInfo.find('.book-title').html(bookinfo.title);
    $('title').html(bookinfo.title + '_图书_知网文化');
    bookTitle = bookinfo.title;
    bookInfo.find('.book-des').html(bookinfo.adinfo ? bookinfo.adinfo : '');
    if (bookinfo.author.indexOf('#') != -1) {
        authorStr = bookinfo.author.split('#').join(' ');
    } else {
        authorStr = bookinfo.author;
    }
    bookInfo.find('.book-author').html('<span>' + authorStr + '<span> 著');
    bookInfo.find('.book-publisher').html(bookinfo.publisher);
    bookInfo.find('.book-pubtime').html(bookinfo.pubtime ? $.kd.dateFormat(bookinfo.pubtime) : '--');
    bookInfo.find('.isbn').html(bookinfo.isbn || '--');
    bookInfo.find('.wordcount').html(bookinfo.wordcount || '--');
    bookDes.html(bookinfo.bookdes);
    $('.book-collect').attr('data-is-collected', bookinfo.iscollect);
    if (bookinfo.iscollect && bookinfo.iscollect == 1) {
        $('.book-collect').addClass('collected');
    }
    // 推荐语
    if (bookinfo.recommendation) {
        recommendWord.html(bookinfo.recommendation);
    } else {
        recommendWord.prev('.book-title').hide();
    }
    // 作者
    if (bookinfo.authordes) {
        authorDes.html(bookinfo.authordes);
    } else {
        authorDes.prev('.book-title').hide();
        $('.main-nav-item:eq(1)').hide();
    }
    // 目录
    var catalogArr = '';
    var catalogStr = '';

    if (bookinfo.wonderfulbook && bookinfo.wonderfulbook !='') {
        catalogArr = JSON.parse(bookinfo.wonderfulbook);  
    } else {
        catalog.prev('.book-title').hide();
    }

    for (var i = 0; i < catalogArr.length; i++) {
        var item = catalogArr[i];
        if (item.Grade == 1) {
            catalogStr += '<p class="book-catalog">' + item.Title + '</p>';
        } else {
            catalogStr += '<p class="book-catalog-sub">' + item.Title + '</p>';;
        }
    }
    catalog.html(catalogStr);

    // 目录作者展开收起
    var catalogHeight = catalog.height();
    var authorDesHeight = authorDes.height();
    if (catalogHeight > 450) {
        catalog.addClass('fold').next('.book-detail-more').show();

    }
    if (authorDesHeight > 210) {
        authorDes.addClass('fold').next('.book-detail-more').show();
    }

    toggleBtn.click(function() {
        if ($(this).prev('.contentBox').hasClass('fold')) {
            $(this).html('收起全部');
            $(this).prev('.contentBox').removeClass('fold');
        } else {
            $(this).html('查看全部');
            $(this).prev('.contentBox').addClass('fold');
        }
    })

    // 分享
    var shareText = '书刊《' + title + '》来购买吧！';
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
    // 会员及促销活动

    // 倒计时
    function countDown(startTime, endTime, target) {
        var times = (endTime - startTime) / 1000;
        if (target == '.book-activity-free' || target == '.book-vip-free') {
            $('.book-activity-free').show();
        } else if (target == '.book-activity-sale') {
            $('.book-activity-sale').show();
        }
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

    if (shopprice) {
        if (username == '' || username == 'undefined' || isVip == 'false') {
            $('.book-realprice').show();
            if (shopprice.isfree == 1) {
                // 免费价  currenttime freeendtime  freestarttime      
                countDown(shopprice.currenttime, shopprice.freeendtime, '.book-activity-free');
                $('.book-realprice').html('电子版价格：<span>免费</span><span class="oldprice">原价：<strong>￥<i>' + bookinfo.realprice + '</i></strong></span>');
                return;
            } else if (shopprice.issale == 1) {
                // 促销价 currenttime saleendtime  salestarttime
                countDown(shopprice.currenttime, shopprice.saleendtime, '.book-activity-sale');
                $('.book-realprice').html('电子版价格：<span>￥<i class="realprice">' + shopprice.price + '</i></span><span class="oldprice">原价：<strong>￥<i>' + bookinfo.realprice + '</i></strong></span>');
            } else {
                // 无免费和促销显示原价
                $('.book-realprice').html('电子版价格：<span>￥<i class="realprice">' + bookinfo.realprice + '</i></span>');
            }
    
            if (shopprice.memberisfree == 1) {
                $('.book-vip-tip').show().find('span').html('开通VIP会员，该书尊享免费');
            }
    
            if (shopprice.memberisdiscount == 1) {
                if (shopprice.issale == 1) {
                    if (shopprice.saleprice > shopprice.memberdiscountprice) {
                        $('.book-vip-tip').show().find('span').html('开通VIP会员，该书尊享' + shopprice.memberdiscount * 10 + '折特惠');
                    }
                } else {
                    $('.book-vip-tip').show().find('span').html('开通VIP会员，该书尊享' + shopprice.memberdiscount * 10 + '折特惠');
                }
            }
        };
        if (isVip == 'true') {
            // 会员
            $('.book-vip-tip').hide();
    
            if (shopprice.memberisfree == 0 && shopprice.memberisdiscount == 0) {
                // 无会员优惠 
                $('.book-realprice').show();
                if (shopprice.isfree == 1) {
                    // 免费价     
                    countDown(shopprice.currenttime, shopprice.freeendtime, '.book-activity-free');
                    $('.book-realprice').html('电子版价格：<span>免费</span><span class="oldprice">原价：<strong>￥<i>' + bookinfo.realprice + '</i></strong></span>');
                    return;
                } else if (shopprice.issale == 1) {
                    // 促销价 
                    countDown(shopprice.currenttime, shopprice.saleendtime, '.book-activity-sale');
                    $('.book-realprice').html('电子版价格：<span>￥<i class="realprice">' + shopprice.price + '</i></span><span class="oldprice">原价：<strong>￥<i>' + bookinfo.realprice + '</i></strong></span>');
                } else {
                    // 无免费和促销显示原价
                    $('.book-realprice').html('电子版价格：<span>￥<i class="realprice">' + bookinfo.realprice + '</i></span>');
                }
            }
            if (shopprice.memberisfree == 1) {
                // 会员免费                  
                $('.book-vip-read').show();
                $('.book-vip-free').show();
                $('.book-vip-free').find('.icon').css('display', 'inline-block'); // 尊享图标
                $('.book-vip-free').find('.oldprice').css('display', 'inline-block').find('i').html(bookinfo.realprice); //原价
            }
            if (shopprice.memberisdiscount == 1) {
                if (shopprice.isfree == 1) {
                    countDown(shopprice.currenttime, shopprice.freeendtime, '.book-activity-free');
                    $('.book-realprice').show().html('电子版价格：<span>免费</span><span class="oldprice">原价：<strong>￥<i>' + bookinfo.realprice + '</i></strong></span>');
                } else if (shopprice.issale == 1) {
                    if (shopprice.memberdiscountprice <= shopprice.saleprice) {
                        // 会员折扣价
                        $('.book-vip-sale').show();
                        $('.book-vip-sale').find('.icon').css('display', 'inline-block'); // 尊享图标
                        $('.book-vip-sale').find('.oldprice').css('display', 'inline-block').find('i').html(bookinfo.realprice); //原价   
                        $('.book-vip-sale').find('.realprice').html(shopprice.memberdiscountprice); // 折扣价
                    } else {
                        // 促销活动价
                        countDown(shopprice.currenttime, shopprice.saleendtime, '.book-activity-sale');
                        $('.book-realprice').show().html('电子版价格：<span>￥<i class="realprice">' + shopprice.price + '</i></span><span class="oldprice">原价：<strong>￥<i>' + bookinfo.realprice + '</i></strong></span>');
                    }
                } else {
                    // 会员折扣价
                    $('.book-vip-sale').show();
                    $('.book-vip-sale').find('.icon').css('display', 'inline-block'); // 尊享图标
                    $('.book-vip-sale').find('.oldprice').css('display', 'inline-block').find('i').html(bookinfo.realprice); //原价   
                    $('.book-vip-sale').find('.realprice').html(shopprice.memberdiscountprice); // 折扣价
                }
            }
        }
        var bookInfoHeight = bookInfo.height();
        if (bookInfoHeight < 290) {
            $('.book-infos').css({ position: 'relative', height: 340 });
            $('.book-btns').css({ position: 'absolute', bottom: 0 });
        }
    }else{
        $('.book-realprice').show().html('电子版价格：<span>￥<i class="realprice">' + bookinfo.realprice + '</i></span>');
    }
    
}
//页面滚动到导航处，悬浮显示
var mainNav = $(".main-nav");
var mainNavOffsetTop = mainNav.offset().top;

$(document).scroll(function(){
    var scrollTop = $(window).scrollTop();
    if(scrollTop >= mainNavOffsetTop){
        mainNav.addClass("main-nav-fixed");
    }else{
        mainNav.removeClass("main-nav-fixed");
    }
});
// 导航标签点击定位
$('.main-nav-item').click(function () {
    var index = $(this).index();
    $(this).addClass('main-nav-item-select').siblings().removeClass('main-nav-item-select');
    var $content = $('.main-content .book-detail').children();
    if(mainNav.hasClass("main-nav-fixed")){
        $("html,body").stop(true).animate({"scrollTop":$content.eq(index).offset().top-65},1000);
    }else{
        $("html,body").stop(true).animate({"scrollTop":$content.eq(index).offset().top-65},1000);
    }  
});
// 推荐阅读
function createBookRecommendDom(list) {
    if (list && list.length > 0) {
        var bookRecommendStr = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            bookRecommendStr += '<li><div class="pic"><a href="/detail/bookDetail/' + item.sku + '" target="_blank"><img src="' + item.coverpic + '" width="91" height="128 " alt=" "></a></div><p><a href="/detail/bookDetail/' + item.sku + 'target="_blank">' + item.title.substr(0, 9) + '</a></p></li>';
        }
        bookRecommendList.html(bookRecommendStr);
        slide("#slide", 160, 2400, 400);
    } else {
        $('.suggest').hide();
    }
}

// 图书人气榜
function getBookHotBank() {
    var url = '/detail/getBookHotBank/';
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var bookllist = response.data.bookllist;
                var rows = bookllist.rows;
                if (rows && rows.length > 0) {
                    var bookHotBankStr = '';
                    for (var i = 0; i < rows.length; i++) {
                        var item = rows[i];
                        if (i > 2) {
                            var classNormal = 'sidebar-number-normal';
                        }
                        bookHotBankStr += '<a href="/detail/bookDetail/' + item.sku + '" target="_blank"                                       class="sidebar-item  clearfix"><div class="sidebar-number ' + classNormal + '">' + (i + 1) + '.</div><div class="sidebar-img "><img src="' + item.coverpic + '" alt=" "></div><div class="sidebar-text ">' + item.title + '</div></a>'
                    }
                    bookHotBankList.html(bookHotBankStr);
                }
            }
        }
    });
}

// 获取书评列表
function getCommentList(pageNum) {
    var pageNum = pageNum || 1;
    var url = '/detail/getCommentList/' + id + '?pageNum=' + pageNum;
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            if (response.code == 0) {
                var rows = response.data.rows;
                if (rows && rows.length > 0) {
                    var bookCommentStr = '';
                    for (var i = 0; i < rows.length; i++) {
                        var item = rows[i];
                        bookCommentStr += '<div class="book-comment-item"><div class="book-comment-top clearfix"><div class="comment-img"><img src="' + item.avatar + '" alt=""></div><div class="comment-name">' + item.nickname + '</div><div class="comment-time">' + $.kd.dateFormat(item.addtime) + '</div></div><div class="comment-text">' + item.memo + '</div></div>';
                    }
                    bookCommentList.append(bookCommentStr);
                } else {
                    if (clickcount == 1) {
                        loadingMore.hide();
                    } else {
                        loadingMore.html('没有更多了！');
                        flag = false;
                    }

                }

            }
        }
    });
}

// // 书评加载更多
var clickcount = 1;
var flag = true;
loadingMore.click(function() {
    if (flag) {
        clickcount++;
        getCommentList(clickcount)
    }

});

// 评论文本域输入
commentInput.on("keyup", function() {
    numChange($(this), ".comment-number i", 400);
});

function numChange(inputSelector, wordCountSelector, maxWord) {
    $(inputSelector).attr("maxlength", maxWord);
    var txtval = $.trim($(inputSelector).val());
    var strLen = txtval.length;
    if (strLen > maxWord - 10) {
        $(wordCountSelector).css("color", "red");
        if (strLen > maxWord) {
            $(inputSelector).val(txtval.substr(0, maxWord))
        }
    } else {
        txtval = txtval.replace(/\n/gi, "")
        $(wordCountSelector).css("color", "");
    }
    $(wordCountSelector).html(strLen);
}

// 评分
var score = 5;
layui.use(['rate'], function() {
    var rate = layui.rate;
    rate.render({
        elem: '#rate',
        value: 5,
        text: true,
        setText: function(value) {
            this.span.text(value + "分");
            score = value;
        }
    })
});
commentInput.focus(function () {
    if (isOrg == 'true') {
        layer.msg("当前为机构账号，不支持此操作，请登录个人账号进行相关个性化操作");
    }
});
// 未登录提示 请登陆后发表评论 登录 | 注册
var isCommitComment = false;
if (username == '' || username == 'undefined') {
    $('.comment-block .tip').show();
    commentInput.prop('disabled',true);
}else{
    commentBtn.addClass('active');
    isCommitComment = true;
}
// 提交评论
commentBtn.click(function() {
    if(!isCommitComment) return;
    
    if (isOrg == 'true') {
        layer.msg("当前为机构账号，不支持此操作，请登录个人账号进行相关个性化操作");
        return;
    }
    if (username == '' || username == 'undefined') {
        layer.msg("请登录后评论");
        return;
    };
    var commentText = commentInput.val();
    if (commentText.trim().length == 0) {
        layer.msg("请输入评论内容!");
        return;
    }
    if (commentText.trim().length >= 400) {
        layer.msg("评论内容超出字数限制!");
        return;
    }
    // 查询用户是否绑定手机
    $.ajax({
        url: '/personalCenter/menuInfo',
        dataType: "json",
        type: "GET",
        success: function(response) {
            if (response.code == 0) {
                if (typeof response.data.user.phonenumber == 'undefined' || response.data.user.phonenumber == '') {
                    // 手机号码为空，提示用户绑定手机号
                    var bindPhoneIndex = layer.open({
                        type: 1,
                        closeBtn: false,
                        title: '发布评论需验证手机号',
                        skin: 'layer-verifyphone',
                        area: ['400px', '225px'],
                        shadeClose: true,
                        btn: ['确定', '取消'],
                        btnAlign: 'c',
                        content: $('.layer-verifyphone-content'),
                        yes: function(index, layero) {
                            if (isRegistered == 0) {
                                var phoneNum = phoneNumInput.val().trim();
                                var captchaValue = captcha.val();
                                var bindPhoneUrl = '/personalCenter/updatePhone?phonenumber=' + phoneNum + '&captcha=' + captchaValue;
                                if (captchaValue == '') {
                                    layer.msg('请输入验证码！');
                                } else {
                                    var loadingIndex = layer.load(1, {
                                        shade: [0.1, '#fff'] //0.1透明度的白色背景
                                    });
                                    $.ajax({
                                        url: bindPhoneUrl,
                                        dataType: "json",
                                        type: "get",
                                        success: function(response) {
                                            layer.close(loadingIndex);
                                            if (response.errorCode == 0) {
                                                layer.msg('手机号绑定成功！');
                                                layer.close(bindPhoneIndex);
                                                // 提交评论
                                                submitComment(commentText);
                                            } else if (response.errorCode == -1) {
                                                layer.msg('验证码错误！');
                                            } else {
                                                layer.msg('绑定失败！');
                                            }
                                        }
                                    });
                                }

                            } else {
                                layer.msg('手机号码错误或已注册！');
                            }
                        }
                    });
                } else {
                    // 提交评论
                    submitComment(commentText);
                }
            }
        }
    });
});
// 提交评论
function submitComment(commentText) {
    var loadingLayer = null;
    var url = '/common/commentSubmit/' + id;
    $.ajax({
        type: "get",
        url: url,
        data: {
            content: commentText,
            score: score,
            typeid: 2
        },
        dataType: "json",
        beforeSend: function() {
            loadingLayer = layer.load(2, {
                shade: [0.6, '#fff']
            });
        },
        success: function(response) {
            if (response.code == 0) {
                commentInput.val('');
                $('.comment-number i').text(0);
                layer.msg("提交成功，等待审核后显示！");
            }
        },
        complete: function(XMLHttpRequest, textStatus) {
            if (loadingLayer != undefined && loadingLayer != null) {
                layer.close(loadingLayer);
            }
        }

    });
}
// 验证手机号是否可绑定
phoneNumInput.blur(function() {
    var errorDom = $(this).parents('.item');
    var phoneNum = phoneNumInput.val().trim();
    if (verifyPhoneNum(phoneNum) == -1) {
        errorDom.addClass('error');
        sendCaptcha.removeClass('status2').addClass('status1');
    } else if (verifyPhoneNum(phoneNum) == 0) {
        errorDom.addClass('error');
        sendCaptcha.removeClass('status2').addClass('status1');
    } else {
        var verifyPhoneNumUrl = '/temp/userCenter/verifyPhoneNum?phoneNum=' + phoneNum;
        errorDom.removeClass('error').addClass('correct')
        $.ajax({
            url: verifyPhoneNumUrl,
            dataType: "json",
            type: "get",
            success: function(response) {
                // console.log(response)
                if (response.Code == 1) {
                    isRegistered = 0;
                    errorDom.removeClass('error').addClass('correct');
                    sendCaptcha.removeClass('status1').addClass('status2');
                } else {
                    isRegistered = 1;
                    errorDom.addClass('error');
                }
            },
            error: function(error) {
                //请求出错处理
                console.log(error);
            }
        });
    }
})
limitSendCaptcha(repeatTime);

// 验证码重新发送倒数计时 time为多少秒
function countDownTime(repeatTime, node) {
    var time = repeatTime;
    var timer = setInterval(function() {
        if (repeatTime != 0) {
            node.html('再次发送（' + repeatTime-- + '秒）');
        } else {
            clearInterval(timer);
            node.removeClass('status1').addClass('status2');
            node.html('重新发送');
            limitSendCaptcha(time);
        }

    }, 1000)
}

// 验证码发送后 一分钟后才能再次发送
function limitSendCaptcha(repeatTime) {
    sendCaptcha.click(function() {
        var $this = $(this);
        if (isRegistered == 0) {
            // var errorDom = $(this).parents('.item');
            var phoneNum = phoneNumInput.val().trim();
            if (verifyPhoneNum(phoneNum) == 1) {
                $(this).removeClass('status2').addClass('status1');
                var sendCaptchaUrl = '/temp/userCenter/sendCaptcha?phoneNum=' + phoneNum;
                $.ajax({
                    url: sendCaptchaUrl,
                    dataType: "json",
                    type: "get",
                    success: function(response) {
                        // console.log(response)
                        if (response.errorCode == 1) {
                            // errorDom.html('<span style="color: green;">验证码已发送，请查收短信</span>');
                            layer.msg('验证码已发送，请查收短信');
                            $this.unbind('click');
                            countDownTime(repeatTime, $this);
                        } else {
                            // errorDom.html('该手机号获取验证码已达上限，请明天再试。');
                            layer.msg('该手机号获取验证码已达上限，请明天再试。');
                        }
                    },
                    error: function(error) {
                        //请求出错处理
                        console.log(error);
                    }
                });
            } else {
                // 手机号码有误，不发送
            }
        }

    })
}

// 验证手机号格式
// 返回值 -1 为空，0 格式不正确，1 正确
function verifyPhoneNum(phoneNum) {
    if (!phoneNum) {
        return -1;
    } else if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phoneNum))) {
        return 0;
    } else {
        return 1;
    }
}
// 图书封面大图预览
var bookSmallImg = $('.book-smallimg');
var bookBigImg = $('.book-bigimg');
bookSmallImg.mouseenter(function() {
    $(this).siblings('book-bigimg').stop(true, true);
    //判断元素是否正处于动画状态，如果当前没有进行动画，则添加新动画
    if (bookBigImg.is(":animated") == false) {
        bookBigImg.fadeIn();
    }
});
$('.book-img').mouseleave(function() {
    bookBigImg.fadeOut(500);
});


// 分享
$(".book-share").click(function() {
    if ($(".book-share-more").is(":visible")) {
        $(".book-share-more").hide();
    } else {
        $(".book-share-more").show();
    }
});
// 点击收藏
$('.book-collect').click(function() {
    if (username != 'undefined' && username.length > 0) {
        var $this = $(this);
        var id = bookInfo.attr('data-id');
        var title = $('.book-title').html();
        var index = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        var isCollected = $(this).attr('data-is-collected');
        if (parseInt(isCollected) == 0) {
            getCollectedData(1,5,id,title,index);
        }else{
            // 取消收藏
            collectOrNot(id, 5, isCollected, index, $(this), title);
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
    var title = $('.book-title').html();
    var code = bookInfo.attr('data-id');
    var url = '/detail/isPurchase/' + code + '?ordertype=7';
    if (username == '' || username == 'undefined') {
        location.href = '/temp/userCenter/login';
        return;
    }
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            var isPurchase = response.HasRight;
            if (isPurchase) {
                // 跳到我的已购图书列表
                location.href = encodeURI('/pc/purchased?typeId=3');
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

// 购买
$('#buyBtn1,#buyBtn2').click(function() {
    if (username == '' || username == 'undefined') {
        location.href = '/temp/userCenter/login';
        return;
    }
    var code = bookInfo.attr('data-id');
    var title = $('.book-title').html();
    var coverPic = $('.book-image').attr('src');
    var price = $('.book-realprice').find('.realprice').html();
    var url = '/detail/isPurchase/' + code + '?ordertype=7';
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response) {
            var isPurchase = response.HasRight;
            if (isPurchase) {
                // 跳到我的已购图书列表
                location.href = encodeURI('/pc/purchased?typeId=3');
            } else {
                location.href = encodeURI('/payment/checkout?code=' + code + '&title=' + title + '&ordertype=' + 7 + '&coverPic=' + coverPic + '&price=' + price);
            }
        }
    });
});