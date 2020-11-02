'use strict';
$(function() {
    var kd = $.kd.getparams("kd");
    var kw = kd;
    var type = $.kd.getparams("type");

    // 解决接口慢问题拆分为三个接口，先请求微刊和图文作品数据，再请求所有
    getMicrobookData();
    getWorksData();

    // 微刊
    function getMicrobookData() {
        var loadingLayer = null;
        const url = `/search/getSearchResult`;
        $.ajax({
            type: "GET",
            url: url,
            data: {
                kd: kd,
                pageNum: 1,
                limit: 3,
                sort: 'viewcount',
                type: 1
            },
            dataType: "json",
            beforeSend: function() {
                loadingLayer = layer.load(2, {
                    shade: [0.6, '#fff']
                });
            },
            success: function(response) {
                if (response.code == 0) {
                    var mircbooklist = response.data.mircbooklist;
                    const { total, rows } = mircbooklist;
                    if (rows && rows.length > 0) {
                        $('.s1').show();
                        $('.s1 .title h1 i').html(total);
                        let str = '';
                        for (let i = 0; i < rows.length; i++) {
                            str += `<div class="li">
                                        <div class="pic"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank"><img src="${rows[i].coverpic}" width="360" height="160"></a><div class="num"><span class="num1">${rows[i].childcollectioncount}</span><span class="num2">${rows[i].viewcount}</span></div></div>
                                        <div class="name">
                                            <span class="text"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></span>
                                        </div>
                                        <div class="info"><a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank" class="left"><img src="${rows[i].logopic}">${rows[i].orgname}</a><span class="right time">${$.kd.dateFormat(rows[i].submittime)}</span></div>
                                    </div>`
                        }
                        $('.s1 .ul').html(str);
                    }
                    getCollection();
                }
            },
            complete: function(XMLHttpRequest, textStatus) {
                if (loadingLayer != undefined && loadingLayer != null) {
                    layer.close(loadingLayer);
                }
            }
        });
    }

    // 图文作品
    function getWorksData() {
        const url = `/search/getSearchResult`;
        $.ajax({
            type: "GET",
            url: url,
            data: {
                kd: kd,
                pageNum: 1,
                limit: 3,
                sort: 'viewcount',
                type: 2,
                categorycode: ''
            },
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.code == 0) {
                    var goodessaylist = response.data.goodessaylist;
                    const { total, rows } = goodessaylist;
                    if (rows && rows.length > 0) {
                        $('.s2').show();
                        $('.s2 .title h1 i').html(total);
                        let str = '';
                        for (let i = 0; i < rows.length; i++) {
                            const iscollect = rows[i].iscollect;
                            const active = iscollect ? 'active' : '';
                            str += `<div class="li" data-id="${rows[i].id}">
                                        <a href="/detail/workDetail?id=${rows[i].id}&mediatype=1" target="_blank"><img src="${rows[i].coverpic}"></a>
                                        <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=1" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></h2>
                                        <p>${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', kw)}</p>
                                        <div class="bottom">
                                            <span class="name left">${rows[i].author}</span>
                                            <div class="num right">
                                                <a href="javascript:;" class="collect ${active} right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                            </div>
                                        </div>
                                    </div>`;
                        }
                        $('.s2 .ul').html(str);
                    }
                }
            }
        });
    }

    // 0 全部 1 微刊 2好文 3音频 4视频 5图集 6看典号 7期刊 8 图书
    function getCollection() {
        var loadingLayer = null;
        const url = encodeURI('/search/getSearchResult?kd=' + kd);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            beforeSend: function() {
                loadingLayer = layer.load(2, {
                    shade: [0.6, '#fff']
                });
            },
            success: function(response) {
                if (response.code == 0) {
                    const { goodessaylist, articlelist, audiolist, bookllist, journallist, mircbooklist, orglist, picslist, videolist } = response.data;
                    if(goodessaylist.total==0&&articlelist.total==0&&audiolist.total==0&&bookllist.total==0&&journallist.total==0&&mircbooklist.total==0&&orglist.total==0&&picslist.total==0&&videolist.total==0){
                        $('.search-main').html('<div class="blank" style="width:1200px;margin: 0 auto"></div>');
                    }
                    // createMicrobookDom(mircbooklist);
                    // createGoodessayDom(goodessaylist);
                    createVideoDom(videolist);
                    createAudioDom(audiolist);
                    createPicslistDom(picslist);
                    createArticleDom(articlelist);
                    createPeriodDom(journallist);
                    createBookDom(bookllist);
                    createKdhDom(orglist);
                }
            },
            complete: function(XMLHttpRequest, textStatus) {
                if (loadingLayer != undefined && loadingLayer != null) {
                    layer.close(loadingLayer);
                }
            }
        });
    }
    // 微刊
    // function createMicrobookDom(mircbooklist) {
    //     let str = '';
    //     const { total, rows } = mircbooklist;
    //     if (rows && rows.length > 0) {
    //         $('.s1').show();
    //         $('.s1 .title h1 i').html(total);
    //         for (let i = 0; i < rows.length; i++) {
    //             if (i < 3) {
    //                 str += `<div class="li">
    //                             <div class="pic"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank"><img src="${rows[i].coverpic}" width="360" height="160"></a><div class="num"><span class="num1">${rows[i].childcollectioncount}</span><span class="num2">${rows[i].viewcount}</span></div></div>
    //                             <div class="name">
    //                                 <span class="text"><a href="/detail/microBookDetail?id=${rows[i].id}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></span>
    //                             </div>
    //                             <div class="info"><a href="/kdh/home?orgid=${rows[i].orgid}" target="_blank" class="left"><img src="${rows[i].logopic}">${rows[i].orgname}</a><span class="right time">${$.kd.dateFormat(rows[i].submittime)}</span></div>
    //                         </div>`
    //             }
    //         }
    //         $('.s1 .ul').html(str);
    //     }
    // }
    // 图文
    // function createGoodessayDom(goodessaylist) {
    //     let str = '';
    //     const { total, rows } = goodessaylist;
    //     if (rows && rows.length > 0) {
    //         $('.s2').show();
    //         $('.s2 .title h1 i').html(total);
    //         for (let i = 0; i < rows.length; i++) {
    //             if (i < 3) {
    //                 const iscollect = rows[i].iscollect;
    //                 const active = iscollect ? 'active' : '';
    //                 str += `<div class="li" data-id="${rows[i].id}">
    //                             <a href="/detail/workDetail?id=${rows[i].id}&mediatype=1" target="_blank"><img src="${rows[i].coverpic}"></a>
    //                             <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=1" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></h2>
    //                             <p>${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', kw)}</p>
    //                             <div class="bottom">
    //                                 <span class="name left">${rows[i].author}</span>
    //                                 <div class="num right">
    //                                     <a href="javascript:;" class="collect ${active} right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
    //                                 </div>
    //                             </div>
    //                         </div>`
    //             }
    //         }
    //         $('.s2 .ul').html(str);
    //     }
    // }
    // 视频
    function createVideoDom(videolist) {
        let str = '';
        const { total, rows } = videolist;
        if (rows && rows.length > 0) {
            $('.s3').show();
            $('.s3 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 3) {
                    str += `<div class="li">
                                <a href="/detail/workDetail?id=${rows[i].id}&mediatype=3" target="_blank"><img src="${rows[i].coverpic}"></a>
                                <span class="icon"></span>
                                <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=3" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></h2>
                                <p>${$.kd.keywordStyleRed(rows[i].intromemo, '~#@', '@#~', kw)}</p>
                                <div class="bottom">
                                    <span class="name left">${rows[i].author}</span>
                                    <div class="num right">
                                        <a href="javascript:;" class="collect right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                    </div>
                                </div>
                            </div>`
                }
            }
            $('.s3 .ul').html(str);
        }
    }
    // 音频
    function createAudioDom(audiolist) {
        let str = '';
        const { total, rows } = audiolist;
        if (rows && rows.length > 0) {
            $('.s4').show();
            $('.s4 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 4) {
                    str += `<div class="li left">
                                <a class="img" href="/detail/workDetail?id=${rows[i].id}&mediatype=2" target="_blank"><img src="${rows[i].coverpic}"/></a>
                                <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=2" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></h2>
                                <div class="bottom">
                                    <span class="name left">${rows[i].author}</span>
                                    <div class="num right">
                                        <a href="javascript:;" class="collect right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                    </div>
                                </div>
                            </div>`
                }
            }
            $('.s4 .ul').html(str);
        }
    }
    // 图集
    function createPicslistDom(picslist) {
        let str = '';
        const { total, rows } = picslist;
        if (rows && rows.length > 0) {
            $('.s5').show();
            $('.s5 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 4) {
                    var memo = '';
                    if (rows[i].intromemo && rows[i].intromemo.length > 0) {
                        memo = rows[i].intromemo;
                    }
                    if (memo.indexOf(kd) != -1) {
                        memo.replace(/kd/g, '<span class="cRed">' + kd + '</span>')
                    }
                    str += `<div class="li">
                                <a href="/detail/workDetail?id=${rows[i].id}&mediatype=4" target="_blank"><img src="${rows[i].coverpic}"></a>
                                <span class="icon"></span>
                                <h2><a href="/detail/workDetail?id=${rows[i].id}&mediatype=4" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></h2>
                                <p>${memo}</p>
                                <div class="bottom">
                                    <span class="name left">${rows[i].author}</span>
                                    <div class="num right">
                                        <a href="javascript:;" class="collect right">${rows[i].collectcount}</a><span class="view right">${rows[i].viewcount}</span>
                                    </div>
                                </div>
                            </div>`
                }
            }
            $('.s5 .ul').html(str);
        }
    }
    // 文献
    function createArticleDom(articlelist) {
        let str = '';
        const { total, rows } = articlelist;
        if (rows && rows.length > 0) {
            $('.s6').show();
            $('.s6 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 8) {
                    let icon = '';
                    if (rows[i].DownloadFlag == 'pdf') {
                        icon = 'pdf';
                    } else {
                        icon = 'epub';
                    }

                    if (i % 2 == 0) {
                        str += `<div class="li left ${icon}">
                                    <p class="p1"><a href="/literature/literatureDetail?filename=${rows[i].FileName}&dbType=${rows[i].DBName.substring(0,4)}" target="_blank">${$.kd.keywordStyleRed(rows[i].Title, '~#@', '@#~', kw)}</a></p>
                                    <p class="p2">${rows[i].Author}《${rows[i].PublishName}》;${rows[i].Year}年${rows[i].Period}期</p>
                                </div>`
                    } else {
                        str += `<div class="li right ${icon}">
                                    <p class="p1"><a href="/literature/literatureDetail?filename=${rows[i].FileName}&dbType=${rows[i].DBName.substring(0,4)}" target="_blank">${$.kd.keywordStyleRed(rows[i].Title, '~#@', '@#~', kw)}</a></p>
                                    <p class="p2">${rows[i].Author}《${rows[i].PublishName}》;${rows[i].Year}年${rows[i].Period}期</p>
                                </div>`
                    }
                }
            }
            $('.s6 .ul').html(str);
        }
    }
    // 期刊
    function createPeriodDom(journallist) {
        let str = '';
        const { total, rows } = journallist;
        if (rows && rows.length > 0) {
            $('.s7').show();
            $('.s7 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 5) {
                    var link = '';
                    if (rows[i].thName == -1) {
                        link = `/detail/periodDetail/${rows[i].code}`;
                    } else {
                        link = `/detail/singlePeriodDetail/${rows[i].thName}`;
                    }
                    str += `<div class="li">
                                <a href="${link}" target="_blank"><img src="${rows[i].coverpic}"/></a>
                                <p><a href="${link}" target="_blank">${$.kd.keywordStyleRed(rows[i].name, '~#@', '@#~', kw)}</a></p>
                            </div>`
                }
            }
            $('.s7 .ul').html(str);
        }
    }
    // 图书
    function createBookDom(bookllist) {
        let str = '';
        const { total, rows } = bookllist;
        if (rows && rows.length > 0) {
            $('.s8').show();
            $('.s8 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 5) {
                    str += `<div class="li">
                                <a href="/detail/bookDetail/${rows[i].sku}" target="_blank"><img src="${rows[i].coverpic}"></a> 
                                <p><a href="/detail/bookDetail/${rows[i].sku}" target="_blank">${$.kd.keywordStyleRed(rows[i].title, '~#@', '@#~', kw)}</a></p>
                            </div>`
                }
            }
            $('.s8 .ul').html(str);
        }
    }
    // 看典号
    function createKdhDom(orglist) {
        let str = '';
        const { total, rows } = orglist;
        if (rows && rows.length > 0) {
            $('.s9').show();
            $('.s9 .title h1 i').html(total);
            for (let i = 0; i < rows.length; i++) {
                if (i < 5) {
                    str += `<div class="li">
                                <a href="/kdh/home/?orgid=${rows[i].orgid}" target="_blank" class="img left"><img src="${rows[i].logopic}"></a>
                                <div class="info left">
                                    <p class="p1"><a href="/kdh/home/${rows[i].orgid}" target="_blank">${$.kd.keywordStyleRed(rows[i].orgname, '~#@', '@#~', kw)}</a></p>
                                    <p class="p2">${$.kd.keywordStyleRed(rows[i].memo, '~#@', '@#~', kw)}</p>
                                </div>
                            </div>`
                }
            }
            $('.s9 .ul').html(str);
        }
    }
})