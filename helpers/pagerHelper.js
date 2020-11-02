// 分页
// totalItems为数据总数，
// displayNum为页面显示数，
// pagerCount为页码显示数,
// currentPager为当前页码
// addr为地址
// options为一个参数对象

module.exports = function (totalItems, displayNum, pagerCount, currentPager, addr, options) {
    // 组合options参数字符串
    if (options) {
        var link = addr + '?';
        for (var key in options) {
            link += key + '=' + options[key] + '&';
        }
    }


    if (totalItems > 0 && displayNum > 0 && pagerCount > 0 && currentPager > 0) {
        // 计算总共多少页
        var pages = Math.floor(((totalItems - 1) / displayNum) + 1);

        // 当前页码错误，显示第一页
        if (currentPager > pages || currentPager <= 0) {
            currentPager = 1;
        }
        // console.log('currentpage:', currentPager, 'pages:', pages)
        // 页码字符串
        var pagerStr = '';
        // 当前页不为第一页时，显示上一页
        if (currentPager != 1) {
            if(link){
                pagerStr += '<a data-page="' + 1 + '" href="'+ link + 'pageNum=1' +'">首页</a>';
                pagerStr += '<a data-page="' + parseInt(currentPager - 1) + '" href="'+ encodeURI(link + 'pageNum='+ parseInt(currentPager - 1)) +'">上一页</a>';
            }else{
                pagerStr += '<a data-page="' + 1 + '" href="javascript:;">首页</a>';
                pagerStr += '<a data-page="' + parseInt(currentPager - 1) + '" href="javascript:;">上一页</a>';
            }
        }
        if(pages <= 5){
            for(let i=1;i<=pages;i++){
                if(currentPager == i){
                    pagerStr += '<span class="current">' + i + '</span>';
                }else{
                    if(link){
                        pagerStr += '<a data-page="' + i + '" href="'+ encodeURI(link + 'pageNum='+ i) +'">' + i + '</a>';
                    }else{
                        pagerStr += '<a data-page="' + i + '" href="javascript:;">' + i + '</a>';
                    }
                }
            }
        }else{
            if(currentPager+2<=pages){
                if(currentPager<5){
                    for(let i=1;i<=5;i++){
                        if(currentPager == i){
                            pagerStr += '<span class="current">' + i + '</span>';
                        }else{
                            if(link){
                                pagerStr += '<a data-page="' + i + '" href="'+ encodeURI(link + 'pageNum='+ i) +'">' + i + '</a>';
                            }else{
                                pagerStr += '<a data-page="' + i + '" href="javascript:;">' + i + '</a>';
                            }
                        }
                    }
                    pagerStr += '<span>...</span>';
                }else{
                    pagerStr += '<span>...</span>';
                    for(let i = currentPager-2;i <currentPager+2;i ++){
                        if(currentPager == i){
                            pagerStr += '<span class="current">' + i + '</span>';
                        }else{
                            if(link){
                                pagerStr += '<a data-page="' + i + '" href="'+ encodeURI(link + 'pageNum='+ i) +'">' + i + '</a>';
                            }else{
                                pagerStr += '<a data-page="' + i + '" href="javascript:;">' + i + '</a>';
                            }
                        }
                    }
                    pagerStr += '<span>...</span>';
                }
            }else{
                pagerStr += '<span>...</span>';
                for(let i =currentPager-2;i <=pages;i ++){
                    if(currentPager == i){
                        pagerStr += '<span class="current">' + i + '</span>';
                    }else{
                        if(link){
                            pagerStr += '<a data-page="' + i + '" href="'+ encodeURI(link + 'pageNum='+ i) +'">' + i + '</a>';
                        }else{
                            pagerStr += '<a data-page="' + i + '" href="javascript:;">' + i + '</a>';
                        }
                    }
                }
            }
        }
        // 总页面大于要显示的页码数
        // if (pages >= pagerCount) {
        //     // console.log('总页面大于要显示的页码数',(parseInt(currentPager) + parseInt(pagerCount) - 1))
        //     if (parseInt(parseInt(currentPager) + parseInt(pagerCount) - 1) <= pages) { //页码可以全部显示
        //         // console.log('页码可以全部显示')
        //         for (var j = currentPager; j < parseInt(currentPager) + parseInt(pagerCount); j++) {
        //             if (currentPager == j) {
        //                 pagerStr += '<span class="current">' + j + '</span>';
        //             } else {
        //                 if(link){
        //                     pagerStr += '<a data-page="' + j + '" href="'+ encodeURI(link + 'pageNum='+ j) +'">' + j + '</a>';
        //                 }else{
        //                     pagerStr += '<a data-page="' + j + '" href="javascript:;">' + j + '</a>';
        //                 }

        //             }
        //         }
        //         pagerStr += '<span>...</span>';
        //     } else {
        //         // console.log('页码不可以全部显示')
        //         for (var j = parseInt(pages - pagerCount + 1); j <= pages; j++) { //页码显示不全
        //             if (currentPager == j) {
        //                 pagerStr += '<span class="current">' + j + '</span>';
        //             } else {
        //                 if(link){
        //                     pagerStr += '<a data-page="' + j + '" href="'+ encodeURI(link + 'pageNum='+ j )+'">' + j + '</a>';
        //                 }else{
        //                     pagerStr += '<a data-page="' + j + '" href="javascript:;">' + j + '</a>';
        //                 }
        //             }
        //         }
        //     }
        // } else {// 总页面小于要显示的页码数
        //     // console.log('总页面小于要显示的页码数')
        //     for (var i = 1; i <= pages; i++) {
        //         if (currentPager == i) {
        //             pagerStr += '<span class="current">' + i + '</span>';
        //         } else {
        //             if(link){
        //                 pagerStr += '<a data-page="' + i + '" href="'+ encodeURI(link + 'pageNum='+ i) +'">' + i + '</a>';
        //             }else{
        //                 pagerStr += '<a data-page="' + i + '" href="javascript:;">' + i + '</a>';
        //             }

        //         }
        //     }
        // }

        // 不为最后一页
        if (currentPager != pages) {
            if(link){
                pagerStr += '<a data-page="' + parseInt(parseInt(currentPager) + parseInt(1)) + '" href="'+ encodeURI(link + 'pageNum='+ parseInt(parseInt(currentPager) + parseInt(1))) +'">下一页</a><a data-page="' + pages + '" href="'+ link +'pageNum='+ pages +'">尾页</a>';
            }else{
                pagerStr += '<a data-page="' + parseInt(parseInt(currentPager) + parseInt(1)) + '" href="javascript:;">下一页</a><a data-page="' + pages + '" href="javascript:void(0);">尾页</a>';
            }

        }
        return pagerStr;
    }

};