'use strict';
$(function() {
    const kd = decodeURI($.kd.getparams("kd"));
    const kdhWrap = $('.kdhWrap');
    const kdhList = kdhWrap.find('.listWrap .list');
    const page = $('#sp-page');
    const asideMicrobook = $('.search-main .aside .wk');
    const asidePeriod = $('.search-main .aside .period');
    const asideBook = $('.search-main .aside .book');
    const asideWorks = $('.search-main .aside .works');
    const username = $('#username').val();

    getCollection();
    createKdhDom();

    function getCollection() {
        const url = encodeURI('/search/getSearchResult?kd=' + kd);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { journallist, mircbooklist, bookllist, collectionlist } = response.data;
                    createMicrobookDom(mircbooklist);
                    createPeriodDom(journallist);
                    createBookDom(bookllist);
                    createWorksDom(collectionlist);

                }
            }
        });
    }
    // 看典号
    function createKdhDom(pageNum) {
        var pageNum = pageNum || 1;
        const limit = 15;
        const type = 6;
        const url = '/search/getSearchResult';

        $.ajax({
            type: "GET",
            url: url,
            data: {
                kd: kd,
                pageNum: pageNum,
                limit: limit,
                type: type
            },
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { orglist } = response.data;
                    const { total, rows } = orglist;
                    let str = '';
                    if (rows && rows.length == 0) {
                        kdhList.html('<div class="blank"></div>');
                        page.html('');
                        return;
                    }
                    for (let i = 0; i < rows.length; i++) {
                        let concernBtn = `<a href="javascript:;" class="follow" data-orgid="${rows[i].orgid}" data-is-concerned="0">关注</a>`;
                        if (rows[i].isconcern && rows[i].isconcern == 1) {
                            concernBtn = `<a href="javascript:;" class="follow active" data-orgid="${rows[i].orgid}" data-is-concerned="1">已关注</a>`;
                        }
                        str += `<div class="item">
                                    <a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank" class="link">
                                        <img class="cover" src="${rows[i].backgroundpic}">
                                        <img class="logo"  src="${rows[i].logopic}">
                                        <h1>${$.kd.keywordStyleRed(rows[i].orgname, '~#@', '@#~', kd)}</h1>
                                        <p class="p1">${$.kd.keywordStyleRed(rows[i].memo, '~#@', '@#~',kd )}</p>
                                        <p class="p1">作品：${rows[i].collectioncount} | 浏览量：${rows[i].clickcount}</p>
                                    </a> 
                                    ${concernBtn}
                                </div>`
                    }
                    kdhList.html(str);
                    const pageStr = $.kd.outputPager(total, limit, 5, pageNum);
                    page.html(pageStr);
                }
            }
        });

    }
    // 相关微刊
    function createMicrobookDom(mircbooklist) {
        const { total, rows } = mircbooklist;
        let str = '';
        if (rows && rows.length == 0) {
            asideMicrobook.hide();
            return;
        }
        for (let i = 0; i < rows.length; i++) {
            if (i < 3) {
                str += `<li>
                            <a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank"><img src="${rows[i].coverpic}" width="230" height="102"></a>
                            <p><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank">${rows[i].title}</a></p>
                        </li>`
            }
        }
        asideMicrobook.find('.list').html(str);
    }
    // 相关期刊
    function createPeriodDom(journallist) {
        const { total, rows } = journallist;
        let str = '';
        if (rows && rows.length == 0) {
            asidePeriod.hide();
            return;
        }
        for (let i = 0; i < rows.length; i++) {
            if (i < 4) {
                str += `<li>
                            <a href="/detail/periodDetail/${rows[i].code}" target="_blank"><img src="${rows[i].coverpic}" width="90" height="128"></a>
                            <p class="p1"><a href="/detail/periodDetail/${rows[i].code}" target="_blank">${rows[i].name}</a></p>
                            <p class="p2">${rows[i].lastestyear}年${rows[i].lastestperiod}期</p>
                        </li>`
            }
        }
        asidePeriod.find('.list').html(str);
    }
    // 相关图书
    function createBookDom(bookllist) {
        const { total, rows } = bookllist;
        let str = '';
        if (rows && rows.length == 0) {
            asideBook.hide();
            return;
        }
        for (let i = 0; i < rows.length; i++) {
            if (i < 4) {
                str += `<li>
                        <a href="/detail/bookDetail/${rows[i].sku}" target="_blank"><img src="${rows[i].coverpic}" width="90" height="128"></a>
                        <p class="p1"><a href="/detail/bookDetail/${rows[i].sku}" target="_blank">${rows[i].title}</a></p>
                        <p class="p2"><span>${rows[i].bookauthor}</p>
                    </li>`
            }
        }
        asideBook.find('.list').html(str)
    }
    // 相关作品
    function createWorksDom(collectionlist) {
        const { total, rows } = collectionlist;
        let str = '';
        if (rows && rows.length == 0) {
            asideWorks.hide();
            return;
        }
        for (let i = 0; i < rows.length; i++) {
            if (i < 3) {
                str += `<li>
                            <a href="/detail/workDetail?id=${rows[i].id}&mediatype=${rows[i].mediatype}" target="_blank" class="img left"><img src="${rows[i].coverpic}" width="100" height="56"></a>
                            <p class="title left"><a href="/detail/workDetail?id=${rows[i].id}&mediatype=${rows[i].mediatype}" target="_blank">${rows[i].title}</a></p>
                        </li>`
            }
        }
        asideWorks.find('.list').html(str)
    }
    // 页码
    page.on('click', 'a', function() {
        $('body,html').animate({ scrollTop: 0 }, 200);
        const pageNum = $(this).attr('data-page');
        createKdhDom(pageNum);
    });


    // 关注或取消关注
    kdhList.on('click', '.follow', function() {
        if (username == undefined || username == '') {
            layer.msg('请先登录！');
            return;
        }
        var $this = $(this);
        var orgid = $this.attr('data-orgid');
        var index = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        var isConcerned = $(this).attr('data-is-concerned');
        concernOrNot(orgid, 0, isConcerned, index, $this);
    });
    // 关注或者取消关注方法
    function concernOrNot(orgid, typeid, isConcerned, index, pointer) {
        var url = encodeURI('/kdh/addOrCancelConcern/' + orgid + '?typeid=' + typeid + '&isConcerned=' + isConcerned);

        $.ajax({
            url: url,
            dataType: "json",
            type: "GET",
            success: function(response) {
                layer.close(index);
                if (response.code == 0) {
                    layer.close(index);
                    pointer.toggleClass('active');
                    layer.msg(response.data.info);
                    if (response.data.status == 1) {
                        pointer.attr('data-is-concerned', '1').html('已关注');

                    } else if (response.data.status == 0) {
                        pointer.attr('data-is-concerned', '0').html('关注');
                    }
                } else if (response.code == -1) {
                    layer.msg(response.msg)
                } else {
                    console.log('请检查关注或者取消关注方法接口！')
                }
            },
            error: function(error) {
                //请求出错处理
                console.log(error);
            }
        });
    }
})