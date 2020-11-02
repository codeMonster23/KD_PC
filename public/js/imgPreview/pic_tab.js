var $ = $.noConflict();

$.fn.banqh = function (can) {
    can = $.extend({
        box: null,
        pic: null,
        pnum: null,
        prev_btn: null,
        next_btn: null,
        prev: null,
        next: null,
        pop_prev: null,
        pop_next: null,
        autoplay: false,
        interTime: 5000,
        delayTime: 800,
        pop_delayTime: 800,
        order: 0,
        picdire: true,
        mindire: true,
        min_picnum: null,
        pop_up: false,
        pop_div: null,
        pop_pic: null,
        pop_xx: null,
        mhc: null,
        num_index: null,
        title_text: null,
        comment_url: null,
        load: null,
    }, can || {});

    picnum = $(can.pic).find('ul li').length;
    picw = $(can.pic).find('ul li').outerWidth(true);
    pich = $(can.pic).find('ul li').outerHeight(true);
    poppicw = $(can.pop_pic).find('ul li').outerWidth(true);
    picminnum = $(can.pnum).find('ul li').length;
    picpopnum = $(can.pop_pic).find('ul li').length;
    picminw = $(can.pnum).find('ul li').outerWidth(true);
    picminh = $(can.pnum).find('ul li').outerHeight(true);
    curNum = $(can.cur_num);
    totalNum = $(can.total_num);
    pictime;
    tpqhnum = 0;
    xtqhnum = 0;
    popnum = 0;
    xteu = 0;
    totalNum.html(picnum);

    $(can.pnum).find('li').click(function () {
        tpqhnum = xtqhnum = $(can.pnum).find('li').index(this);
        show(tpqhnum);
        minshow(xtqhnum, false);
    }).eq(can.order).trigger("click");


    // 点击上一张 下一张

    var mNum = 7;
    $(can.prev_btn).click(function () {
        if (xteu - mNum < 0) {
            xteu = picnum + xteu - mNum + 1;
        } else if (xteu - mNum > 0) {
            xteu = xteu - mNum;
        } else {
            xteu = 0;
        }
        minshow(xteu, true);
    });

    $(can.next_btn).click(function () {

        if (xteu >= picnum - 1) {
            xteu = -1;
        }
        // xteu++;
        if ((xteu + mNum) > picnum) {
            xteu = (xteu + mNum) % picnum - 1;
        } else if ((xteu + mNum) < picnum) {
            xteu = xteu + mNum;
        } else {
            xteu = (xteu + mNum) % picnum;
        }
        minshow(xteu, true);

    });


    $(document).keydown(function (e) {
        if (e.keyCode == 37) {

            if (tpqhnum <= 0) {
                return;
                tpqhnum = picnum
            }
            ;
            if (xtqhnum == 0) {
                xtqhnum = picnum
            }
            ;
            xtqhnum--;
            tpqhnum--;
            show(tpqhnum);
            minshow(xtqhnum, true);
        } else if (e.keyCode == 39) {
            //鍙抽敭
            if (tpqhnum == picnum - 1) {
                return;
                tpqhnum = -1;
            }
            ;
            if (xtqhnum == picnum - 1) {
                xtqhnum = -1
            }
            ;
            xtqhnum++;
            minshow(xtqhnum, true)
            tpqhnum++;
            show(tpqhnum);

        }
    });

    //榧犳爣婊氳疆浜嬩欢
    var scrollFunc = function (e) {
        var stype = $('#hidShowType').val();
        if (stype == "0") {
            return;
        }
        e = e || window.event;
        var val = e.wheelDelta || e.detail;
        if (val == 120 || val == -3) {
            if (tpqhnum <= 0) {
                return;
                tpqhnum = picnum
            }
            ;
            if (xtqhnum == 0) {
                xtqhnum = picnum
            }
            ;
            xtqhnum--;
            tpqhnum--;
            show(tpqhnum);
            minshow(xtqhnum);
        } else if (val == -120 || val == 3) {
            if (tpqhnum == picnum - 1) {
                $('.poptips').show();
                // $('.bottombar').css('visibility', 'hidden');
                return;
                tpqhnum = -1;
            }
            ;
            if (xtqhnum == picnum - 1) {
                // $('.bottombar').css('visibility', 'visible');
                xtqhnum = -1
            }
            ;
            xtqhnum++;
            minshow(xtqhnum)
            tpqhnum++;
            show(tpqhnum);
        }


    }

    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollFunc, false);
    }//W3C
    window.onmousewheel = scrollFunc;//IE/Opera/Chrome

    $('#again').click(function () {
        $('.poptips').hide();
        tpqhnum = -1;
        xtqhnum = -1;
        xtqhnum++;
        minshow(xtqhnum, true)
        tpqhnum++;
        show(tpqhnum);
        curNum.html(1);
    });

    // 上一页
    $(can.prev).click(function () {
        if (tpqhnum <= 0) {
            tpqhnum = picnum
        }
        ;
        if (xtqhnum == 0) {
            xtqhnum = picnum
        }
        ;
        xtqhnum--;
        tpqhnum--;
        show(tpqhnum);
        minshow(xtqhnum, true);

        var index = xtqhnum + 1;
        if (xtqhnum + 1 > picnum) {
            index = xtqhnum + 1 - (picnum);
        }
        curNum.html(index);
    })
    $(can.next).click(function () {
        if (tpqhnum == picnum - 1) {
            return;
            tpqhnum = -1;
        }
        ;
        if (xtqhnum == picnum - 1) {
            xtqhnum = -1
        }
        ;
        xtqhnum++;
        minshow(xtqhnum, true)
        tpqhnum++;
        show(tpqhnum);

        var index = xtqhnum + 1;
        if (xtqhnum + 1 > picnum) {
            index = xtqhnum + 1 - (picnum);
        }
        curNum.html(index);
    })

    function minshow(xtqhnum, flag) {
        var mingdjl_num = xtqhnum % picnum;
        var mingdjl_w = -mingdjl_num * picminw;

        $(can.pnum).find('ul li').css('float', 'left');
        if (flag) {
            if (picminnum > can.min_picnum) {
                $(can.pnum).find('ul').stop().animate({
                    'left': mingdjl_w
                }, can.delayTime);
            }
        } else {
            var index = xtqhnum + 1;
            if (xtqhnum + 1 > picnum) {
                index = xtqhnum + 1 - (picnum);
            }
            curNum.html(index);
        }


    }

    function show(tpqhnum, dir) {
        var imgRange = 3;
        for (var i = ((tpqhnum - imgRange) < 0 ? 0 : (tpqhnum - imgRange)); i < ((tpqhnum + imgRange) >= picnum ? picnum - 1 : (tpqhnum + imgRange)); i++) {
            var tempImg = $($('.imgBox')[i]);
            if (!tempImg.find("img").attr("src") && tempImg.find("img").attr("data-src").length > 0) {
                // console.log("nowimg:" + tpqhnum + ", preloadimg:" + i);
                tempImg.find("img").attr("src", tempImg.find("img").attr("data-src"));
            }
        }

        var gdjl_w = -tpqhnum * picw;
        $(can.pic).find('ul li').css('float', 'left');
        //婊氬姩
        $(can.pic).find('ul').stop().animate({
            'left': gdjl_w
        }, can.delayTime);
        $(can.pnum).find('li').eq(tpqhnum).addClass("on").siblings(this).removeClass("on");
        var text = $(can.pnum).find('li').eq(tpqhnum).attr("data-title");
        $(can.title_text).text(text);
        calc(tpqhnum)

    }
};



