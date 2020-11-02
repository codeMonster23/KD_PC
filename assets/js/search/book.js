'use strict';
$(function() {
    const url = decodeURI(location.href);
    const kd = url.substr(url.indexOf('=') + 1);
    const bookWrap = $('.bookWrap');
    const bookList = bookWrap.find('.listWrap .list');
    const num = bookWrap.find('.num strong');
    const filter = $('.search-main .handle .filter');
    const page = $('#sp-page');
    const asideKdh = $('.search-main .aside .kdh');
    const asidePeriod = $('.search-main .aside .period');
    const asideMicrobook = $('.search-main .aside .wk');
    const asideWorks = $('.search-main .aside .works');
    getCollection();
    createBookDom();

    function getCollection() {
        const url = encodeURI('/search/getSearchResult?kd=' + kd);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { journallist, mircbooklist, orglist, collectionlist } = response.data;

                    createPeriodDom(journallist);
                    createMicrobookDom(mircbooklist);
                    createKdhDom(orglist);
                    createWorksDom(collectionlist);
                }
            }
        });
    }
    // 图书
    function createBookDom(pageNum, sort) {
        var pageNum = pageNum || 1;
        var sort = sort || '';
        const limit = 25;
        const type = 8;
        const url = '/search/getSearchResult';
        $.ajax({
            type: "GET",
            url: url,
            data: {
                kd: kd,
                pageNum: pageNum,
                limit: limit,
                sort: sort,
                type: type
            },
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { bookllist } = response.data;
                    const { total, rows } = bookllist;
                    let str = '';
                    if (rows && rows.length == 0) {
                        num.html(0);
                        bookList.html('<div class="blank"></div>');
                        page.html('');
                        return;
                    }
                    num.html(total);
                    for (let i = 0; i < rows.length; i++) {
                        str += `<div class="item">
                                    <a href="/detail/bookDetail/${rows[i].sku}" target="_blank"><img src="${rows[i].coverpic}" width="138" height="186"></a>
                                    <p class="p1"><a href="/detail/bookDetail/${rows[i].sku}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kd)}</a></p>
                                    <p class="p2">${rows[i].bookauthor}</p>
                                </div>`
                    }
                    bookList.html(str);
                    const pageStr = $.kd.outputPager(total, limit, 5, pageNum);
                    page.html(pageStr);
                }
            }
        });
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
    // 相关看典号
    function createKdhDom(orglist) {
        const { total, rows } = orglist;
        let str = '';
        if (rows && rows.length == 0) {
            asideKdh.hide();
            return;
        }
        for (let i = 0; i < rows.length; i++) {
            if (i < 3) {
                str += `<li>
                            <a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank" class="img left"><img src="${rows[i].logopic}"></a>
                            <div class="info left">
                                <p class="p1"><a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank">${rows[i].orgname}</a></p>	
                                <p class="p2">${rows[i].memo}</p>
                            </div>
                        </li>`
            }
        }
        asideKdh.find('.list').html(str);
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
        const sort = filter.find('a.cur').attr('data-sort');
        createBookDom(pageNum, sort);
    });
    // 最新最热
    filter.find('a').on('click', function() {
        $(this).addClass('cur').siblings().removeClass('cur');
        const sort = $(this).attr('data-sort');
        createBookDom(1, sort);
    });
});