(function () {
    initializationCalc();
    $(window).resize(function () {
        calc()
    })
})();

function initializationCalc() {
    calc()


}


function calc(index) {

    // 璁＄畻container楂樺害
    var container = $('.container');
    var windowH = $(window).height();
    var windowW = $(window).width();
    var menuW = $('.menu').width();
    var sidebarW = $('.sidebar').width();
    // container.height(windowH-60);
    container.height(windowH - 64);
    // 璁＄畻鍙充晶瀹藉害
    $('.main').width(windowW - menuW - sidebarW);

    var listWrap = $('.sidebar .listWrap');
    var sidebarH = $('.sidebar').height();
    var btnGroupH = $('.sidebar .btnGroup').outerHeight(true);
    listWrap.height(sidebarH - btnGroupH);
    $('.display').height(windowH - 132);
    $('.preview .display').height(windowH - 64);

    var carouselH = $('.preview .carousel').height();
    var carouselW = $('.preview .carousel').width();

    $('.preview .carousel li').each(function () {
        if (index && index >= 0) {
            if ($(this).index() != index) {
                return true;
            }
        }

        var img = $(this).find('.imgBox > img:eq(0)');
        // if (!img.attr("src") && img.attr("data-src").length > 0) {
        if (!img.attr("src")) {
            img.attr("src", img.attr("data-src"));
            img.load(function () {
                resetImg_2($(this), img, carouselH, carouselW);
            });
        }
        else {
            resetImg_2($(this), img, carouselH, carouselW);
            img.load(function () {
                resetImg_2($(this), img, carouselH, carouselW);
            });
        }
    })

    $('.preview .picBox .btns a').width((windowW - 1100) / 2)
}

$(window).resize(function () {
    calc()
})

function resetImg_2(jqueryThis, img, carouselH, carouselW) {
    var imgW = img.width();
    var imgH = img.height();
    var imgBox = jqueryThis.find('.imgBox');
    //鍒ゆ柇鏄惁鏃嬭浆
    var angle = jqueryThis.attr("data-angle");
    if (angle == "90" || angle == "270") {
        img.css({'max-width': windowH - 84, 'max-height': 1100});
        imgW = img.width();
        imgH = img.height();
        imgBox.width(imgH);
        imgBox.height(imgW);

        if (imgW >= (windowH - 144)) {
            imgBox.css({'margin-top': '10px'})
        } else {
            imgBox.css({'margin-top': (carouselH - 180 - imgH) / 2})
        }
        img.css({'position': 'absolute', 'left': -(imgW - imgH) / 2, 'top': (imgW - imgH) / 2});


    } else {
        imgBox.width(imgW);
        imgBox.height(imgH);
        img.css({'max-height': windowH - 84})
        if (imgH >= (windowH - 144)) {
            img.css({'margin-top': '10px'})
        } else {
            img.css({'margin-top': (carouselH - 80 - imgH) / 2})
        }
        //img.css({ 'margin-left': (carouselW - imgW) / 2 });
    }
}

$('.sidebar .list li,.picManage .list li').hover(function () {
    $(this).toggleClass('cur').find('.icon-group').toggle().siblings('.icon-add').toggle();
});

var groupItem = $('.sidebar:not(.bgm) .group-item');
groupItem.hover(function () {
    $(this).toggleClass('cur');
});
$('.modal5 .addImg .carousel li').click(function () {
    $(this).addClass('cur').siblings().removeClass('cur');
});

// 鍒嗙粍鎶樺彔灞曞紑
var toggleBtn = $('.sidebar .group .icon-toggle');
toggleBtn.click(function () {
    if ($(this).hasClass('unfold')) {
        $(this).removeClass('unfold').addClass('fold');
        $(this).parents('.group-title').siblings('.list').show();
    } else {
        $(this).removeClass('fold').addClass('unfold');
        $(this).parents('.group-title').siblings('.list').hide();
    }
});

// 鍥剧墖鏃嬭浆
$('.picManage .list li .icon-rotate').click(function () {
    var img = $(this).parent().siblings('img');
    if (img.hasClass('vertical')) {
        img.removeClass('vertical');
    } else {
        img.addClass('vertical');
    }
});
// 绠＄悊缂栬緫鎸夐挳鐐瑰嚮鎺у埗鍥剧墖绠＄悊閮ㄥ垎鍒囨崲
var windowH = $(window).height();
$('.btn-manage').click(function () {
    $('.container').hide();
    $('.picManage').animate({'left': 0}, 1000, function () {
        $('.btn-edit').css('display', 'block');
        $('body').css('overflow-y', 'auto');
    });
});
$('.btn-edit').click(function () {
    $('.rightbar').hide();
    $('.picManage').animate({'left': '-100%'}, 1000, function () {
        $('.container').show();
        $('body').css('overflow-y', 'hidden');
        $('html,body').scrollTop(0);
    });
});

$('.preview .thumbnail').hover(function () {
    $(this).toggleClass('hover');
})

var nameW = $('.header .name').width();
$('.header .name').css({'margin-left': -nameW / 2})

$('.preview .picBox li .leftpart,.preview .picBox li .rightpart').hover(function () {
    $(this).toggleClass('hover')
})