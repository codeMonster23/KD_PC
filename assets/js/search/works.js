'use strict';
$(function() {
    const url = decodeURI(location.href);
    const kd = url.substr(url.lastIndexOf('=') + 1);
    const worksWrap = $('.worksWrap');
    const worksList = worksWrap.find('.listWrap .list');
    const num = worksWrap.find('.num strong');
    const filter = $('.search-main .handle .filter');
    const page = $('#sp-page');
    const asideKdh = $('.search-main .aside .kdh');
    const asidePeriod = $('.search-main .aside .period');
    const asideBook = $('.search-main .aside .book');
    const asideMicrobook = $('.search-main .aside .wk');
    const worksType = $('#worksType');
    const worksTypeToggle = $('#worksType').find('p');
    const newOrHot = $('#newOrHot');
    const worksCategory = $('#worksCategory');
    const mediatype = parseInt($('#mediatype').val());

    switch (mediatype) {
        case 9:
            worksTypeToggle.html('类型').attr('data-type', 9);
            break;
        case 2:
            worksTypeToggle.html('图文').attr('data-type', 2);
            break;
        case 3:
            worksTypeToggle.html('音频').attr('data-type', 3);
            break;
        case 4:
            worksTypeToggle.html('视频').attr('data-type', 4);
            break;
        case 5:
            worksTypeToggle.html('图集').attr('data-type', 5);
            break;
    }


    getCollection();
    createWorksDom('', '', '', mediatype);

    function getCollection() {
        const url = encodeURI('/search/getSearchResult?kd=' + kd);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    const { mircbooklist, journallist, bookllist, orglist } = response.data;
                    createMicrobookDom(mircbooklist);
                    createPeriodDom(journallist);
                    createBookDom(bookllist);
                    createKdhDom(orglist);
                }
            }
        });
    }
    // 作品
    function createWorksDom(pageNum, sort, categorycode, type) {
        var pageNum = pageNum || 1;
        var sort = sort || 'id'; //id最新,viewcount 热门
        var type = type || 9;
        var categorycode = categorycode || '';
        const limit = 8;
        const url = `/search/getSearchResult`;
        $.ajax({
            type: "GET",
            url: url,
            data: {
                kd: kd,
                pageNum: pageNum,
                limit: limit,
                sort: sort,
                type: type,
                categorycode: categorycode
            },
            dataType: "json",
            success: function(response) {
                if (response.code == 0) {
                    switch (type) {
                        case 9:
                            var { collectionlist: datalist } = response.data;
                            break;
                        case 2:
                            var { goodessaylist: datalist } = response.data;
                            break;
                        case 3:
                            var { audiolist: datalist } = response.data;
                            break;
                        case 4:
                            var { videolist: datalist } = response.data;
                            break;
                        case 5:
                            var { picslist: datalist } = response.data;
                            break;
                    }
                    const { total, rows } = datalist;
                    let str = '';
                    if (rows && rows.length == 0) {
                        num.html(0);
                        worksList.html('<div class="blank"></div>');
                        page.html('');
                        return;
                    }
                    num.html(total);
                    for (let i = 0; i < rows.length; i++) {
                        const intromemo = rows[i].intromemo.substr(0, 75);
                        str += `<div class="item clearfix">
                                    <a href="/detail/workDetail?id=${rows[i].id}&mediatype=${rows[i].mediatype}" target="_blank" class="img left"><img src="${rows[i].coverpic}" width="250" height="141"><span class="i${rows[i].mediatype}"></span></a>
                                    <div class="info left">
                                        <h1><a href="/detail/workDetail?id=${rows[i].id}&mediatype=${rows[i].mediatype}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kd)}</a></h1>
                                        <p>${$.kd.keywordStyleRed(intromemo, '~#@', '@#~', kd)}</p>
                                        <div class="bottom clearfix">
                                            <a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank" class="jg left"><img src="${rows[i].logopic}" width="22" height="22" align="top">${rows[i].orgname}</a>
                                            <div class="right subinfo">
                                                <a href="javascript:;" class="view">${rows[i].viewcount}</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                    }
                    worksList.html(str);
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
                                <p class="p1"><a href="/kdh/home/${rows[i].orgid}" target="_blank">${rows[i].orgname}</a></p>	
                                <p class="p2">${rows[i].memo}</p>
                            </div>
                        </li>`
            }
        }
        asideKdh.find('.list').html(str);
    }
    // 作品类型
    worksCategory.find('li').on('click', function() {
        const categorycode = $(this).attr('data-id');
        $(this).parent().siblings('p').attr('data-id', categorycode);
        createWorksDom('', '', categorycode, '');
    });
    // 作品类型
    worksType.find('li').on('click', function() {
        const categorycode = worksCategory.find('p').attr('data-id');
        const type = parseInt($(this).attr('data-type'));
        $(this).parent().siblings('p').attr('data-type', type);
        console.log(type);
        newOrHot.find('p').html('最新').attr('data-sort', 'id');
        createWorksDom('', '', categorycode, type);
    });
    // 最新最热
    newOrHot.find('li').on('click', function() {
        const sort = $(this).attr('data-sort');
        $(this).parent().siblings('p').attr('data-sort', sort);
        const categorycode = worksCategory.find('p').attr('data-id');
        const type = parseInt(worksType.find('p').attr('data-type'));
        createWorksDom('', sort, categorycode, type);
    });
    // 页码
    page.on('click', 'a', function() {
        $('body,html').animate({ scrollTop: 0 }, 200);
        const pageNum = $(this).attr('data-page');
        const sort = newOrHot.find('p').attr('data-sort');
        const categorycode = worksCategory.find('p').attr('data-id');
        const type = parseInt(worksType.find('p').attr('data-type'));
        createWorksDom(pageNum, sort, categorycode, type);
    });

});