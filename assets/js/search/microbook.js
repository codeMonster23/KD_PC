'use strict';
$(function() {
    const url = decodeURI(location.href);
    const kd = url.substr(url.indexOf('=') + 1);
    const microBookWrap = $('.microBookWrap');
    const microBookList = microBookWrap.find('.listWrap .list');
    const num = microBookWrap.find('.num strong');
    const filter = $('.search-main .handle .filter');
    const page = $('#sp-page');
    const asideKdh = $('.search-main .aside .kdh');
    const asidePeriod = $('.search-main .aside .period');
    const asideBook = $('.search-main .aside .book');
    const asideWorks = $('.search-main .aside .works');

    getCollection();
    createMicrobookDom();

    function getCollection() {
        const url = encodeURI('/search/getSearchResult?kd=' + kd);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { bookllist, journallist, orglist, collectionlist } = response.data;
                    createKdhDom(orglist);
                    createPeriodDom(journallist);
                    createBookDom(bookllist);
                    createWorksDom(collectionlist);
                }
            }
        });
    }
    // 微刊
    function createMicrobookDom(pageNum, sort) {
        var pageNum = pageNum || 1;
        var sort = sort || 'id';
        const limit = 8;
        const type = 1;

        const url = `/search/getSearchResult`;
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
                    const { mircbooklist } = response.data;
                    const { total, rows } = mircbooklist;
                    let str = '';
                    if (rows && rows.length == 0) {
                        num.html(0);
                        microBookList.html('<div class="blank"></div>');
                        page.html('');
                        return;
                    }
                    num.html(total);
                    for (let i = 0; i < rows.length; i++) {
                        str += `<div class="item">
                                    <div class="pic"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank"><img src="${rows[i].coverpic}" width="420" height="187"></a><div class="num"><span class="num1">${rows[i].childcollectioncount}</span><span class="num2">${rows[i].viewcount}</span></div></div>
                                    <div class="name"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kd)}</a></div>
                                    <p class="intro">${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', kd)}</p>
                                    <div class="info"><a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank" class="left"><img src="${rows[i].logopic}">${rows[i].orgname}</a><span class="right time">${$.kd.dateFormat(rows[i].submittime)}</span></div>
                                </div>`
                    }
                    microBookList.html(str);
                    const pageStr = $.kd.outputPager(total, limit, 5, pageNum);
                    page.html(pageStr);
                }
            }
        });
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
                            <a href="/kdh/home/${rows[i].orgid}" target="_blank" class="img left"><img src="${rows[i].logopic}"></a>
                            <div class="info left">
                                <p class="p1"><a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank">${rows[i].orgname}</a></p>	
                                <p class="p2">${rows[i].memo}</p>
                            </div>
                        </li>`
            }
        }
        asideKdh.find('.list').html(str);
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
        const sort = filter.find('a.cur').attr('data-sort');
        createMicrobookDom(pageNum, sort);
    });
    // 最新最热
    filter.find('a').on('click', function() {
        $(this).addClass('cur').siblings().removeClass('cur');
        const sort = $(this).attr('data-sort');
        createMicrobookDom(1, sort);
    });
});