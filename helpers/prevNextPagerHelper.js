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

// 页码字符串对象
    var prevNextPage = {
        prevPage: '',
        nextPage: ''
    };

    if (totalItems > 0 && displayNum > 0 && pagerCount > 0 && currentPager > 0) {
        // 计算总共多少页
        var pages = Math.floor(((totalItems - 1) / displayNum) + 1);

        // 当前页码错误，显示第一页
        if (currentPager > pages || currentPager <= 0) {
            currentPager = 1;
        }


        // 当前页不为第一页时，显示上一页
        if (currentPager != 1) {
            if (link) {
                prevNextPage.prevPage += '<a data-page="' + parseInt(currentPager - 1) + '" href="' + encodeURI(link + 'pageNum=' + parseInt(currentPager - 1)) + '">上一页</a>';
            } else {
                prevNextPage.prevPage += '<a data-page="' + parseInt(currentPager - 1) + '" href="javascript:;">上一页</a>';
            }
        }

        // 不为最后一页
        if (currentPager != pages) {
            if (link) {
                prevNextPage.nextPage += '<a data-page="' + parseInt(parseInt(currentPager) + parseInt(1)) + '" href="' + encodeURI(link + 'pageNum=' + parseInt(parseInt(currentPager) + parseInt(1))) + '">下一页</a>';
            } else {
                prevNextPage.nextPage += '<a data-page="' + parseInt(parseInt(currentPager) + parseInt(1)) + '" href="javascript:;">下一页</a>';
            }
        }


        return prevNextPage;
    }else{
        return false;
    }

};